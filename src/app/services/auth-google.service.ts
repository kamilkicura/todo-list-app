import { Injectable, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthConfig, OAuthEvent, OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { UserProfile } from '../models/user-profile';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthGoogleService implements OnDestroy {
  
  private oAuthService = inject(OAuthService);
  private router = inject(Router);
  
  private destroy$ = new Subject<void>();
  
  private tokenReceivedSource = new BehaviorSubject<boolean>(false);
  public tokenReceived$ = this.tokenReceivedSource.asObservable();

  constructor() {
    this.initConfiguration();
    this.listenForTokenReceived();
  }

  public initConfiguration(): void {
    const authConfig: AuthConfig = {
      issuer: 'https://accounts.google.com',
      strictDiscoveryDocumentValidation: false,
      clientId: environment.googleClientId,
      redirectUri: window.location.origin + '/dashboard',
      scope: 'openid profile email',
    };

    this.oAuthService.configure(authConfig);
    this.oAuthService.setupAutomaticSilentRefresh();
    this.oAuthService.loadDiscoveryDocumentAndTryLogin();
  }

  public login(): void {
    this.oAuthService.initImplicitFlow();
  }

  public logout(): void {
    this.oAuthService.revokeTokenAndLogout();
    this.oAuthService.logOut();
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  public getProfile(): Partial<UserProfile> | null {
    return this.oAuthService.getIdentityClaims();
  }

  public getToken(): string {
    return this.oAuthService.getAccessToken();
  }

  private listenForTokenReceived(): void {
    this.oAuthService.events
    .pipe(takeUntil(this.destroy$))
    .subscribe((event: OAuthEvent) => {
      if (event.type === 'token_received') {
        this.tokenReceivedSource.next(true);
      }
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}