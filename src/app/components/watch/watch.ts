import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  imports: [CommonModule, RouterModule, MovieCardComponent, IconComponent, StarRatingComponent],
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

  mediaType: 'movie' | 'tv' = 'movie';
  media: any = null;
  videoUrl: SafeResourceUrl | null = null;
  similarMovies: TMDBMovie[] = [];

  seasons: any[] = [];
  episodes: any[] = [];
  activeSeason = 1;
  activeEpisode = 1;

  activeServerIndex = 0;
  isPlaying = false;
  loading = true;
  loadError = false;
  userRating = 0;

  // Unified Server Config
  servers = [
    {
      name: 'VidSrc',
      getMovieUrl: (tmdb_id: number) => `https://vidsrc.me/embed/movie?tmdb=${tmdb_id}`,
      getTvUrl: (tmdb_id: number, s: number, e: number) => `https://vidsrc.me/embed/tv?tmdb=${tmdb_id}&season=${s}&episode=${e}`
    },
    {
      name: 'VidCore',
      getMovieUrl: (tmdb_id: number) => `https://vidcore.org/embed/movie/${tmdb_id}`,
      getTvUrl: (tmdb_id: number, season: number, episode: number) => `https://vidcore.org/embed/tv/${tmdb_id}/${season}/${episode}`
    },
    {
      name: 'Vidlink',
      getMovieUrl: (tmdb_id: number) => `https://vidlink.pro/movie/${tmdb_id}`,
      getTvUrl: (tmdb_id: number, season: number, episode: number) => `https://vidlink.pro/tv/${tmdb_id}/${season}/${episode}`
    },
    {
      name: 'Vidstreams',
      getMovieUrl: (tmdb_id: number) => `https://vidstreams.net/embed/${tmdb_id}`,
      getTvUrl: (tmdb_id: number, season: number, episode: number) => `https://vidstreams.net/embed/tv/${tmdb_id}/${season}/${episode}`
    },
    {
      name: 'VixSrc',
      getMovieUrl: (tmdb_id: number) => `https://vixsrc.to/movie/${tmdb_id}`,
      getTvUrl: (tmdb_id: number, season: number, episode: number) => `https://vixsrc.to/tv/${tmdb_id}/${season}/${episode}`
    }
  ];

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const type = (params.get('type') || 'movie') as 'movie' | 'tv';
        const tmdb_id = Number(params.get('tmdb_id') || params.get('id'));
        if (!tmdb_id) return of(null);

        this.mediaType = type;
        this.loading = true;
        this.changeDetector.markForCheck();

        const fetchRequest$ = this.mediaType === 'tv'
          ? this.movieService.getTvDetails(tmdb_id)
          : this.movieService.getMovieDetails(tmdb_id);

        return fetchRequest$.pipe(
          timeout(15000),
          catchError(error => {
            console.error('API Error', error);
            this.loadError = true;
            return of(null);
          })
        );
      })
    ).subscribe(data => {
      if (!data) return;

      this.media = data;
      this.isPlaying = false;
      this.activeEpisode = 1;

      if (this.mediaType === 'tv') {
        this.seasons = data.seasons?.filter((s: any) => s.season_number > 0) || [];
        if (this.seasons.length > 0) this.loadSeason(this.seasons[0].season_number);
      }

      if (this.media.genres?.length) {
        this.movieService.getMoviesByGenre(this.media.genres[0].id).subscribe(movies => {
          this.similarMovies = movies.slice(0, 4);
          this.changeDetector.markForCheck();
        });
      }

      this.loading = false;
      this.changeDetector.markForCheck();
    });
  }

  loadSeason(seasonNumber: number) {
    this.activeSeason = seasonNumber;
    this.movieService.getTvSeason(this.media.id, seasonNumber).subscribe(seasonData => {
      this.episodes = seasonData.episodes || [];
      this.changeDetector.markForCheck();
    });
  }

  updateVideoUrl() {
    if (!this.media) return;
    const server = this.servers[this.activeServerIndex];
    const url = this.mediaType === 'tv'
      ? server.getTvUrl(this.media.id, this.activeSeason, this.activeEpisode)
      : server.getMovieUrl(this.media.id);

    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.changeDetector.markForCheck();
  }

  playContent(episodeNumber = 1) {
    this.activeEpisode = episodeNumber;
    this.isPlaying = true;
    this.updateVideoUrl();
  }

  setServer(index: number) {
    this.activeServerIndex = index;
    if (this.isPlaying) this.updateVideoUrl();
  }

  goBack() { this.location.back(); }
  openDetails(id: number) { this.overlayService.openDetails(id); }
}
