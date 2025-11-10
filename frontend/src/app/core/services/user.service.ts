import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { User } from '../models/user.model';

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResponsibleGamingLimits {
  dailyDepositLimit?: number;
  weeklyDepositLimit?: number;
  monthlyDepositLimit?: number;
  dailyLossLimit?: number;
  weeklyLossLimit?: number;
  monthlyLossLimit?: number;
  sessionTimeLimit?: number;
}

export interface SelfExclusionRequest {
  duration: number; // in days, 0 for permanent
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get user profile
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/profile`);
  }

  /**
   * Update user profile
   */
  updateProfile(data: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/user/profile`, data);
  }

  /**
   * Change password
   */
  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/user/change-password`, data);
  }

  /**
   * Get responsible gaming limits
   */
  getResponsibleGamingLimits(): Observable<ResponsibleGamingLimits> {
    return this.http.get<ResponsibleGamingLimits>(`${this.apiUrl}/user/responsible-gaming/limits`);
  }

  /**
   * Set responsible gaming limits
   */
  setResponsibleGamingLimits(limits: ResponsibleGamingLimits): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/user/responsible-gaming/limits`, limits);
  }

  /**
   * Request self-exclusion
   */
  requestSelfExclusion(request: SelfExclusionRequest): Observable<{ message: string, excludedUntil: string }> {
    return this.http.post<{ message: string, excludedUntil: string }>(
      `${this.apiUrl}/user/self-exclusion`,
      request
    );
  }

  /**
   * Upload KYC documents
   */
  uploadKYCDocument(file: File, documentType: string): Observable<{ message: string }> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType);

    return this.http.post<{ message: string }>(`${this.apiUrl}/user/kyc/upload`, formData);
  }
}
