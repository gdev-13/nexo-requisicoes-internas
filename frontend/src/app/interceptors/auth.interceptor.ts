import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthStorageService } from '../services/auth-storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authStorageService = inject(AuthStorageService);
  const router = inject(Router);

  const token = authStorageService.getToken();

  if (!token) {
    return next(request);
  }

  const authenticatedRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authStorageService.clearToken();

        if (!router.url.startsWith('/login')) {
          void router.navigate(['/login'], {
            replaceUrl: true,
            queryParams: {
              reason: 'session-expired',
            },
          });
        }
      }

      return throwError(() => error);
    }),
  );
};