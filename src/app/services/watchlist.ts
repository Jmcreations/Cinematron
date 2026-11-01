import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TMDBMovie } from './movie';

const STORAGE_KEY = 'cinematron.watchlist';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private platformId = inject(PLATFORM_ID);

  getMovies(): TMDBMovie[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const movies = stored ? JSON.parse(stored) : [];
      return Array.isArray(movies) ? movies : [];
    } catch (error) {
      console.error('Unable to read watchlist', error);
      return [];
    }
  }

  hasMovie(id: number): boolean {
    return this.getMovies().some(movie => movie.id === id);
  }

  toggleMovie(movie: TMDBMovie): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const movies = this.getMovies();
    const isSaved = movies.some(item => item.id === movie.id);
    const updatedMovies = isSaved
      ? movies.filter(item => item.id !== movie.id)
      : [movie, ...movies];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMovies));
    } catch (error) {
      console.error('Unable to save watchlist', error);
    }

    return !isSaved;
  }

  removeMovie(movieId: number): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      const movies = this.getMovies().filter(movie => movie.id !== movieId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
    } catch (error) {
      console.error('Unable to remove movie from watchlist', error);
    }
  }
}
