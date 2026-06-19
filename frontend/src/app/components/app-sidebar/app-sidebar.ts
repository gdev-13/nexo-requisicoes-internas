import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { UserResponse, UserRole } from '../../models/auth';

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

  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }

  getRoleLabel(role: UserRole): string {
    const roleLabels: Record<UserRole, string> = {
      REQUESTER: 'Requisitante',
      ANALYST: 'Analista',
    };

    return roleLabels[role];
  }
}