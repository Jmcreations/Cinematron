// movie-grid.component.ts
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService, TMDBMovie } from '../../services/movie';
import { MovieCardComponent } from '../movie-card/movie-card';
import { OverlayStateService } from '../../services/overlay-state';

@Component({
  selector: 'app-movie-grid',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './movie-grid.html'
})
export class MovieGridComponent implements OnInit {
  movieService = inject(MovieService);
  overlayService = inject(OverlayStateService);
  private changeDetector = inject(ChangeDetectorRef);
  movies: TMDBMovie[] = [];

  ngOnInit() {
    this.movieService.getNowPlayingMovies().subscribe(data => {
      this.movies = data.slice(0, 12); // Render a 12-movie grid
      this.changeDetector.markForCheck();
    });
  }

  openDetails(event: any) {
    const id = typeof event === 'number' ? event : event.id;
    const type = event.type || 'movie';
    this.overlayService.openDetails(id, type);
  }
}
