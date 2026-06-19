import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStorageService } from '../services/auth-storage.service';

export const guestGuard: CanActivateFn = () => {
  const authStorageService = inject(AuthStorageService);
  const router = inject(Router);

  const token = authStorageService.getToken();

  if (!token) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};