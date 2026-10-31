import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { OverlayStateService } from '../../services/overlay-state';
import { MovieService, TMDBMovie } from '../../services/movie';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent,],
  templateUrl: './navbar.html'
})
export class NavbarComponent {
  overlayService = inject(OverlayStateService);
  movieService = inject(MovieService);
  private changeDetector = inject(ChangeDetectorRef);
  router = inject(Router);

  setAuth(isOpen: boolean) {
    this.overlayService.setAuthOpen(isOpen);
  }

  searchResults: TMDBMovie[] = [];
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => query ? this.movieService.searchMovies(query) : of([]))
    ).subscribe(results => {
      this.searchResults = results.slice(0, 5);
      this.changeDetector.markForCheck();
    });
  }

  onSearch(event: Event) {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  selectResult(result: TMDBMovie) {
    this.overlayService.openDetails(result.id, this.movieService.getMediaType(result));
    this.searchResults = []; // Clear dropdown
  }

  submitSearch(event: Event) {
  const query = (event.target as HTMLInputElement).value;
  if (query.trim()) {
    this.searchResults = []; // Close dropdown
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }
}
}
