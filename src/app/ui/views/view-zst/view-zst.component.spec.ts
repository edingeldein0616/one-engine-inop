import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewZstComponent } from './view-zst.component';

describe('ViewZstComponent', () => {
  let component: ViewZstComponent;
  let fixture: ComponentFixture<ViewZstComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewZstComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewZstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
