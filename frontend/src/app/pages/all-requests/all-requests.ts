import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [AppLayout, RouterLink, DatePipe, FormsModule],
  templateUrl: './all-requests.html',
  styleUrl: './all-requests.css',
})
export class AllRequests implements OnInit {
  requests = signal<InternalRequestResponse[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  searchTerm = signal('');
  selectedStatus = signal<RequestStatus | ''>('');
  selectedPriority = signal<RequestPriority | ''>('');
  selectedType = signal('');

  requestTypeNames = computed(() => {
    const names = this.requests()
      .map((request) => request.request_type_name)
      .filter((name): name is string => Boolean(name));

    return [...new Set(names)].sort((first, second) =>
      first.localeCompare(second, 'pt-BR'),
    );
  });

  filteredRequests = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.selectedStatus();
    const priority = this.selectedPriority();
    const type = this.selectedType();

    return this.requests().filter((request) => {
      const matchesTitle =
        !term || request.title.toLowerCase().includes(term);

      const matchesStatus =
        !status || request.status === status;

      const matchesPriority =
        !priority || request.priority === priority;

      const matchesType =
        !type || request.request_type_name === type;

      return (
        matchesTitle &&
        matchesStatus &&
        matchesPriority &&
        matchesType
      );
    });
  });

  hasActiveFilters = computed(() =>
    Boolean(
      this.searchTerm().trim() ||
      this.selectedStatus() ||
      this.selectedPriority() ||
      this.selectedType(),
    ),
  );

  constructor(private readonly internalRequestService: InternalRequestService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('');
    this.selectedPriority.set('');
    this.selectedType.set('');
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