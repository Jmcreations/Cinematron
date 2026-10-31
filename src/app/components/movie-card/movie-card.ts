// movie-card.component.ts
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService, TMDBMovie } from '../../services/movie';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './movie-card.html'
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: TMDBMovie;
  @Input() rank?: number;
  @Input() showRemove = false;
  @Output() cardClick = new EventEmitter<{id: number, type: 'movie' | 'tv'}>();


  movieService = inject(MovieService);
}
