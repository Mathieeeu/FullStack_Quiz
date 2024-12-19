import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private username: string = '';
  private gameCode: string = '';

  setUsername(username: string): void {
    this.username = username;
  }

  getUsername(): string {
    return this.username;
  }

  setGameCode(gameCode: string): void {
    this.gameCode = gameCode;
  }

  getGameCode(): string {
    return this.gameCode;
  }

  clearSession(): void {
    this.username = '';
    this.gameCode = '';
  }
}
