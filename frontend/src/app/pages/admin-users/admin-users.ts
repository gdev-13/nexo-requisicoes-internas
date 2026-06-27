import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { AppLayout } from '../../components/app-layout/app-layout';
import { AdminUserResponse, UserResponse, UserRole } from '../../models/auth';
import { AdminUserService } from '../../services/admin-user.service';

@Component({
  selector: 'app-admin-users',
  imports: [AppLayout, DatePipe],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers implements OnInit {
  users = signal<AdminUserResponse[]>([]);
  currentUser = signal<UserResponse | null>(null);
  isLoading = signal(false);
  updatingUserId = signal<number | null>(null);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(private readonly adminUserService: AdminUserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  setCurrentUser(user: UserResponse | null): void {
    this.currentUser.set(user);
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.adminUserService
      .getUsers()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (users) => {
          this.users.set(users);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.getErrorMessage(error));
        },
      });
  }

  updateRole(user: AdminUserResponse): void {
    const nextRole = this.getNextRole(user.role);

    if (!nextRole) {
      return;
    }

    this.updatingUserId.set(user.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.adminUserService
      .updateUserRole(user.id, { role: nextRole })
      .pipe(finalize(() => this.updatingUserId.set(null)))
      .subscribe({
        next: (updatedUser) => {
          this.users.update((users) =>
            users.map((currentUser) =>
              currentUser.id === updatedUser.id ? updatedUser : currentUser,
            ),
          );

          this.successMessage.set(
            `Perfil de ${updatedUser.name} atualizado para ${this.getRoleLabel(updatedUser.role)}.`,
          );
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.getErrorMessage(error));
        },
      });
  }

  getRoleLabel(role: UserRole): string {
    const roleLabels: Record<UserRole, string> = {
      REQUESTER: 'Requisitante',
      ANALYST: 'Analista',
      ADMIN: 'Administrador',
    };

    return roleLabels[role];
  }

  getRoleActionLabel(user: AdminUserResponse): string {
    if (user.role === 'REQUESTER') {
      return 'Tornar analista';
    }

    if (user.role === 'ANALYST') {
      return 'Tornar requisitante';
    }

    return 'Ação indisponível';
  }

  canUpdateRole(user: AdminUserResponse): boolean {
    return !user.is_current_user && user.role !== 'ADMIN';
  }

  private getNextRole(role: UserRole): 'REQUESTER' | 'ANALYST' | null {
    if (role === 'REQUESTER') {
      return 'ANALYST';
    }

    if (role === 'ANALYST') {
      return 'REQUESTER';
    }

    return null;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error?.detail === 'string') {
      return error.error.detail;
    }

    return 'Não foi possível processar a solicitação. Tente novamente mais tarde.';
  }
}