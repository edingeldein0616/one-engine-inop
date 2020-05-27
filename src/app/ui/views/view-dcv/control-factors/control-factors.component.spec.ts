import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlFactorsComponent } from './control-factors.component';

describe('ControlFactorsComponent', () => {
  let component: ControlFactorsComponent;
  let fixture: ComponentFixture<ControlFactorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlFactorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlFactorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
