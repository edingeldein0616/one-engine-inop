import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDcvComponent } from './view-dcv.component';

describe('ViewDcvComponent', () => {
  let component: ViewDcvComponent;
  let fixture: ComponentFixture<ViewDcvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewDcvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDcvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
