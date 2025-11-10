import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Client Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 401:
            // Unauthorized - redirect to login
            errorMessage = 'Unauthorized. Please login again.';
            // Don't call logout if the failing request is already a logout request
            if (!req.url.includes('/auth/logout')) {
              authService.logout().subscribe(() => {
                router.navigate(['/login']);
              });
            }
            break;

          case 403:
            errorMessage = 'Access forbidden. You do not have permission to access this resource.';
            break;

          case 404:
            errorMessage = 'Resource not found.';
            break;

          case 422:
            // Validation error
            errorMessage = error.error?.message || 'Validation error.';
            break;

          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;

          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;

          default:
            errorMessage = error.error?.message || `Server Error: ${error.status}`;
        }

        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: error.url,
          error: error.error
        });
      }

      // Return error with user-friendly message
      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error
      }));
    })
  );
};
