import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../service/game.service';

@Component({
  selector: 'app-join-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './join-game.component.html',
  styleUrls: ['./join-game.component.css']
})

export class JoinGameComponent {
  username: string = '';
  gameCode: string = '';

  constructor(private gameService: GameService, private router: Router) {}

  joinGame() {
    this.gameService.joinGame(this.gameCode, this.username).subscribe(
      res => {
        this.router.navigate(['/lobby', this.gameCode]);
      },
      err => console.error(err)
    );
  }
}
