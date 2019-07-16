import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BPJSPage } from './bpjs.page';

describe('BPJSPage', () => {
  let component: BPJSPage;
  let fixture: ComponentFixture<BPJSPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BPJSPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BPJSPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
