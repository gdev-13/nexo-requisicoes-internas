import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { RegisterRequest } from '../../models/auth';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  formData: RegisterRequest = {
    name: '',
    email: '',
    password: '',
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  onSubmit(form: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.errorMessage = 'Preencha corretamente todos os campos obrigatórios.';
      return;
    }

    this.isLoading = true;

    this.authService.register(this.formData).subscribe({
      next: () => {
        this.successMessage =
          'Cadastro realizado com sucesso. Redirecionando para o login...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getRegisterErrorMessage(error);
        this.isLoading = false;
      },
    });
  }

  private getRegisterErrorMessage(error: HttpErrorResponse): string {
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

    return 'Não foi possível realizar o cadastro. Verifique os dados informados.';
  }
}