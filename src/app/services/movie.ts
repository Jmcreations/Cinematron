import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);
  
  // You will replace this with your actual TMDB key
  private apiKey = '05916533013b535783201d9df06b544c'; 
  private baseUrl = 'https://api.themoviedb.org/3';

  getTrendingMovies(): Observable<TMDBMovie[]> {
    return this.http.get<any>(`${this.baseUrl}/trending/movie/week?api_key=${this.apiKey}`)
      .pipe(map(response => response.results));
  }

  getImageUrl(path: string, width: string = 'w500'): string {
    return `https://image.tmdb.org/t/p/${width}${path}`;
  }

  getNowPlayingMovies(): Observable<TMDBMovie[]> {
  return this.http.get<any>(`${this.baseUrl}/movie/now_playing?api_key=${this.apiKey}`)
    .pipe(map(res => res.results));
  }
  getMovieDetails(id: number): Observable<any> {
  // Fetches core details, cast, and video links simultaneously
  return this.http.get<any>(`${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&append_to_response=credits,videos`);}

  getGenres(): Observable<any[]> {
  return this.http.get<any>(`${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}`)
    .pipe(map(res => res.genres));
}

getMoviesByGenre(genreId: number): Observable<TMDBMovie[]> {
  return this.http.get<any>(`${this.baseUrl}/discover/movie?api_key=${this.apiKey}&with_genres=${genreId}`)
    .pipe(map(res => res.results));
}

  searchMovies(query: string): Observable<TMDBMovie[]> {
  return this.http.get<any>(`${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`)
    .pipe(map(res => res.results));}
}