import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { UserResponse, UserRole } from '../../models/auth';
import { AuthStorageService } from '../../services/auth-storage.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.html',
  styleUrl: './app-sidebar.css',
})
export class AppSidebar {
  @Input() isOpen = false;
  @Input() isLoadingUser = false;
  @Input() currentUser: UserResponse | null = null;

  @Output() closeSidebar = new EventEmitter<void>();

  constructor(
    private readonly authStorageService: AuthStorageService,
    private readonly router: Router,
  ) {}

  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }

  onLogout(): void {
    this.authStorageService.clearToken();
    this.onCloseSidebar();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  getRoleLabel(role: UserRole): string {
    const roleLabels: Record<UserRole, string> = {
      REQUESTER: 'Requisitante',
      ANALYST: 'Analista',
    };

    return roleLabels[role];
  }
}