import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  // Signals for reactive state
  public currentUser = signal<User | null>(null);
  public isAuthenticated = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  /**
   * Check if user is authenticated by validating stored token
   */
  private checkAuthStatus(): void {
    const token = this.getToken();
    if (token) {
      this.isAuthenticated.set(true);
      // Optionally fetch user profile
      this.getUserProfile().subscribe({
        next: (user) => {
          this.currentUser.set(user);
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.setTokens(response.accessToken, response.refreshToken);
        this.currentUser.set(response.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData).pipe(
      tap(response => {
        this.setTokens(response.accessToken, response.refreshToken);
        this.currentUser.set(response.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    // Clear tokens immediately to prevent infinite loop if token is expired
    this.clearTokens();
    this.currentUser.set(null);
    this.isAuthenticated.set(false);

    // Still call backend to invalidate refresh token, but don't wait for response
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        // Backend logout successful
      })
    );
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken(): Observable<{ accessToken: string }> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.setToken(response.accessToken);
      })
    );
  }

  /**
   * Get current user profile
   */
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/profile`).pipe(
      tap(user => {
        this.currentUser.set(user);
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(profileData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/user/profile`, profileData).pipe(
      tap(user => {
        this.currentUser.set(user);
      })
    );
  }

  /**
   * Change user password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/change-password`, {
      currentPassword,
      newPassword
    });
  }

  /**
   * Update responsible gaming limits
   */
  updateResponsibleGamingLimits(limits: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/user/responsible-gaming/limits`, limits).pipe(
      tap(user => {
        this.currentUser.set(user);
      })
    );
  }

  /**
   * Request self-exclusion
   */
  requestSelfExclusion(period: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/self-exclusion`, { period });
  }

  /**
   * Store tokens in localStorage
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Store access token
   */
  private setToken(accessToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
  }

  /**
   * Get stored access token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Clear tokens from storage
   */
  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}
