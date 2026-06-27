import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const workspaceGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    map((user) => {
      if (user.role === 'REQUESTER' || user.role === 'ANALYST') {
        return true;
      }

      return router.createUrlTree(['/admin/users']);
    }),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};