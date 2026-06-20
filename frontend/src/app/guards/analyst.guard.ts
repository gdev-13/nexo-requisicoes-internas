import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthStorageService } from '../services/auth-storage.service';
import { AuthService } from '../services/auth.service';

export const analystGuard: CanActivateFn = () => {
  const authStorageService = inject(AuthStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authStorageService.getToken();

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  return authService.getCurrentUser().pipe(
    map((user) => {
      if (user.role === 'ANALYST') {
        return true;
      }

      return router.createUrlTree(['/dashboard']);
    }),
    catchError(() => {
      authStorageService.clearToken();
      return of(router.createUrlTree(['/login']));
    }),
  );
};