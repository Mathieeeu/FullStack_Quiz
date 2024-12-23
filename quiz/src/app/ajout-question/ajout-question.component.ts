import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../service/question.service';

@Component({
  selector: 'app-ajout-question',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './ajout-question.component.html',
  styleUrl: './ajout-question.component.css'
})
export class AjoutQuestionComponent {
  tabs: string[] = ['Basique', 'QCM', 'Plusieurs réponses', 'Vrai/Faux'];
  currentTab: number = 0;
  themes: string[] = ['Géographie','Histoire','Botanique','Logique', 'Sciences','Culture','Sport','Cuisine','Autre'];


  // Les données du formulaire
  formData: any = {
    questionText: '',
    answerText: '',
    themeText: '',
    difficulty: ''
  };

  constructor(
    private questionService: QuestionService,
  )
    {}

  // Changer d'onglet
  showTab(index: number): void {
    this.currentTab = index;
  }

  // Soumettre le formulaire
  onSubmit(): void {
    console.log('Données du formulaire:', this.formData);
    this.questionService.submitQuestion(this.formData).subscribe(
      (response) => {
        alert('La question a été ajoutée avec succès!');
      },
      (error) => {
        alert('Il y a eu une erreur lors de l\'ajout de la question. Veuillez réessayer.');
      }
    );
  }
}