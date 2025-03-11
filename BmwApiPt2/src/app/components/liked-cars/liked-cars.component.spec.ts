import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LikedCarsComponent } from './liked-cars.component';

describe('LikedCarsComponent', () => {
  let component: LikedCarsComponent;
  let fixture: ComponentFixture<LikedCarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikedCarsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LikedCarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
