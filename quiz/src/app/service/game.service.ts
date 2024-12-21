import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api/game';

  constructor(
    private http: HttpClient,
    private sessionService: SessionService
  ) { }

  createGame(options: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, options);
  }

  joinGame(code: string, username: string): Observable<any> {
    this.sessionService.setUsername(username);
    return this.http.post(`${this.apiUrl}/join/${code}`, { username });
  }

  startGame(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/start/${code}`, {});
  }

  getGameDetails(code: string): Observable<any> {
    // console.log(`${this.apiUrl}/${code}`);
    return this.http.get(`${this.apiUrl}/${code}`).pipe(
      tap((gameDetails: any) => {
        // console.log(`${this.apiUrl}/${code}`);
        // console.log(gameDetails);
      })
    );
  }

  leaveGame(code: string, username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/leave/${code}`, { username });
  }

  increaseScore(code: string, username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/increaseScore/${code}`, { username });
  }
}
