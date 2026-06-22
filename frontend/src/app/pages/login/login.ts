import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { LoginRequest } from '../../models/auth';
import { AuthStorageService } from '../../services/auth-storage.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  formData: LoginRequest = {
    email: '',
    password: '',
  };

  isLoading = false;
  errorMessage = '';

  sessionMessage = signal('');

  constructor(
    private readonly authService: AuthService,
    private readonly authStorageService: AuthStorageService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  onSubmit(form: NgForm): void {
    this.errorMessage = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.errorMessage = 'Preencha corretamente todos os campos obrigatórios.';
      return;
    }

    this.isLoading = true;

    const loginData: LoginRequest = {
      email: this.formData.email.trim(),
      password: this.formData.password,
    };

    this.authService
      .login(loginData)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          this.authStorageService.saveToken(response.access_token);
          this.router.navigate(['/dashboard'], {replaceUrl: true});
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getLoginErrorMessage(error);
        },
      });
  }

  private getLoginErrorMessage(error: HttpErrorResponse): string {
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

    if (error.status === 401) {
      return 'E-mail ou senha inválidos.';
    }

    return 'Não foi possível realizar o login. Verifique os dados informados.';
  }

  ngOnInit(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');

    if (reason !== 'session-expired') {
      return;
    }

    this.sessionMessage.set(
      'Sua sessão expirou. Entre novamente para continuar.',
    );

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        reason: null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}