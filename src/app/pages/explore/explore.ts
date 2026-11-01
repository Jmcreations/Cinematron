import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService, TMDBMovie } from '../../services/movie';
import { MovieCardComponent } from '../../components/movie-card/movie-card';
import { OverlayStateService } from '../../services/overlay-state';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './explore.html'
})
export class ExploreComponent implements OnInit {
  movieService = inject(MovieService);
  overlayService = inject(OverlayStateService);
  titleService = inject(Title);
  changeDetector = inject(ChangeDetectorRef);

  genres: any[] = [];
  movies: TMDBMovie[] = [];
  activeGenreId: number | null = null;

  ngOnInit() {
    this.titleService.setTitle('Explore - Cinematron');
    this.movieService.getGenres().subscribe(data => {
      this.genres = data;
      this.changeDetector.markForCheck();
    });
    this.loadTrending();
  }

  loadTrending() {
    this.activeGenreId = null;
    this.movieService.getTrendingMovies().subscribe(data => {
      this.movies = data;
      this.changeDetector.markForCheck();
    });
  }

  loadGenre(id: number, name: string) {
    this.activeGenreId = id;
    this.titleService.setTitle(`Explore ${name} - Cinematron`);
    this.movieService.getMoviesByGenre(id).subscribe(data => {
      this.movies = data;
      this.changeDetector.markForCheck();
    });
  }

  openDetails(event: any) {
    const id = typeof event === 'number' ? event : event.id;
    const type = event.type || 'movie';
    this.overlayService.openDetails(id, type);
  }
}
