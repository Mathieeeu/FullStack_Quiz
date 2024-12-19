import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api/game';

  constructor(private http: HttpClient) { }

  createGame(options: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, options);
  }

  joinGame(code: string, username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/join/${code}`, { username });
  }

  startGame(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/start/${code}`, {});
  }

  getGameDetails(code: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${code}`);
  }

  leaveGame(code: string, username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/leave/${code}`, { username });
  }
}
