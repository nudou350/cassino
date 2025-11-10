import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Game, PlayGameRequest, GameResult, GameSession } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get all active games
   */
  getAllGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/games`);
  }

  /**
   * Get game by ID
   */
  getGameById(id: string): Observable<Game> {
    return this.http.get<Game>(`${this.apiUrl}/games/${id}`);
  }

  /**
   * Get games by type
   */
  getGamesByType(type: string): Observable<Game[]> {
    const params = new HttpParams().set('type', type);
    return this.http.get<Game[]>(`${this.apiUrl}/games`, { params });
  }

  /**
   * Play a game
   */
  playGame(request: PlayGameRequest): Observable<GameResult> {
    const { gameId, ...payload } = request;
    return this.http.post<GameResult>(`${this.apiUrl}/games/${gameId}/play`, payload);
  }

  /**
   * Get user's game history
   */
  getGameHistory(page: number = 1, limit: number = 20): Observable<{ sessions: GameSession[], total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<{ sessions: GameSession[], total: number }>(
      `${this.apiUrl}/games/history`,
      { params }
    );
  }

  /**
   * Get game history for specific game
   */
  getGameHistoryById(gameId: string, page: number = 1, limit: number = 20): Observable<{ sessions: GameSession[], total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<{ sessions: GameSession[], total: number }>(
      `${this.apiUrl}/games/${gameId}/history`,
      { params }
    );
  }

  /**
   * Verify provably fair outcome
   */
  verifyOutcome(sessionId: string, clientSeed: string): Observable<{ isValid: boolean, details: any }> {
    return this.http.post<{ isValid: boolean, details: any }>(
      `${this.apiUrl}/games/verify`,
      { sessionId, clientSeed }
    );
  }
}
