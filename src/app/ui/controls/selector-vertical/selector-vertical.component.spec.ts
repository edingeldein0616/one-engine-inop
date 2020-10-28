import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorVerticalComponent } from './selector-vertical.component';

describe('SelectorVerticalComponent', () => {
  let component: SelectorVerticalComponent;
  let fixture: ComponentFixture<SelectorVerticalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectorVerticalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectorVerticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
