import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService, TMDBMovie } from '../../services/movie';
import { MovieCardComponent } from '../../components/movie-card/movie-card';
import { IconComponent } from '../../components/icon/icon';
import { StarRatingComponent } from '../../components/star-rating/star-rating';
import { OverlayStateService } from '../../services/overlay-state';
import { catchError, of, switchMap, timeout } from 'rxjs';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [CommonModule, MovieCardComponent, IconComponent, StarRatingComponent],
  templateUrl: './watch.html',
  styleUrl: './watch.css'
})
export class WatchComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  location = inject(Location);
  movieService = inject(MovieService);
  overlayService = inject(OverlayStateService);
  sanitizer = inject(DomSanitizer);
  changeDetector = inject(ChangeDetectorRef);

  movie: any = null;
  videoUrl: SafeResourceUrl | null = null;
  similarMovies: TMDBMovie[] = [];
  
  loading = true;
  loadError = false;
  isPlaying = false;
  userRating = 0;

  currentMovieId: number | null = null;
  activeServerIndex = 0;

  // Add or modify server URLs here
  servers = [
    { name: 'VidSrc (Main)', getUrl: (id: number) => `https://vidsrc.me/embed/movie?tmdb=${id}` },
    { name: 'Coconut', getUrl: (id: number) => `https://watch.embed-api.stream/embed/movie/533535` },
    { name: 'SuperEmbed (Alt 2)', getUrl: (id: number) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1` }
  ];

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (!id) {
          this.router.navigate(['/']);
          return of(null);
        }
        
        this.loading = true;
        this.loadError = false;
        this.movie = null;
        this.videoUrl = null;
        this.similarMovies = [];
        this.changeDetector.markForCheck();
        
        return this.movieService.getMovieDetails(id).pipe(
          timeout(15000),
          catchError(error => {
            console.error('Unable to load watch page', error);
            this.loadError = true;
            return of(null);
          })
        );
      })
    ).subscribe(data => {
      if (!data) {
        this.loading = false;
        this.changeDetector.markForCheck();
        return;
      }
      
      this.movie = data;
      this.isPlaying = false;
      this.currentMovieId = data.id;
      
      // Set default server (Index 0)
      this.setServer(0);
      
      if (this.movie.genres?.length) {
        this.movieService.getMoviesByGenre(this.movie.genres[0].id).subscribe(movies => {
          this.similarMovies = movies.slice(0, 4);
          this.changeDetector.markForCheck(); 
        });
      }
      
      this.loading = false;
      this.changeDetector.markForCheck();
    });
  }

  setServer(index: number) {
    if (this.currentMovieId) {
      this.activeServerIndex = index;
      const url = this.servers[index].getUrl(this.currentMovieId);
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.changeDetector.markForCheck();
    }
  }

  playVideo() {
    if (this.videoUrl) {
      this.isPlaying = true;
      this.changeDetector.markForCheck();
    }
  }

  goBack() {
    this.location.back();
  }

  openDetails(id: number) {
    this.overlayService.openDetails(id);
  }
}