import { TestBed } from '@angular/core/testing';

import { OverlayStateService } from './overlay-state';

describe('OverlayStateService', () => {
  let service: OverlayStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverlayStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
