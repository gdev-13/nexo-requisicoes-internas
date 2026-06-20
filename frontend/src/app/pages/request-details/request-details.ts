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