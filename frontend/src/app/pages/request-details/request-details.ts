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
import { ConfirmationModal } from '../../components/confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-request-details',
  imports: [AppLayout, RouterLink, DatePipe, ConfirmationModal],
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
  isCancelModalOpen = signal(false);

  isStartingAnalysis = signal(false);
  isStartAnalysisModalOpen = signal(false);

  isApproveModalOpen = signal(false);
  isApproving = signal(false);
  isRejectModalOpen = signal(false);
  isRejecting = signal(false);
  isConcludeModalOpen = signal(false);
  isConcluding = signal(false);

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

  openStartAnalysisModal(): void {
    if (!this.canStartAnalysis()) {
      return;
    }

    this.isStartAnalysisModalOpen.set(true);
  }

  closeStartAnalysisModal(): void {
    if (this.isStartingAnalysis()) {
      return;
    }

    this.isStartAnalysisModalOpen.set(false);
  }

  confirmStartAnalysis(): void {
    const request = this.request();

    if (!request || !this.canStartAnalysis()) {
      this.isStartAnalysisModalOpen.set(false);
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
          this.isStartAnalysisModalOpen.set(false);
          this.loadRequestHistory(updatedRequest.id);
        },
        error: () => {
          this.errorMessage.set(
            'Não foi possível iniciar a análise da requisição.',
          );
        },
      }
    );
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

  openCancelModal(): void {
    if (!this.canCancelRequest()) {
      return;
    }

    this.isCancelModalOpen.set(true);
  }

  closeCancelModal(): void {
    if (this.isCanceling()) {
      return;
    }

    this.isCancelModalOpen.set(false);
  }

  confirmCancelRequest(): void {
    const request = this.request();

    if (!request || !this.canCancelRequest()) {
      this.isCancelModalOpen.set(false);
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
          this.isCancelModalOpen.set(false);
          this.loadRequestHistory(updatedRequest.id);
        },
        error: () => {
          this.errorMessage.set('Não foi possível cancelar a requisição.');
        },
      }
    );
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

  canReviewRequest(): boolean {
    const request = this.request();

    if (!request || !this.isAnalyst()) {
      return false;
    }

    return request.status === 'EM_ANALISE';
  }

  openApproveModal(): void {
    if (!this.canReviewRequest()) {
      return;
    }

    this.isApproveModalOpen.set(true);
  }

  closeApproveModal(): void {
    if (this.isApproving()) {
      return;
    }

    this.isApproveModalOpen.set(false);
  }

  confirmApproveRequest(): void {
    const request = this.request();

    if (!request || !this.canReviewRequest()) {
      this.isApproveModalOpen.set(false);
      return;
    }

    this.isApproving.set(true);
    this.errorMessage.set('');

    this.internalRequestService
      .approveRequest(request.id, {
        comment: 'Requisição aprovada pelo analista.',
      })
      .pipe(
        finalize(() => {
          this.isApproving.set(false);
        }),
      )
      .subscribe({
        next: (updatedRequest) => {
          this.request.set(updatedRequest);
          this.isApproveModalOpen.set(false);
          this.loadRequestHistory(updatedRequest.id);
        },
        error: () => {
          this.errorMessage.set('Não foi possível aprovar a requisição.');
        },
      }
    );
  }

  openRejectModal(): void {
    if (!this.canReviewRequest()) {
      return;
    }

    this.errorMessage.set('');
    this.isRejectModalOpen.set(true);
  }

  closeRejectModal(): void {
    if (this.isRejecting()) {
      return;
    }

    this.isRejectModalOpen.set(false);
  }

  confirmRejectRequest(comment: string | null): void {
    const request = this.request();
    const normalizedComment = comment?.trim();

    if (
      !request ||
      !this.canReviewRequest() ||
      !normalizedComment
    ) {
      return;
    }

    this.isRejecting.set(true);
    this.errorMessage.set('');

    this.internalRequestService
      .rejectRequest(request.id, {
        comment: normalizedComment,
      })
      .pipe(
        finalize(() => {
          this.isRejecting.set(false);
        }),
      )
      .subscribe({
        next: (updatedRequest) => {
          this.request.set(updatedRequest);
          this.isRejectModalOpen.set(false);
          this.loadRequestHistory(updatedRequest.id);
        },
        error: () => {
          this.errorMessage.set(
            'Não foi possível recusar a requisição.',
          );
        },
      }
    );
  }

  canConcludeRequest(): boolean {
    const request = this.request();

    if (!request || !this.isAnalyst()) {
      return false;
    }

    return request.status === 'APROVADA';
  }

  openConcludeModal(): void {
    if (!this.canConcludeRequest()) {
      return;
    }
    
    this.isConcludeModalOpen.set(true);
  }
  
  closeConcludeModal(): void {
    if (this.isConcluding()) {
      return;
    }
    
    this.isConcludeModalOpen.set(false);
  }
  
  confirmConcludeRequest(): void {
    const request = this.request();

    if (!request || !this.canConcludeRequest()) {
      this.isConcludeModalOpen.set(false);
      return;
    }
    
    this.isConcluding.set(true);
    this.errorMessage.set('');

    this.internalRequestService
      .concludeRequest(request.id, {
        comment: 'Requisição concluída pelo analista.',
      })
      .pipe(
        finalize(() => {
          this.isConcluding.set(false);
        }),
      )
      .subscribe({
        next: (updatedRequest) => {
          this.request.set(updatedRequest);
          this.isConcludeModalOpen.set(false);
          this.loadRequestHistory(updatedRequest.id);
        }, error: () => {
          this.errorMessage.set(
            'Não foi possível concluir a requisição.',
          );
        },
      }
    );
  }
}