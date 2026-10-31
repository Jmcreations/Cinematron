import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieCardComponent } from '../../components/movie-card/movie-card';
import { MovieService, TMDBMovie } from '../../services/movie';
import { OverlayStateService } from '../../services/overlay-state';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-films',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './films.html'
})
export class FilmsComponent implements OnInit {
  movieService = inject(MovieService);
  overlayService = inject(OverlayStateService);
  private changeDetector = inject(ChangeDetectorRef);

  trending: TMDBMovie[] = [];
  scifi: TMDBMovie[] = [];

  genres = ['All films', 'Drama', 'Science Fiction', 'Thriller', 'Documentary'];
  activeGenre = 'All films';
  movies: TMDBMovie[] = [];

  ngOnInit() {
    forkJoin({
      trending: this.movieService.getTrendingMovies(),
      scifi: this.movieService.getMoviesByGenre(878)
    }).pipe(
      catchError(error => {
        console.error('Unable to load film collections', error);
        return of({ trending: [], scifi: [] });
      })
    ).subscribe(({ trending, scifi }) => {
      this.movies = trending.slice(0, 10);
      this.trending = trending.slice(0, 10);
      this.scifi = scifi.slice(0, 10);
      this.changeDetector.markForCheck();
    });
  }

  openDetails(event: any) {
    const id = typeof event === 'number' ? event : event.id;
    const type = event.type || 'movie';
    this.overlayService.openDetails(id, type);
  }
}
