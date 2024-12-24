import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private address = 'localhost'; // Adresse du serveur
  private port = 3000; // Port du serveur
  private baseUrl = `http://${this.address}:${this.port}/api/game`;
  private assetsUrl = `http://${this.address}:${this.port}/api/assets`;

  constructor(
    private http: HttpClient,
    private sessionService: SessionService
  ) { }

  getMotd(): Observable<any> {
    return this.http.get(`${this.assetsUrl}/motd`);
  }

  createGame(options: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create/:${options.code}`, options);
  }
  
  generateGameCode(): Observable<any> {
    return this.http.get(`${this.baseUrl}/generate-code`);
  }

  joinGame(code: string, username: string): Observable<any> {
    this.sessionService.setUsername(username);
    return this.http.post(`${this.baseUrl}/join/${code}`, { username });
  }

  startGame(code: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/start/${code}`, {});
  }

  getGameDetails(code: string): Observable<any> {
    // console.log(`${this.baseUrl}/${code}`);
    return this.http.get(`${this.baseUrl}/${code}`).pipe(
      tap((gameDetails: any) => {
        // console.log(`${this.baseUrl}/${code}`);
        // console.log(gameDetails);
      })
    );
  }

  leaveGame(code: string, username: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/leave/${code}`, { username });
  }

  increaseScore(code: string, username: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/increaseScore/${code}`, { username });
  }
}
