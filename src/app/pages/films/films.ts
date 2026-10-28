import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieCardComponent } from '../../components/movie-card/movie-card';
import { MovieService, TMDBMovie } from '../../services/movie';
import { OverlayStateService } from '../../services/overlay-state';

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
movies: any;

  ngOnInit() {
    this.movieService.getTrendingMovies().subscribe(data => {
      // Simulate different category rows with sliced data for now
      this.trending = data.slice(0, 10);
      this.scifi = data.slice(5, 15);
      this.changeDetector.markForCheck();
    });
  }

  openDetails(id: number) {
    this.overlayService.openDetails(id);
  }
}