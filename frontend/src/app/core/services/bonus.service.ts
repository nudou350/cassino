import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Bonus, BonusTemplate } from '../models/bonus.model';

@Injectable({
  providedIn: 'root'
})
export class BonusService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get available bonus templates
   */
  getAvailableBonuses(): Observable<BonusTemplate[]> {
    return this.http.get<BonusTemplate[]>(`${this.apiUrl}/bonuses/available`);
  }

  /**
   * Claim a bonus
   */
  claimBonus(bonusId: string): Observable<Bonus> {
    return this.http.post<Bonus>(`${this.apiUrl}/bonuses/${bonusId}/claim`, {});
  }

  /**
   * Get active bonuses
   */
  getActiveBonuses(): Observable<Bonus[]> {
    return this.http.get<Bonus[]>(`${this.apiUrl}/bonuses/active`);
  }

  /**
   * Get bonus history
   */
  getBonusHistory(): Observable<Bonus[]> {
    return this.http.get<Bonus[]>(`${this.apiUrl}/bonuses/history`);
  }

  /**
   * Cancel a bonus
   */
  cancelBonus(bonusId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/bonuses/${bonusId}`);
  }
}
