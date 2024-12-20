import { Component, OnInit, OnDestroy } from '@angular/core';
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
    console.log(this.username);
    console.log(this.gameCode);

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
    this.gameService.getGameDetails(this.gameCode).subscribe(
      data => {
        this.gameDetails = data;
      },
      error => {
        console.error(error);
      }
    );
  }

  checkAnswer(): void {
    if (this.answer.toLowerCase() === this.gameDetails.currentQuestion.answerText.toLowerCase()) {
      this.gameService.increaseScore(this.gameCode, this.username).subscribe(
        res => {
          this.gameDetails.players = res.players;
          this.answer = ''; // Réinitialiser la réponse
        },
        err => console.error(err)
      );
    }
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
