import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OverlayStateService {
  private authOpen = new BehaviorSubject<boolean>(false);
  private detailsOpen = new BehaviorSubject<boolean>(false);
  private selectedMovieId = new BehaviorSubject<number | null>(null);

  authOpen$ = this.authOpen.asObservable();
  detailsOpen$ = this.detailsOpen.asObservable();
  selectedMovieId$ = this.selectedMovieId.asObservable();

  setAuthOpen(isOpen: boolean) { this.authOpen.next(isOpen); }
  setDetailsOpen(isOpen: boolean) { this.detailsOpen.next(isOpen); }
  
  openDetails(id: number) {
    this.detailsOpen.next(true);
    this.selectedMovieId.next(id);
  }
}