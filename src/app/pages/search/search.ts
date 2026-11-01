import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MovieService, TMDBMovie } from '../../services/movie';
import { MovieCardComponent } from '../../components/movie-card/movie-card';
import { OverlayStateService } from '../../services/overlay-state';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, MovieCardComponent],
  templateUrl: './search.html'
})
export class SearchComponent implements OnInit {
  route = inject(ActivatedRoute);
  movieService = inject(MovieService);
  overlayService = inject(OverlayStateService);
  titleService = inject(Title);
  changeDetector = inject(ChangeDetectorRef);

  query = '';
  results: TMDBMovie[] = [];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      this.titleService.setTitle(`Search: ${this.query} - Cinematron`);

      if (this.query) {
        this.movieService.searchMovies(this.query).subscribe(data => {
          this.results = data;
          this.changeDetector.markForCheck();
        });
      } else {
        this.results = [];
      }
    });
  }

  openDetails(event: any) {
    const id = typeof event === 'number' ? event : event.id;
    const type = event.type || 'movie';
    this.overlayService.openDetails(id, type);
  }
}
