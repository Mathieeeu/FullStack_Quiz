import { Component } from '@angular/core';
import { GameService } from '../service/game.service';
import { SessionAdminService } from '../service/session-admin.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Theme {
  name: string;
  status: 'neutral' | 'include' | 'exclude';
}

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
  difficulty : string[] = [];

  themes : Theme[] = [];

  currentMode: 'tous' | 'inclure' | 'exclure' = 'tous';

  gameData = {
    host: this.hote,
    nbQuestions: null,
    filters: '',
    questionTime: null,
    code : this.gameCode,
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
    this.gameService.getThemes().subscribe(
      (data: any) => {
        interface ThemeData {
          name: string;
          numberOfQuestions: number;
          percentageOfTotalQuestions: number;
        }
        const themes2: ThemeData[] = data.themes;
        this.themes = themes2.map(theme => ({
          name: theme.name.charAt(0).toUpperCase() + theme.name.slice(1), // Capitalize first letter
          status: 'neutral' // Default status
        }));
        console.log(this.themes)
      },
      (error: any) => {
        console.error(error);
      }
    );
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
      code: '',
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

  // Gère les changements des cases à cocher
  updateFilters(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;

    if (checkbox.checked) {
      // Ajoute la valeur si elle n'est pas déjà dans le tableau
      if (!this.difficulty.includes(value)) {
        this.difficulty.push(value);
      }
    } else {
      // Supprime la valeur si elle est décochée
      this.difficulty = this.difficulty.filter(v => v !== value);
    }
  }

  generateFilters(): string {
    let themeFilter = '';
    if (this.currentMode !== 'tous') {
      const selectedThemes = this.themes
        .filter(theme => 
          (this.currentMode === 'inclure' && theme.status === 'include') || 
          (this.currentMode === 'exclure' && theme.status === 'exclude')
        )
        .map(theme => theme.name);

      if (this.currentMode === 'inclure') {
        themeFilter = `theme=${selectedThemes.join(',')}`;
      } else if (this.currentMode === 'exclure') {
        themeFilter = `theme=!${selectedThemes.join(',!')}`;
      }
    }

    const selectedDifficulties = this.difficulty.join(',');
    const difficultyFilter = selectedDifficulties ? `difficulty=${selectedDifficulties}` : '';

    return [themeFilter, difficultyFilter].filter(part => part !== '').join('&');
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
