import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../service/game.service';
import { SessionService } from '../service/session.service';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})

export class AccueilComponent {
  username: string = '';
  gameCode: string = '';
  
  constructor(
    private gameService: GameService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  joinGame() {
    this.gameService.joinGame(this.gameCode, this.username).subscribe(
      res => {
        this.sessionService.setUsername(this.username);
        this.sessionService.setGameCode(this.gameCode);
        this.router.navigate(['/lobby', this.gameCode]);
      },
      err => console.error(err)
    );
  }
}
