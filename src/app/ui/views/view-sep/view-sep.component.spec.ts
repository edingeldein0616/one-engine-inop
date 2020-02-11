import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSepComponent } from './view-sep.component';

describe('ViewSepComponent', () => {
  let component: ViewSepComponent;
  let fixture: ComponentFixture<ViewSepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
