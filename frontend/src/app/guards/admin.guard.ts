import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    map((user) => {
      if (user.role === 'ADMIN') {
        return true;
      }

      return router.createUrlTree(['/dashboard']);
    }),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};