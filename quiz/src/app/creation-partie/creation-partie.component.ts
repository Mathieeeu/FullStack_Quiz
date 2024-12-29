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
  themes = [
    { name: 'Géographie', status: 'neutral' },
    { name: 'Histoire', status: 'neutral' },
    { name: 'Botanique', status: 'neutral' },
    { name: 'Logique', status: 'neutral' },
    { name: 'Sciences', status: 'neutral' },
    { name: 'Culture', status: 'neutral' },
    { name: 'Sport', status: 'neutral' },
    { name: 'Cuisine', status: 'neutral' },
    { name: 'Autre', status: 'neutral' }
  ];

  currentMode: 'tous' | 'inclure' | 'exclure' = 'tous';

  gameData = {
    host: this.hote,
    nbQuestions: null,
    filters: '',
    questionTime: null,
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
    this.generateCode(); 
  }

  generateCode(): void {
    this.gameService.generateGameCode().subscribe(
      (response) => {
        this.gameCode = response.code;
        this.updateGameData();
      },
      (error) => {
        console.error('Erreur lors de la génération du code :', error);
      }
    );
  }

  resetForm(): void {
    // Réinitialisation des données de la partie
    this.gameData = {
      host: this.sessionAdmin.getUsername(),
      nbQuestions: null,
      filters: '',
      questionTime:null,
      code: ''
    }
    this.currentMode = 'tous';
    this.themes.forEach(theme => theme.status = 'neutral');
  }

  updateGameData(): void {
    this.gameData.host = this.hote;
    this.gameData.code = this.gameCode;
    this.gameData.filters = this.toLowercaseWithoutAccents(this.generateFilters());
  }

  // Définit le mode par défaut
  setDefaultMode(mode: 'tous' | 'inclure' | 'exclure'): void {
    this.currentMode = mode;

    // Met à jour les statuts des thèmes selon le mode
    if (mode === 'tous') {
      this.themes.forEach(theme => theme.status = 'neutral');
    } else if (mode === 'inclure') {
      this.themes.forEach(theme => theme.status = 'neutral'); 
    } else if (mode === 'exclure') {
      this.themes.forEach(theme => theme.status = 'include');
    }
  }

  // Alterne entre les états pour un thème donné
  toggleThemeStatus(theme: any): void {
    if (this.currentMode === 'inclure') {
      theme.status = theme.status === 'include' ? 'neutral' : 'include';
    } else if (this.currentMode === 'exclure') {
      theme.status = theme.status === 'exclude' ? 'include' : 'exclude';
    }
  }

  generateFilters(): string {
    if (this.currentMode === 'tous') {
      return '';
    }
  
    const selectedThemes = this.themes
      .filter(theme => 
        (this.currentMode === 'inclure' && theme.status === 'include') || 
        (this.currentMode === 'exclure' && theme.status === 'exclude')
      )
      .map(theme => theme.name);
  
    if (this.currentMode === 'inclure') {
      return `theme=${selectedThemes.join(',')}`;
    } else if (this.currentMode === 'exclure') {
      return `theme=!${selectedThemes.join(',!')}`;
    }
  
    return ''; // Par défaut, renvoie une chaîne vide
  }

  toLowercaseWithoutAccents(text: string): string {
    // Supprimer les accents et convertir en minuscule
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  isFormValid(): boolean {
    return (
        !!this.gameData.nbQuestions && 
        !!this.gameData.questionTime && 
        !!this.gameCode && 
        (this.currentMode === 'tous' || this.generateFilters() !== '')
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      alert('Veuillez remplir tous les champs avant de créer la partie.');
      return;
    }

    this.updateGameData();
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
    this.resetForm();
  }
}
