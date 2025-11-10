import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Balance, Transaction, DepositRequest, WithdrawRequest, TransactionHistory } from '../models/wallet.model';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private readonly apiUrl = environment.apiUrl;

  // Signals for reactive state
  public balance = signal<number>(0);
  public bonusBalance = signal<number>(0);

  constructor(private http: HttpClient) {}

  /**
   * Get user's current balance
   */
  getBalance(): Observable<Balance> {
    return this.http.get<Balance>(`${this.apiUrl}/wallet/balance`).pipe(
      tap(balanceData => {
        this.balance.set(balanceData.balance);
        this.bonusBalance.set(balanceData.bonusBalance);
      })
    );
  }

  /**
   * Make a deposit
   */
  deposit(amount: number, paymentMethod: string): Observable<Transaction> {
    const request: DepositRequest = {
      amount,
      paymentMethod: paymentMethod.toUpperCase() as any
    };
    return this.http.post<Transaction>(`${this.apiUrl}/wallet/deposit`, request).pipe(
      tap(() => {
        // Refresh balance after successful deposit
        this.getBalance().subscribe();
      })
    );
  }

  /**
   * Request a withdrawal
   */
  withdraw(amount: number, paymentMethod: string, accountDetails: string): Observable<Transaction> {
    const request = {
      amount,
      paymentMethod: paymentMethod.toUpperCase(),
      accountDetails
    };
    return this.http.post<Transaction>(`${this.apiUrl}/wallet/withdraw`, request).pipe(
      tap(() => {
        // Refresh balance after withdrawal request
        this.getBalance().subscribe();
      })
    );
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(page: number = 1, limit: number = 20, type?: string): Observable<TransactionHistory> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (type) {
      params = params.set('type', type);
    }

    return this.http.get<TransactionHistory>(`${this.apiUrl}/wallet/transactions`, { params });
  }

  /**
   * Get transaction by ID
   */
  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/wallet/transactions/${id}`);
  }

  /**
   * Get transactions (simplified - returns just the array)
   */
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<TransactionHistory>(`${this.apiUrl}/wallet/transactions`).pipe(
      tap(history => history.transactions)
    ) as any;
  }

  /**
   * Update balance locally (for real-time updates after game play)
   */
  updateBalance(newBalance: number): void {
    this.balance.set(newBalance);
  }

  /**
   * Update bonus balance locally
   */
  updateBonusBalance(newBonusBalance: number): void {
    this.bonusBalance.set(newBonusBalance);
  }
}
