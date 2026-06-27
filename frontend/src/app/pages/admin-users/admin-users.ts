import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { AppLayout } from '../../components/app-layout/app-layout';
import { AdminUserResponse, UserResponse, UserRole } from '../../models/auth';
import { AdminUserService } from '../../services/admin-user.service';
import { ConfirmationModal } from '../../components/confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-admin-users',
  imports: [AppLayout, DatePipe, ConfirmationModal],
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
  selectedUserForRoleUpdate = signal<AdminUserResponse | null>(null);

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

  openRoleConfirmation(user: AdminUserResponse): void {
    if (!this.canUpdateRole(user)) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.selectedUserForRoleUpdate.set(user);
  }

  closeRoleConfirmation(): void {
    if (this.isUpdatingSelectedUser()) {
      return;
    }

    this.selectedUserForRoleUpdate.set(null);
  }

  confirmRoleUpdate(): void {
    const selectedUser = this.selectedUserForRoleUpdate();

    if (!selectedUser) {
      return;
    }

    this.updateRole(selectedUser);
  }

  updateRole(user: AdminUserResponse): void {
    const nextRole = this.getNextRole(user.role);

    if (!nextRole) {
      this.selectedUserForRoleUpdate.set(null);
      return;
    }

    this.updatingUserId.set(user.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.adminUserService
      .updateUserRole(user.id, { role: nextRole })
      .pipe(
        finalize(() => {
          this.updatingUserId.set(null);
          this.selectedUserForRoleUpdate.set(null);
        }),
      )
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

  getRoleModalTitle(): string {
    const selectedUser = this.selectedUserForRoleUpdate();

    if (!selectedUser) {
      return 'Confirmar alteração de perfil';
    }

    return `Alterar perfil de ${selectedUser.name}?`;
  }

  getRoleModalMessage(): string {
    const selectedUser = this.selectedUserForRoleUpdate();

    if (!selectedUser) {
      return '';
    }

    const nextRole = this.getNextRole(selectedUser.role);

    if (!nextRole) {
      return '';
    }

    return `Essa ação alterará o perfil de ${selectedUser.name} para ${this.getRoleLabel(nextRole)}. Confirme apenas se essa mudança de permissão estiver correta.`;
  }

  getRoleModalConfirmLabel(): string {
    const selectedUser = this.selectedUserForRoleUpdate();

    if (!selectedUser) {
      return 'Confirmar';
    }

    const nextRole = this.getNextRole(selectedUser.role);

    if (!nextRole) {
      return 'Confirmar';
    }

    return `Confirmar: ${this.getRoleLabel(nextRole)}`;
  }

  getRoleModalVariant(): 'primary' | 'danger' {
    const selectedUser = this.selectedUserForRoleUpdate();

    if (selectedUser?.role === 'ANALYST') {
      return 'danger';
    }

    return 'primary';
  }

  isUpdatingSelectedUser(): boolean {
    const selectedUser = this.selectedUserForRoleUpdate();

    return !!selectedUser && this.updatingUserId() === selectedUser.id;
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