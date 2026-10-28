import os
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, UniqueConstraint
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from pydantic import BaseModel

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# 1. Database Setup (SQLite for local development)
default_database_url = (
    "sqlite:////tmp/cinematron.db"
    if os.getenv("VERCEL")
    else "sqlite:///./cinematron.db"
)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or default_database_url
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif SQLALCHEMY_DATABASE_URL.startswith("postgresql://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine_options = {"pool_pre_ping": True}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite://"):
    engine_options["connect_args"] = {"check_same_thread": False}
engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. SQLAlchemy Models (Database Tables)
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)

class RatingDB(Base):
    __tablename__ = "ratings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    media_id = Column(Integer, index=True)
    media_type = Column(String) # 'movie' or 'tv'
    score = Column(Integer)
    # Prevents a user from rating the same movie twice; triggers an update instead
    __table_args__ = (UniqueConstraint('user_id', 'media_id', 'media_type', name='_user_media_uc'),)

class WatchlistDB(Base):
    __tablename__ = "watchlist"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    media_id = Column(Integer, index=True)
    media_type = Column(String)
    __table_args__ = (UniqueConstraint('user_id', 'media_id', 'media_type', name='_user_watchlist_uc'),)

def initialize_database():
    try:
        Base.metadata.create_all(bind=engine)
    except OperationalError as error:
        if "already exists" not in str(error).lower():
            raise


# Create tables in the database. A concurrent cold start may win the same
# CREATE TABLE race; that specific outcome is safe to continue from.
initialize_database()

# 3. Pydantic Models (Frontend Payload Validation)
class RatingCreate(BaseModel):
    media_id: int
    media_type: str = "movie"
    score: int

class WatchlistItemCreate(BaseModel):
    media_id: int
    media_type: str = "movie"

# 4. FastAPI Setup
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:4200").split(",")
        if origin.strip()
    ],
    allow_origin_regex=r"https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to open and close database sessions per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 5. API Endpoints
@app.get("/")
def read_root():
    return {"message": "Cinematron API is running with SQLite database"}


async def proxy_tmdb_request(tmdb_path: str, request: Request):
    api_key = os.getenv("TMDB_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="TMDB_API_KEY is not configured")
    if not tmdb_path.startswith("3/"):
        raise HTTPException(status_code=404, detail="Unsupported TMDB API path")

    params = dict(request.query_params)
    params["api_key"] = api_key
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                f"https://api.themoviedb.org/{tmdb_path}",
                params=params,
            )
    except httpx.HTTPError as error:
        raise HTTPException(status_code=502, detail="TMDB request failed") from error

    return Response(
        content=response.content,
        status_code=response.status_code,
        media_type=response.headers.get("content-type", "application/json"),
    )


@app.get("/tmdb/{tmdb_path:path}")
async def tmdb_proxy(tmdb_path: str, request: Request):
    return await proxy_tmdb_request(tmdb_path, request)


@app.get("/api/tmdb/{tmdb_path:path}")
async def api_tmdb_proxy(tmdb_path: str, request: Request):
    return await proxy_tmdb_request(tmdb_path, request)

@app.post("/api/auth/google")
def google_auth(email: str, db: Session = Depends(get_db)):
    # Check if user exists, create them if they don't
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
    return {"user_id": user.id, "email": user.email, "session_token": f"token_for_{user.id}"}

@app.post("/api/ratings")
def submit_rating(rating: RatingCreate, user_id: int = 1, db: Session = Depends(get_db)):
    # Upsert logic: Update the score if it exists, otherwise create a new entry
    existing = db.query(RatingDB).filter_by(user_id=user_id, media_id=rating.media_id, media_type=rating.media_type).first()
    if existing:
        existing.score = rating.score
    else:
        new_rating = RatingDB(user_id=user_id, media_id=rating.media_id, media_type=rating.media_type, score=rating.score)
        db.add(new_rating)
    db.commit()
    return {"status": "success", "media_id": rating.media_id, "score": rating.score}

@app.post("/api/watchlist")
def add_to_watchlist(item: WatchlistItemCreate, user_id: int = 1, db: Session = Depends(get_db)):
    existing = db.query(WatchlistDB).filter_by(user_id=user_id, media_id=item.media_id, media_type=item.media_type).first()
    if not existing:
        new_item = WatchlistDB(user_id=user_id, media_id=item.media_id, media_type=item.media_type)
        db.add(new_item)
        db.commit()
    return {"status": "added", "media_id": item.media_id}

@app.delete("/api/watchlist")
def remove_from_watchlist(media_id: int, media_type: str = "movie", user_id: int = 1, db: Session = Depends(get_db)):
    db.query(WatchlistDB).filter_by(user_id=user_id, media_id=media_id, media_type=media_type).delete()
    db.commit()
    return {"status": "removed", "media_id": media_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)