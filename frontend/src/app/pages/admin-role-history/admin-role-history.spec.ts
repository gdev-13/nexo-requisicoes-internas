import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRoleHistory } from './admin-role-history';

describe('AdminRoleHistory', () => {
  let component: AdminRoleHistory;
  let fixture: ComponentFixture<AdminRoleHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRoleHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminRoleHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
