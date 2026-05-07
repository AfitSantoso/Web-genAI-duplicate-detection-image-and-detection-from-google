import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../state/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const userId = auth.userId();
  const role = auth.userRole();

  if (userId && role) {
    const cloned = req.clone({
      setHeaders: {
        'X-User-Id': String(userId),
        'X-User-Role': role,
      },
    });
    return next(cloned);
  }

  return next(req);
};
