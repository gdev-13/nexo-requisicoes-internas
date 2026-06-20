import { Component, signal } from '@angular/core';

import { AppLayout } from '../../components/app-layout/app-layout';
import { UserResponse } from '../../models/auth';
import { RequestTypeResponse } from '../../models/request-type';
import { RequestTypeService } from '../../services/request-type.service';

@Component({
  selector: 'app-request-types',
  imports: [AppLayout],
  templateUrl: './request-types.html',
  styleUrl: './request-types.css',
})
export class RequestTypes {
  currentUser = signal<UserResponse | null>(null);
  requestTypes = signal<RequestTypeResponse[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

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
}