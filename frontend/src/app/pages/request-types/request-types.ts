import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';

import { AppLayout } from '../../components/app-layout/app-layout';
import { UserResponse } from '../../models/auth';
import { 
  RequestTypeCreate,
  RequestTypeResponse,
  RequestTypeUpdate
} from '../../models/request-type';
import { RequestTypeService } from '../../services/request-type.service';

@Component({
  selector: 'app-request-types',
  imports: [AppLayout, FormsModule],
  templateUrl: './request-types.html',
  styleUrl: './request-types.css',
})
export class RequestTypes {
  currentUser = signal<UserResponse | null>(null);
  requestTypes = signal<RequestTypeResponse[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  
  editingRequestType = signal<RequestTypeResponse | null>(null);
  changingStatusTypeId = signal<number | null>(null);

  formData: RequestTypeCreate = {
    name: '',
    description: '',
  };

  constructor(private readonly requestTypeService: RequestTypeService) {}

  setCurrentUser(user: UserResponse | null): void {
    this.currentUser.set(user);

    if (user) {
      this.loadRequestTypes(user);
    }
  }

  isAnalyst(): boolean {
    return this.currentUser()?.role === 'ANALYST';
  }

  onSubmit(form: NgForm): void {
    if (!this.isAnalyst()) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.errorMessage.set('Preencha corretamente os campos obrigatórios.');
      return;
    }

    const editingRequestType = this.editingRequestType();

    if (editingRequestType) {
      this.updateRequestType(editingRequestType.id, form);
      return;
    }

    this.createRequestType(form);
  }

  private loadRequestTypes(user: UserResponse): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const request$ =
      user.role === 'ANALYST'
        ? this.requestTypeService.getAllRequestTypes()
        : this.requestTypeService.getActiveRequestTypes();

    request$.subscribe({
      next: (types) => {
        this.requestTypes.set(types);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Não foi possível carregar os tipos de requisição.');
        this.isLoading.set(false);
      },
    });
  }

  private getRequestTypeErrorMessage(error: HttpErrorResponse): string {
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

    return 'Não foi possível cadastrar o tipo de requisição.';
  }

  private createRequestType(form: NgForm): void {
    this.isSubmitting.set(true);

    const requestData: RequestTypeCreate = {
      name: this.formData.name.trim(),
      description: this.formData.description?.trim() || null,
    };

    this.requestTypeService
      .createRequestType(requestData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Tipo de requisição cadastrado com sucesso.');
          form.resetForm({
            name: '',
            description: '',
          });

          const currentUser = this.currentUser();

          if (currentUser) {
            this.loadRequestTypes(currentUser);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.getRequestTypeErrorMessage(error));
        },
      }
    );
  }

  private updateRequestType(id: number, form: NgForm): void {
    this.isSubmitting.set(true);

    const requestData: RequestTypeUpdate = {
      name: this.formData.name.trim(),
      description: this.formData.description?.trim() || null,
    };

    this.requestTypeService
      .updateRequestType(id, requestData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Tipo de requisição atualizado com sucesso.');
          this.editingRequestType.set(null);

          form.resetForm({
            name: '',
            description: '',
          });

          const currentUser = this.currentUser();

          if (currentUser) {
            this.loadRequestTypes(currentUser);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.getRequestTypeErrorMessage(error));
        },
      }
    );
  }

  isEditing(): boolean {
    return this.editingRequestType() !== null;
  }

  onEditRequestType(type: RequestTypeResponse): void {
    if (!this.isAnalyst()) {
      return;
    }

    this.editingRequestType.set(type);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.formData = {
      name: type.name,
      description: type.description || '',
    };

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  onCancelEdit(): void {
    this.editingRequestType.set(null);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.formData = {
      name: '',
      description: '',
    };
  }

  onDisableRequestType(type: RequestTypeResponse): void {
    if (!this.isAnalyst()) {
      return;
    }

    const shouldDisable = window.confirm(
      `Deseja desativar o tipo "${type.name}"?`,
    );

    if (!shouldDisable) {
      return;
    }

    this.changingStatusTypeId.set(type.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.requestTypeService
      .disableRequestType(type.id)
      .subscribe({
        next: () => {
          this.successMessage.set('Tipo de requisição desativado com sucesso.');

          const currentUser = this.currentUser();

          if (currentUser) {
            this.loadRequestTypes(currentUser);
          }

          this.changingStatusTypeId.set(null);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.getRequestTypeErrorMessage(error));
          this.changingStatusTypeId.set(null);
        },
      });
  }

  onEnableRequestType(type: RequestTypeResponse): void {
    if (!this.isAnalyst()) {
      return;
    }

    const shouldEnable = window.confirm(
      `Deseja reativar o tipo "${type.name}"?`,
    );

    if (!shouldEnable) {
      return;
    }

    this.changingStatusTypeId.set(type.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.requestTypeService
      .enableRequestType(type.id)
      .subscribe({
        next: () => {
          this.successMessage.set('Tipo de requisição reativado com sucesso.');

          const currentUser = this.currentUser();

          if (currentUser) {
            this.loadRequestTypes(currentUser);
          }

          this.changingStatusTypeId.set(null);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.getRequestTypeErrorMessage(error));
          this.changingStatusTypeId.set(null);
        },
      });
  }
}