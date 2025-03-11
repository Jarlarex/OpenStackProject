import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmodelFormComponent } from './submodel-form.component';

describe('SubmodelFormComponent', () => {
  let component: SubmodelFormComponent;
  let fixture: ComponentFixture<SubmodelFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmodelFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubmodelFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
