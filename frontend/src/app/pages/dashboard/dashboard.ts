import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppLayout } from '../../components/app-layout/app-layout';
import { UserResponse } from '../../models/auth';

@Component({
  selector: 'app-dashboard',
  imports: [AppLayout, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  currentUser = signal<UserResponse | null>(null);

  setCurrentUser(user: UserResponse | null): void {
    this.currentUser.set(user);
  }

  isRequester(): boolean {
    return this.currentUser()?.role === 'REQUESTER';
  }
}