import { Component } from '@angular/core';
import { GameService } from '../service/game.service';
import { SessionAdminService } from '../service/session-admin.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-creation-partie',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './creation-partie.component.html',
  styleUrl: './creation-partie.component.css'
})
export class CreationPartieComponent {
  gameCode: string = '';
  hote: string = '';

  gameData = {
    host: this.hote,
    nbQuestions: 10,
    filters: '',
    questionTime: 30,
    code : this.gameCode
  };

  constructor(
    private gameService: GameService,
    private router: Router,
    private sessionAdmin: SessionAdminService
  ) 
  {
    {
      this.hote = sessionAdmin.getUsername();
    }
  }

  ngOnInit(): void {
    this.generateCode();  // Génère un code dès que le composant est initialisé
  }

  generateCode(): void {
    this.gameService.generateGameCode().subscribe(
      (response) => {
        this.gameCode = response.code;  // Récupère le code généré et le met dans la variable
      },
      (error) => {
        console.error('Erreur lors de la génération du code :', error);
      }
    );
  }

  onSubmit(): void {
    // Si le formulaire est validé, on envoie les données à l'API
    this.gameService.createGame(this.gameData).subscribe(
      (response) => {
        console.log('Partie créée avec succès :', response);
        alert('Partie créée avec succès');
      },
      (error) => {
        console.error('Erreur lors de la création de la partie :', error);
        alert('Il y a eu une erreur lors de la création de la partie.');
      }
    );
  }
}
