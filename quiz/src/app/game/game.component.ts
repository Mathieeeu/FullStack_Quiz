import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { GameService } from '../service/game.service';
import { SessionService } from '../service/session.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('answerInput') answerInput!: ElementRef;
  gameCode: string = '';
  username: string = '';
  gameDetails: any;
  answer: string = '';
  private subscription: Subscription = new Subscription();
  private isNavigatingAway: boolean = false;

  constructor(
    private gameService: GameService,
    private sessionService: SessionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.gameCode = this.route.snapshot.paramMap.get('code') || '';
    this.username = this.sessionService.getUsername();
  }

  ngOnInit(): void {
    // console.log(this.username);
    // console.log(this.gameCode);

    if (!this.username) {
      this.router.navigate(['/']);
    } else {
      this.loadGameDetails();
      this.subscription = interval(1000).subscribe(() => this.loadGameDetails());
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }

    if (this.isNavigatingAway) {
      this.leaveGame();
    }
  }

  loadGameDetails(): void {
    console.log(this.gameDetails);
    try {
      this.gameService.getGameDetails(this.gameCode).subscribe(
        data => {
          this.gameDetails = data;

          // Focus sur l'input de réponse si une question est en cours (pour éviter de cliquer dessus à chaque fois)
          if (this.answerInput && this.gameDetails.currentQuestion !== -1 && !this.gameDetails.isOver) {
            setTimeout(() => this.answerInput.nativeElement.focus(), 0);
          }
        },
        error => {
          console.error(error);
        }
      );

      if (this.gameDetails.isOver) {
        console.log(this.gameDetails);
        console.log('Game is over');
        this.showEndScreen();
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }

  checkAnswer(): void {
    console.log('Answer=' + this.answer);

    const answerInput = document.getElementById('answer-input');
    if (!answerInput) {
      console.error('Erreur bizarre - input introuvable lol');
      return;
    }

    // Vérication de la réponse
    if (this.isCorrectAnswer()) {
      console.log('Bonne réponse');

      // Potite animation de couleur
      answerInput.style.color = 'cyan';
      setTimeout(() => {
        answerInput.style.color = '';
        this.answer = '';
        answerInput.style.display = 'none';
      }, 300);

      // Ajout d'un point au score du joueur
      this.gameService.increaseScore(this.gameCode, this.username).subscribe(
        res => {
          console.log(res);
        },
        err => console.error(err)
      );

    } else {
      console.log('Mauvaise réponse');
      
      answerInput.style.color = 'red';
      setTimeout(() => {
        answerInput.style.color = '';
        this.answer = '';
      }, 300);

    }
  }

  isCorrectAnswer(): boolean {
    // TODO : Mettre le mécanisme de "distance" entre les réponses ici pour les fautes de frappes (algorithme de Levenshtein par exemple)
    return this.answer.toLowerCase() === this.gameDetails.currentQuestion.answerText.toLowerCase();
  }

  showEndScreen(): void {
    // Récupération des scores
    const scores = this.gameDetails.players.map((player: any) => {
      return {
        username: player.username,
        score: player.score
      };
    });

    // Tri des scores
    scores.sort((a: any, b: any) => b.score - a.score);

    // Affichage du meilleur score dans le span prévu à cet effet :)
    const bestScore = document.getElementById('best-score');
    if (!bestScore) {
      console.error('Erreur bizarre - span introuvable lol');
      return;
    }
    bestScore.innerText = scores[0];
    console.log('Meilleur score : ' + scores[0]);

    // Au bout de 10 secondes, on redirige vers le menu (peut etre qu'on pourrait faire une page de fin de partie)
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 10000);
    
  }

  leaveGame(): void {
    this.gameService.leaveGame(this.gameCode, this.username).subscribe(
      res => {
        this.sessionService.clearSession();
        this.router.navigate(['/']);
      },
      err => console.error(err)
    );
  }

  handleBeforeUnload = () => {
    this.isNavigatingAway = true;
    this.leaveGame();
  }
}
