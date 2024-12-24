import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../service/game.service';
import { SessionService } from '../service/session.service';
import { SessionAdminService } from '../service/session-admin.service';

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
  login: string = '';
  superUser: boolean = false;
  
  constructor(
    private gameService: GameService,
    private sessionService: SessionService,
    private router: Router,
    private sessionAdmin: SessionAdminService
  ) 
  {
    this.login = sessionAdmin.getUsername();
    this.superUser = sessionAdmin.getSuperUser();
  }

  ngOnInit(): void {
    // S'abonner aux changements de session
    this.sessionAdmin.username$.subscribe((username) => {
      this.login = username;
    });

    this.sessionAdmin.superUser$.subscribe((isSuperUser) => {
      this.superUser = isSuperUser;
    });
  }

  goToAjoutQuestion(){
    this.router.navigate(['/ajout-question']);
  }

  goToCreateGame(){
    this.router.navigate(['/creation-partie']);
  }

  joinGame() {
    this.gameService.joinGame(this.gameCode.toUpperCase(), this.username).subscribe(
      res => {
        this.sessionService.setUsername(this.username);
        this.sessionService.setGameCode(this.gameCode.toUpperCase());
        this.router.navigate(['/lobby', this.gameCode.toUpperCase()]);
      },
      err => console.error(err)
    );
  }
}

