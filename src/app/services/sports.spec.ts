import { TestBed } from '@angular/core/testing';

import { Sports } from './sports';

describe('Sports', () => {
  let service: Sports;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sports);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
