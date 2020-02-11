import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCefComponent } from './view-cef.component';

describe('ViewCefComponent', () => {
  let component: ViewCefComponent;
  let fixture: ComponentFixture<ViewCefComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCefComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
