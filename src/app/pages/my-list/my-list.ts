import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieCardComponent } from '../../components/movie-card/movie-card';
import { MovieService, TMDBMovie } from '../../services/movie';
import { OverlayStateService } from '../../services/overlay-state';
import { IconComponent } from '../../components/icon/icon';

@Component({
  selector: 'app-my-list',
  standalone: true,
  imports: [CommonModule, IconComponent, MovieCardComponent],
  templateUrl: './my-list.html'
})
export class MyListComponent implements OnInit {
  movieService = inject(MovieService);
  overlayService = inject(OverlayStateService);
  private changeDetector = inject(ChangeDetectorRef);
  
  continueWatching: TMDBMovie[] = [];
  watchlist: TMDBMovie[] = [];

  ngOnInit() {
    this.movieService.getNowPlayingMovies().subscribe(data => {
      // Mock user lists until the backend is hooked up
      this.continueWatching = data.slice(0, 3);
      this.watchlist = data.slice(3, 11);
      this.changeDetector.markForCheck();
    });
  }

  openDetails(id: number) {
    this.overlayService.openDetails(id);
  }
}