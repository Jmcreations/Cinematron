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
  private baseUrl = '/api/tmdb/3';

  getTrendingMovies(): Observable<TMDBMovie[]> {
    return this.http.get<any>(`${this.baseUrl}/trending/movie/week`)
      .pipe(map(response => response.results));
  }

  getImageUrl(path: string, width: string = 'w500'): string {
    return `https://image.tmdb.org/t/p/${width}${path}`;
  }

  getNowPlayingMovies(): Observable<TMDBMovie[]> {
    return this.http.get<any>(`${this.baseUrl}/movie/now_playing`)
    .pipe(map(res => res.results));
  }
  getMovieDetails(id: number): Observable<any> {
  // Fetches core details, cast, and video links simultaneously
    return this.http.get<any>(`${this.baseUrl}/movie/${id}?append_to_response=credits,videos`);}

  getGenres(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/genre/movie/list`)
    .pipe(map(res => res.genres));
}
  getMoviesByGenre(genreId: number): Observable<TMDBMovie[]> {
  return this.http.get<any>(`${this.baseUrl}/discover/movie?with_genres=${genreId}`)
    .pipe(map(res => res.results));}

  searchMovies(query: string): Observable<TMDBMovie[]> {
    return this.http.get<any>(`${this.baseUrl}/search/movie?query=${encodeURIComponent(query)}`)
    .pipe(map(res => res.results));
  }

  getTvDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/tv/${id}?append_to_response=credits,videos,external_ids`);
  }

  getTvSeason(seriesId: number, seasonNumber: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/tv/${seriesId}/season/${seasonNumber}`);
  }
}