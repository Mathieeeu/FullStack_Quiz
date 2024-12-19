import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../service/game.service';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.gameCode = this.route.snapshot.paramMap.get('code') || '';
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) { 
      this.username = localStorage.getItem('username') || '';
    }
    this.loadGameDetails();
    this.subscription = interval(1000).subscribe(() => this.loadGameDetails());
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
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
