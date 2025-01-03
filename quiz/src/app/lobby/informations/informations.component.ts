import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { GameService } from '../../service/game.service';
import { SessionService } from '../../service/session.service';

@Component({
  selector: 'app-informations',
  standalone: true,
  imports:[
    CommonModule, 
    FormsModule,
    InformationsComponent,
  ],
  templateUrl: './informations.component.html',
  styleUrl: './informations.component.css'
})
export class InformationsComponent {
  gameCode: string = '';
  username: string = '';
  gameDetails: any;

  constructor(
    private gameService: GameService,
    private sessionService: SessionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.gameCode = sessionService.getGameCode();
    this.username = sessionService.getUsername();

    if (!this.username) {
      this.router.navigate(['/']);
    }

    this.loadGameDetails();

  }

  loadGameDetails(): void {
    this.gameService.getGameDetails(this.gameCode).subscribe(
      data => {
        this.gameDetails = data;
        console.log(this.gameDetails);
      },
      error => {
        // console.error(error);
      }
    );
  }
}
