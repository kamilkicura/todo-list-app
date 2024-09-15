import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of, tap, map } from 'rxjs';
import { AuthGoogleService } from '../../services/auth-google.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthGoogleService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const isLoginRoute = route.routeConfig?.path === 'login';

    const token = localStorage.getItem('token');
    if (token) {
      if (isLoginRoute) {
        this.router.navigate(['/dashboard']);
        return of(false);
      }
      return of(true);
    }

    return this.authService.tokenReceived$.pipe(
      tap(received => {
        if (!received) {
          this.router.navigate(['/login']);
        }
      }),
      map(received => received)
    );
  }
}