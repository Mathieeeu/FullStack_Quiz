import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { interval, Subscription, filter } from 'rxjs';

import { GameService } from '../service/game.service';
import { SessionService } from '../service/session.service';

import { InformationsComponent } from '../lobby/informations/informations.component';
import { PlayerListComponent } from '../lobby/player-list/player-list.component';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    InformationsComponent,
    PlayerListComponent
  ],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {
  gameCode: string = '';
  username: string = '';
  gameDetails: any;
  private subscription: Subscription = new Subscription();

  constructor(
    private gameService: GameService,
    private sessionService: SessionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.gameCode = this.route.snapshot.paramMap.get('code') || '';
  
    // On écoute les événements de navigation pour quitter la partie si l'utilisateur change de page
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        this.leaveGame();
      });
  }

  ngOnInit(): void {
    this.username = this.sessionService.getUsername();

    console.log(this.username);
    console.log(this.gameCode);

    if (!this.username) {
      this.router.navigate(['/']);
    }
    
    this.loadGameDetails();
    this.subscription = interval(1000).subscribe(() => this.loadGameDetails());
  
    window.addEventListener('beforeunload', () => this.leaveGame());
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.leaveGame();
    window.removeEventListener('beforeunload', () => this.leaveGame());
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
    console.log(this.gameDetails);

    if (this.gameDetails && this.gameDetails.isStarted) {
      this.subscription.unsubscribe();

      this.router.navigate(['/game', this.gameCode]);
    }
  }

  startGame(): void {
    this.gameService.startGame(this.gameCode).subscribe(
      res => {
        this.gameDetails = res;
      },
      err => console.error(err)
    );
  }

  leaveGame(): void {
    // Supposons que nous avons une route pour supprimer un joueur de la partie
    this.gameService.leaveGame(this.gameCode, this.username).subscribe(
      res => {
        this.router.navigate(['/']);
      },
      err => console.error(err)
    );
  }
}
