import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string; // TV shows use 'name' instead of 'title'
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string; // TV shows use 'first_air_date'
  vote_average: number;
  media_type?: 'movie' | 'tv'; // Returned by multi-search
}

export type MediaType = 'movie' | 'tv';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);
  private baseUrl = '/api/tmdb/3';

  getTrendingMovies(): Observable<TMDBMovie[]> {
    return this.http.get<any>(`${this.baseUrl}/trending/all/week`)
      .pipe(
        map(response => response.results.filter((item: any) => item.media_type !== 'person')),
        catchError(error => {
          console.error('Unable to load trending media', error);
          return of([]);
        })
      );
  }

  getImageUrl(path: string, width: string = 'w500'): string {
    return `https://image.tmdb.org/t/p/${width}${path}`;
  }

  getTitle(media: Pick<TMDBMovie, 'title' | 'name'>): string {
    return media.title || media.name || 'Untitled';
  }

  getReleaseDate(media: Pick<TMDBMovie, 'release_date' | 'first_air_date'>): string {
    return media.release_date || media.first_air_date || '';
  }

  getMediaType(media: Pick<TMDBMovie, 'media_type'>): MediaType {
    return media.media_type || 'movie';
  }

  getNowPlayingMovies(): Observable<TMDBMovie[]> {
    return this.http.get<any>(`${this.baseUrl}/movie/now_playing`)
    .pipe(
      map(res => res.results.map((m: any) => ({ ...m, media_type: 'movie' }))),
      catchError(error => {
        console.error('Unable to load now-playing movies', error);
        return of([]);
      })
    );
  }

  getMovieDetails(tmdb_id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/movie/${tmdb_id}?append_to_response=credits,videos`);
  }

  getGenres(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/genre/movie/list`)
    .pipe(map(res => res.genres));
  }

  getMoviesByGenre(genreId: number): Observable<TMDBMovie[]> {
    return this.http.get<any>(`${this.baseUrl}/discover/movie?with_genres=${genreId}`)
    .pipe(map(res => res.results.map((m: any) => ({ ...m, media_type: 'movie' }))));
  }

  // Updated to multi-search to fetch both TV and Movies
  searchMovies(query: string): Observable<TMDBMovie[]> {
    return this.http.get<any>(`${this.baseUrl}/search/multi?query=${encodeURIComponent(query)}`)
    .pipe(map(res => res.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')));
  }

  getTvDetails(tmdb_id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/tv/${tmdb_id}?append_to_response=credits,videos,external_ids`);
  }

  getTvSeason(tmdb_id: number, seasonNumber: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/tv/${tmdb_id}/season/${seasonNumber}`);
  }
}
