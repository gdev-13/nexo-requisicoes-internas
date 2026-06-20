import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { AppLayout } from '../../components/app-layout/app-layout';
import {
  InternalRequestResponse,
  RequestHistoryResponse,
  RequestPriority,
  RequestStatus,
} from '../../models/internal-request';
import { InternalRequestService } from '../../services/internal-request.service';
import { UserResponse } from '../../models/auth';

@Component({
  selector: 'app-request-details',
  imports: [AppLayout, RouterLink, DatePipe],
  templateUrl: './request-details.html',
  styleUrl: './request-details.css',
})
export class RequestDetails implements OnInit {
  request = signal<InternalRequestResponse | null>(null);
  history = signal<RequestHistoryResponse[]>([]);

  isLoading = signal(true);
  errorMessage = signal('');

  currentUser = signal<UserResponse | null>(null);
  isCanceling = signal(false);  

  isStartingAnalysis = signal(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly internalRequestService: InternalRequestService,
  ) {}

  ngOnInit(): void {
    this.loadRequestDetails();
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
      return `Requisição criada como ${this.getStatusLabel(item.new_status)}`;
    }

    return `${this.getStatusLabel(item.previous_status)} → ${this.getStatusLabel(item.new_status)}`;
  }

  canStartAnalysis(): boolean {
    const request = this.request();

    if (!request || !this.isAnalyst()) {
      return false;
    }

    return request.status === 'SOLICITADA';
  }

  onStartAnalysis(): void {
    const request = this.request();

    if (!request || !this.canStartAnalysis()) {
      return;
    }

    const shouldStart = window.confirm(
      'Deseja iniciar a análise desta requisição?',
    );

    if (!shouldStart) {
      return;
    }

    this.isStartingAnalysis.set(true);
    this.errorMessage.set('');

    this.internalRequestService
      .startAnalysis(request.id, {
        comment: 'Análise iniciada pelo analista.',
      })
      .pipe(
        finalize(() => {
          this.isStartingAnalysis.set(false);
        }),
      )
      .subscribe({
        next: (updatedRequest) => {
          this.request.set(updatedRequest);
          this.loadRequestHistory(updatedRequest.id);
        },
        error: () => {
          this.errorMessage.set('Não foi possível iniciar a análise da requisição.');
        },
      });
  }

  setCurrentUser(user: UserResponse | null): void {
    this.currentUser.set(user);
  }

  isRequester(): boolean {
    return this.currentUser()?.role === 'REQUESTER';
  }

  isAnalyst(): boolean {
    return this.currentUser()?.role === 'ANALYST';
  }

  getBackLink(): string {
    return this.isAnalyst() ? '/requests' : '/requests/my';
  }

  getBackLabel(): string {
    return this.isAnalyst()
      ? 'Voltar para todas as requisições'
      : 'Voltar para minhas requisições';
  }

  canCancelRequest(): boolean {
    const request = this.request();

    if (!request || !this.isRequester()) {
      return false;
    }

    return request.status === 'SOLICITADA';
  }

  onCancelRequest(): void {
    const request = this.request();

    if (!request || !this.canCancelRequest()) {
      return;
    }

    const shouldCancel = window.confirm(
      'Tem certeza que deseja cancelar esta requisição?',
    );

    if (!shouldCancel) {
      return;
    }

    this.isCanceling.set(true);
    this.errorMessage.set('');

    this.internalRequestService
      .cancelRequest(request.id, {
        comment: 'Requisição cancelada pelo solicitante.',
      })
      .pipe(
        finalize(() => {
          this.isCanceling.set(false);
        }),
      )
      .subscribe({
        next: (updatedRequest) => {
          this.request.set(updatedRequest);
          this.loadRequestHistory(updatedRequest.id);
        },
        error: () => {
          this.errorMessage.set('Não foi possível cancelar a requisição.');
        },
      });
  }

  private loadRequestHistory(requestId: number): void {
    this.internalRequestService.getRequestHistory(requestId).subscribe({
      next: (history) => {
        this.history.set(history);
      },
    });
  }

  private loadRequestDetails(): void {
    const requestId = Number(this.route.snapshot.paramMap.get('id'));

    if (!requestId) {
      this.errorMessage.set('Requisição não encontrada.');
      this.isLoading.set(false);
      return;
    }

    forkJoin({
      request: this.internalRequestService.getRequestById(requestId),
      history: this.internalRequestService.getRequestHistory(requestId),
    })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: ({ request, history }) => {
          this.request.set(request);
          this.history.set(history);
        },
        error: () => {
          this.errorMessage.set('Não foi possível carregar os detalhes da requisição.');
        },
    });
  }
}