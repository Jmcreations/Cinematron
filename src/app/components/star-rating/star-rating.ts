import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.html'
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Output() ratingChange = new EventEmitter<number>();
  stars = [1, 2, 3, 4, 5];
  hoverRating = 0;

  setRating(star: number, event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const value = event.offsetX <= target.offsetWidth / 2 ? star - 0.5 : star;
    this.rating = value;
    this.ratingChange.emit(this.rating);
  }

  onMouseMove(star: number, event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    this.hoverRating = event.offsetX <= target.offsetWidth / 2 ? star - 0.5 : star;
  }

  onMouseLeave() {
    this.hoverRating = 0;
  }

  getFill(star: number): number {
    const activeRating = this.hoverRating || this.rating;
    return Math.max(0, Math.min(1, activeRating - star + 1));
  }
}
