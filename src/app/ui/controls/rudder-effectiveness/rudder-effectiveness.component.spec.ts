import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RudderEffectivenessComponent } from './rudder-effectiveness.component';

describe('RudderEffectivenessComponent', () => {
  let component: RudderEffectivenessComponent;
  let fixture: ComponentFixture<RudderEffectivenessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RudderEffectivenessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RudderEffectivenessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
