import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AppLayout } from '../../components/app-layout/app-layout';
import { UserResponse } from '../../models/auth';
import {
  RequestHistoryResponse,
  RequestStatus,
} from '../../models/internal-request';
import { InternalRequestService } from '../../services/internal-request.service';

@Component({
  selector: 'app-request-history',
  imports: [AppLayout, DatePipe, RouterLink],
  templateUrl: './request-history.html',
  styleUrl: './request-history.css',
})
export class RequestHistory implements OnInit {
  currentUser = signal<UserResponse | null>(null);
  history = signal<RequestHistoryResponse[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  constructor(private readonly internalRequestService: InternalRequestService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  setCurrentUser(user: UserResponse | null): void {
    this.currentUser.set(user);
  }

  isAnalyst(): boolean {
    return this.currentUser()?.role === 'ANALYST';
  }

  getStatusLabel(status: RequestStatus): string {
    const statusLabels: Record<RequestStatus, string> = {
      SOLICITADA: 'Solicitada',
      EM_ANALISE: 'Em análise',
      APROVADA: 'Aprovada',
      RECUSADA: 'Recusada',
      CONCLUIDA: 'Concluída',
      CANCELADA: 'Cancelada',
    };

    return statusLabels[status];
  }

  getHistoryTitle(item: RequestHistoryResponse): string {
    if (!item.previous_status) {
      return `Requisição criada como ${this.getStatusLabel(item.new_status)}`;
    }

    return `${this.getStatusLabel(item.previous_status)} → ${this.getStatusLabel(item.new_status)}`;
  }

  private loadHistory(): void {
    this.internalRequestService
      .getGeneralHistory()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (history) => {
          this.history.set(history);
        },
        error: () => {
          this.errorMessage.set('Não foi possível carregar o histórico.');
        },
      });
  }
}