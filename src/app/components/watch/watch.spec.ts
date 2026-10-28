import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Watch } from './watch';

describe('Watch', () => {
  let component: Watch;
  let fixture: ComponentFixture<Watch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Watch],
    }).compileComponents();

    fixture = TestBed.createComponent(Watch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
