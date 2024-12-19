import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { GameService } from '../../service/game.service';
import { SessionService } from '../../service/session.service';


@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.css'
})
export class PlayerListComponent {
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

    this.username = sessionService.getUsername();
    this.gameCode = sessionService.getGameCode();

    if (!this.username) {
      this.router.navigate(['/']);
    }
  
    this.loadGameDetails();                                      
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
}
