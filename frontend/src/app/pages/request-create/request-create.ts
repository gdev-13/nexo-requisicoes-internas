import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AppLayout } from '../../components/app-layout/app-layout';
import { InternalRequestCreate, RequestPriority } from '../../models/internal-request';
import { RequestTypeResponse } from '../../models/request-type';
import { InternalRequestService } from '../../services/internal-request.service';
import { RequestTypeService } from '../../services/request-type.service';

@Component({
  selector: 'app-request-create',
  imports: [AppLayout, FormsModule, RouterLink],
  templateUrl: './request-create.html',
  styleUrl: './request-create.css',
})
export class RequestCreate implements OnInit {
  priorities: RequestPriority[] = ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'];

  formData: InternalRequestCreate = {
    title: '',
    description: '',
    priority: 'MEDIA',
    request_type_id: 0,
  };

  requestTypes = signal<RequestTypeResponse[]>([]);
  isLoadingTypes = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal('');

  constructor(
    private readonly requestTypeService: RequestTypeService,
    private readonly internalRequestService: InternalRequestService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadRequestTypes();
  }

  onSubmit(form: NgForm): void {
    this.errorMessage.set('');

    if (form.invalid || !this.formData.request_type_id) {
      form.control.markAllAsTouched();
      this.errorMessage.set('Preencha corretamente todos os campos obrigatórios.');
      return;
    }

    this.isSubmitting.set(true);

    const requestData: InternalRequestCreate = {
      title: this.formData.title.trim(),
      description: this.formData.description.trim(),
      priority: this.formData.priority,
      request_type_id: Number(this.formData.request_type_id),
    };

    this.internalRequestService
      .createRequest(requestData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.getRequestErrorMessage(error));
        },
      });
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

  private loadRequestTypes(): void {
    this.requestTypeService
      .getActiveRequestTypes()
      .pipe(
        finalize(() => {
          this.isLoadingTypes.set(false);
        }),
      )
      .subscribe({
        next: (types) => {
          this.requestTypes.set(types);
        },
        error: () => {
          this.errorMessage.set('Não foi possível carregar os tipos de requisição.');
        },
      });
  }

  private getRequestErrorMessage(error: HttpErrorResponse): string {
    const detail = error.error?.detail;

    if (typeof detail === 'string') {
      return detail;
    }

    if (Array.isArray(detail)) {
      return 'Verifique os dados informados e tente novamente.';
    }

    if (!error.status) {
      return 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
    }

    return 'Não foi possível criar a requisição. Verifique os dados informados.';
  }
}