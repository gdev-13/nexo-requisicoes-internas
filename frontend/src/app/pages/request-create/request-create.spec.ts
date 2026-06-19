import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestCreate } from './request-create';

describe('RequestCreate', () => {
  let component: RequestCreate;
  let fixture: ComponentFixture<RequestCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
