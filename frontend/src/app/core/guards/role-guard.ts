import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'];
  const currentRole = authService.getRole();

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (currentRole && currentRole.toUpperCase() === expectedRole.toUpperCase()) {
    return true;
  }

  // Role mismatch
  router.navigate(['/login']);
  return false;
};
