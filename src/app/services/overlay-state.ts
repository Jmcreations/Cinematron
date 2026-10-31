import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MediaSelection {
  id: number;
  type: 'movie' | 'tv';
}

@Injectable({ providedIn: 'root' })
export class OverlayStateService {
  private authOpen = new BehaviorSubject<boolean>(false);
  private detailsOpen = new BehaviorSubject<boolean>(false);

  // Track both ID and type instead of just a number
  private selectedMedia = new BehaviorSubject<MediaSelection | null>(null);

  authOpen$ = this.authOpen.asObservable();
  detailsOpen$ = this.detailsOpen.asObservable();
  selectedMedia$ = this.selectedMedia.asObservable();

  setAuthOpen(isOpen: boolean) {
    this.authOpen.next(isOpen);
  }

  setDetailsOpen(isOpen: boolean) {
    this.detailsOpen.next(isOpen);
  }

  // Accept the media type (defaulting to 'movie' for backward compatibility)
  openDetails(id: number, type: 'movie' | 'tv' = 'movie') {
    this.selectedMedia.next({ id, type });
    this.detailsOpen.next(true);
  }
}
