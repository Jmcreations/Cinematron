import { Component, inject } from '@angular/core';
import { OverlayStateService } from '../../services/overlay-state';
import { IconComponent } from '../icon/icon';
@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './auth-modal.html'
})
export class AuthModal {
  overlayService = inject(OverlayStateService);

  closeAuth() {
    this.overlayService.setAuthOpen(false);
  }
}