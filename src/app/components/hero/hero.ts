import { ChangeDetectorRef, Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OverlayStateService } from '../../services/overlay-state';
import { MovieService, TMDBMovie } from '../../services/movie';
import { IconComponent } from '../icon/icon';
import { WatchlistService } from '../../services/watchlist';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './hero.html'
})
export class HeroComponent implements OnInit, OnDestroy {
  overlayService = inject(OverlayStateService);
  watchlistService = inject(WatchlistService);
  movieService = inject(MovieService);
  platformId = inject(PLATFORM_ID);
  private changeDetector = inject(ChangeDetectorRef);

  movies: TMDBMovie[] = [];
  heroIndex = 0;
  previousMovie: TMDBMovie | null = null;
  saved = false;

  private timer: any;
  private transitionTimer: any;
  private swipeResetTimer: any;
  private pointerStartX = 0;
  private pointerStartY = 0;
  private suppressClick = false;
  timerDuration = 8000;

  ngOnInit() {
    this.movieService.getTrendingMovies().subscribe(data => {
      this.movies = data.slice(0, 6);
      this.resetTimer();
      this.checkSavedState(); // Check saved state for the initial slide
      this.changeDetector.markForCheck();
    });
  }

  ngOnDestroy() {
    this.clearTimer();
    clearTimeout(this.transitionTimer);
    clearTimeout(this.swipeResetTimer);
  }

  startTimer() {
    this.clearTimer();
    this.timer = setInterval(() => {
      this.changeHero((this.heroIndex + 1) % this.movies.length);
    }, this.timerDuration);
  }

  checkSavedState() {
    if (this.movies.length && this.movies[this.heroIndex]) {
      this.saved = this.watchlistService.hasMovie(this.movies[this.heroIndex].id);
    }
  }

  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  resetTimer() {
    if (this.movies.length && isPlatformBrowser(this.platformId)) {
      this.startTimer();
    }
  }

  nextHero() {
    if (this.consumeSwipeClick()) {
      return;
    }
    this.changeHero((this.heroIndex + 1) % this.movies.length);
    this.resetTimer();
  }

  prevHero() {
    if (this.consumeSwipeClick()) {
      return;
    }
    this.changeHero((this.heroIndex - 1 + this.movies.length) % this.movies.length);
    this.resetTimer();
  }

  setHeroIndex(i: number) {
    if (this.consumeSwipeClick()) {
      return;
    }
    this.changeHero(i);
    this.resetTimer();
  }

  onPointerDown(event: PointerEvent) {
    if (!event.isPrimary) {
      return;
    }

    this.pointerStartX = event.clientX;
    this.pointerStartY = event.clientY;
  }

  onPointerUp(event: PointerEvent) {
    if (!event.isPrimary) {
      return;
    }

    const horizontalDistance = event.clientX - this.pointerStartX;
    const verticalDistance = event.clientY - this.pointerStartY;
    if (Math.abs(horizontalDistance) < 50 || Math.abs(horizontalDistance) <= Math.abs(verticalDistance)) {
      return;
    }

    event.preventDefault();
    this.suppressClick = true;
    clearTimeout(this.swipeResetTimer);
    this.swipeResetTimer = setTimeout(() => {
      this.suppressClick = false;
    }, 0);

    if (horizontalDistance < 0) {
      this.changeHero((this.heroIndex + 1) % this.movies.length);
    } else {
      this.changeHero((this.heroIndex - 1 + this.movies.length) % this.movies.length);
    }
    this.resetTimer();
  }

  onPointerCancel() {
    this.pointerStartX = 0;
    this.pointerStartY = 0;
  }

  private consumeSwipeClick() {
    if (!this.suppressClick) {
      return false;
    }

    this.suppressClick = false;
    return true;
  }

  private changeHero(index: number) {
    if (index === this.heroIndex || !this.movies.length) {
      return;
    }
    this.previousMovie = this.movies[this.heroIndex];
    this.heroIndex = index;
    this.checkSavedState(); // Update saved state for the new slide
    this.changeDetector.markForCheck();
    clearTimeout(this.transitionTimer);
    this.transitionTimer = setTimeout(() => {
      this.previousMovie = null;
      this.changeDetector.markForCheck();
    }, 700);
  }

  openDetails(event: any) {
    const id = typeof event === 'number' ? event : event.id;
    const type = event.type || 'movie';
    this.overlayService.openDetails(id, type);
  }

  toggleSaved() {
    if (this.consumeSwipeClick()) {
      return;
    }
    const currentMovie = this.movies[this.heroIndex];
    if (currentMovie) {
      this.saved = this.watchlistService.toggleMovie({
        ...currentMovie,
        media_type: currentMovie.media_type || 'movie'
      });
      this.changeDetector.markForCheck();
    }
  }
}
