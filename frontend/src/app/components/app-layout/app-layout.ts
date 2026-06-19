import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { UserResponse } from '../../models/auth';
import { AuthStorageService } from '../../services/auth-storage.service';
import { AuthService } from '../../services/auth.service';
import { AppSidebar } from '../app-sidebar/app-sidebar';

@Component({
  selector: 'app-layout',
  imports: [AppSidebar],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout implements OnInit {
  isSidebarOpen = false;

  isLoadingUser = signal(true);
  currentUser = signal<UserResponse | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly authStorageService: AuthStorageService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  openSidebar(): void {
    this.isSidebarOpen = true;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  private loadCurrentUser(): void {
    this.authService
      .getCurrentUser()
      .pipe(
        finalize(() => {
          this.isLoadingUser.set(false);
        }),
      )
      .subscribe({
        next: (user) => {
          this.currentUser.set(user);
        },
        error: () => {
          this.authStorageService.clearToken();
          this.router.navigate(['/login']);
        },
      });
  }
}