import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AppLayout } from '../../components/app-layout/app-layout';
import { UserResponse } from '../../models/auth';
import {
  InternalRequestResponse,
  RequestHistoryResponse,
  RequestPriority,
  RequestStatus,
} from '../../models/internal-request';
import { InternalRequestService } from '../../services/internal-request.service';
import { RequestTypeService } from '../../services/request-type.service';

@Component({
  selector: 'app-dashboard',
  imports: [AppLayout, RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  currentUser = signal<UserResponse | null>(null);
  requests = signal<InternalRequestResponse[]>([]);
  history = signal<RequestHistoryResponse[]>([]);
  activeRequestTypesCount = signal(0);

  isLoading = signal(true);
  errorMessage = signal('');

  constructor(
    private readonly internalRequestService: InternalRequestService,
    private readonly requestTypeService: RequestTypeService,
  ) {}

  setCurrentUser(user: UserResponse | null): void {
    this.currentUser.set(user);

    if (user) {
      this.loadDashboardData(user);
    }
  }

  isRequester(): boolean {
    return this.currentUser()?.role === 'REQUESTER';
  }

  isAnalyst(): boolean {
    return this.currentUser()?.role === 'ANALYST';
  }

  getTotalRequests(): number {
    return this.requests().length;
  }

  getRequestsInAnalysis(): number {
    return this.requests().filter((request) => request.status === 'EM_ANALISE').length;
  }

  getCompletedRequests(): number {
    return this.requests().filter((request) => request.status === 'CONCLUIDA').length;
  }

  getLatestRequests(): InternalRequestResponse[] {
    return this.requests().slice(0, 5);
  }

  getLatestHistory(): RequestHistoryResponse[] {
    return this.history().slice(0, 5);
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

  getPriorityLabel(priority: RequestPriority): string {
    const priorityLabels: Record<RequestPriority, string> = {
      BAIXA: 'Baixa',
      MEDIA: 'Média',
      ALTA: 'Alta',
      URGENTE: 'Urgente',
    };

    return priorityLabels[priority];
  }

  getStatusClass(status: RequestStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  getHistoryTitle(item: RequestHistoryResponse): string {
    if (!item.previous_status) {
      return `Criada como ${this.getStatusLabel(item.new_status)}`;
    }

    return `${this.getStatusLabel(item.previous_status)} → ${this.getStatusLabel(item.new_status)}`;
  }

  private loadDashboardData(user: UserResponse): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const requests$ =
      user.role === 'ANALYST'
        ? this.internalRequestService.getAllRequests()
        : this.internalRequestService.getMyRequests();

    forkJoin({
      requests: requests$,
      history: this.internalRequestService.getGeneralHistory(),
      activeRequestTypes: this.requestTypeService.getActiveRequestTypes(),
    }).subscribe({
      next: ({ requests, history, activeRequestTypes }) => {
        this.requests.set(requests);
        this.history.set(history);
        this.activeRequestTypesCount.set(activeRequestTypes.length);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os dados do dashboard.');
        this.isLoading.set(false);
      },
    });
  }
}