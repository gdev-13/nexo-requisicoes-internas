import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AppLayout } from '../../components/app-layout/app-layout';
import {
  InternalRequestResponse,
  RequestPriority,
  RequestStatus,
} from '../../models/internal-request';
import { InternalRequestService } from '../../services/internal-request.service';

@Component({
  selector: 'app-all-requests',
  imports: [AppLayout, RouterLink, DatePipe],
  templateUrl: './all-requests.html',
  styleUrl: './all-requests.css',
})
export class AllRequests implements OnInit {
  requests = signal<InternalRequestResponse[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  constructor(private readonly internalRequestService: InternalRequestService) {}

  ngOnInit(): void {
    this.loadRequests();
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

  private loadRequests(): void {
    this.internalRequestService
      .getAllRequests()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (requests) => {
          this.requests.set(requests);
        },
        error: () => {
          this.errorMessage.set('Não foi possível carregar as requisições.');
        },
      });
  }
}