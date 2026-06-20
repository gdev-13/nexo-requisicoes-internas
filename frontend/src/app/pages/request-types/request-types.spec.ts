import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestTypes } from './request-types';

describe('RequestTypes', () => {
  let component: RequestTypes;
  let fixture: ComponentFixture<RequestTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestTypes],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
