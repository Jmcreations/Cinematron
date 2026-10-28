import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TMDBMovie } from './movie';

const STORAGE_KEY = 'cinematron.continue-watching';

@Injectable({ providedIn: 'root' })
export class WatchHistoryService {
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
      console.error('Unable to read watch history', error);
      return [];
    }
  }

  addMovie(movie: TMDBMovie): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const movies = [movie, ...this.getMovies().filter(item => item.id !== movie.id)].slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
    } catch (error) {
      console.error('Unable to save watch history', error);
    }
  }
}
