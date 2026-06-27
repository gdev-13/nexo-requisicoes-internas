import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { AppLayout } from '../../components/app-layout/app-layout';
import { UserResponse, UserRole, UserRoleHistoryResponse,
} from '../../models/auth';
import { AdminUserService } from '../../services/admin-user.service';

@Component({
  selector: 'app-admin-role-history',
  imports: [AppLayout, DatePipe],
  templateUrl: './admin-role-history.html',
  styleUrl: './admin-role-history.css',
})
export class AdminRoleHistory implements OnInit {
  history = signal<UserRoleHistoryResponse[]>([]);
  currentUser = signal<UserResponse | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private readonly adminUserService: AdminUserService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  setCurrentUser(user: UserResponse | null): void {
    this.currentUser.set(user);
  }

  loadHistory(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminUserService
      .getRoleHistory()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (history) => {
          this.history.set(history);
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

  getUserName(name: string | null): string {
    return name ?? 'Usuário removido';
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error?.detail === 'string') {
      return error.error.detail;
    }

    return 'Não foi possível carregar o histórico. Tente novamente mais tarde.';
  }
}