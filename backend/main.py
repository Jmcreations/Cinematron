from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow Angular to communicate with the Python server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Data Models for now
class Rating(BaseModel):
    movie_id: int
    score: int

class WatchlistItem(BaseModel):
    movie_id: int

@app.get("/")
def read_root():
    return {"message": "Vellum API is running"}

@app.post("/api/auth/google")
def google_auth(token: str):
    # TODO: Verify Google OAuth token securely
    return {"user_id": 1, "email": "user@example.com", "session_token": "mock_jwt_token"}

@app.post("/api/ratings")
def submit_rating(rating: Rating):
    # TODO: Save to SQLAlchemy database
    return {"status": "success", "movie_id": rating.movie_id, "score": rating.score}

@app.post("/api/watchlist")
def add_to_watchlist(item: WatchlistItem):
    # TODO: Save to SQLAlchemy database
    return {"status": "success", "movie_id": item.movie_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)