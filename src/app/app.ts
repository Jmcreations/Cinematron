import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { AuthModal } from './components/auth-modal/auth-modal';
import { MovieDetailsComponent } from './components/movie-details/movie-details';
import { OverlayStateService } from './services/overlay-state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, AuthModal, MovieDetailsComponent],
  templateUrl: './app.html'
})
export class AppComponent {
  overlayService = inject(OverlayStateService);
  router = inject(Router);

  get isWatchPage() {
    return this.router.url.includes('/watch');
  }
}