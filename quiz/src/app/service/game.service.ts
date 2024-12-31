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

  getThemes(): Observable<any> {
    return this.http.get(`${this.assetsUrl}/themes`);
  }

  createGame(options: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create/${options.code}`, options);
  }

  getGames(): Observable<any> {
    return this.http.get(`${this.baseUrl}/`);
  }

  deleteGame(code: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${code}`);
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

  // Fonction de hashage pour creer une seed à partir du code de la 
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char; // ça décale de 5 bits à gauche (donc hash*2^5-hash donc hash*31 en gros) et ça ajoute le code ascii du caractère
      hash = hash & hash; // Convertit en 32-bit integer
    }
    return Math.abs(hash);
  }

  // Fonction de génération de nombre aléatoire à partir d'une seed
  private random(seed: number): number {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  // Fonction de mélange qui utilise une graine pour garantir que le mélange est le même à chaque fois
  private shuffleArray(array: any[], seed: number): any[] {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(this.random(seed) * currentIndex);
      currentIndex--;

      // Echange de valeurs
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;

      // Mise à jour de la graine
      seed++;
    }

    return array;
  }

  getGameDetails(code: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${code}`).pipe(
      tap((gameDetails: any) => {
        if (gameDetails.currentQuestion && gameDetails.currentQuestion.questionType === 'QCM') {
          const allAnswers = [gameDetails.currentQuestion.answerText, ...gameDetails.currentQuestion.fakeAnswer];
          const seed = this.hashCode(code);
          gameDetails.currentQuestion.allAnswers = this.shuffleArray(allAnswers, seed);
        } 
        else if (gameDetails.currentQuestion && gameDetails.currentQuestion.questionType === 'Selection') {
          const allAnswers = [...gameDetails.currentQuestion.trueAnswers, ...gameDetails.currentQuestion.fakeAnswers];
          const seed = this.hashCode(code);
          gameDetails.currentQuestion.allAnswers = this.shuffleArray(allAnswers, seed);
        }
      })
    );
  }

  leaveGame(code: string, username: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/leave/${code}`, { username });
  }

  increaseScore(code: string, username: string, pourcentageSelectionCorrecte?: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/increaseScore/${code}`, { username, pourcentageSelectionCorrecte });
  }

  hasAnswered(code: string, username: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/hasAnswered/${code}`, { username });
  }

  hasTriedToAnswer(code: string, username: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/hasTriedToAnswer/${code}`, { username });
  }
}
