import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../service/game.service';

@Component({
  selector: 'app-create-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-game.component.html',
  styleUrls: ['./create-game.component.css']
})
export class CreateGameComponent {
  username: string = '';

  constructor(private gameService: GameService, private router: Router) {}

  createGame() {
    const options = { nbQuestions: 10, filters: '', questionTime: '30' };
    this.gameService.createGame({ host: this.username, options }).subscribe(
      res => {
        this.router.navigate(['/lobby', res.code]);
      },
      err => console.error(err)
    );
  }
}
