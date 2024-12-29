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
  selectedValue: String | null = null;

  // Liste des réponses pour le QCM
  answers: string[] = ['', ''];
  correctAnswerIndex: number | null = null;
  correctAnswerIndices: number[] = [];


  // Les données du formulaire
  formData: any = {
    questionText : '',
    answerText : null,
    themeText : '',
    difficulty : '',
    questionType: null,
    fakeAnswer : [],
    trueAnswers : null,
    fakeAnswers : []
  };


  constructor(
    private questionService: QuestionService,
  )
    {}

  // Changer d'onglet
  showTab(index: number): void {
    this.currentTab = index;
  }

  selectTheme(selectedTheme: any): void {
    this.themes.forEach(theme => theme.status = 'neutral');
    selectedTheme.status = 'selected';
    this.formData.themeText = this.toLowercaseWithoutAccents(selectedTheme.name);
  }

  selectValue(value: String): void {
    this.selectedValue = value;
    this.formData.answerText = value;
  }

  toLowercaseWithoutAccents(text: string): string {
    // Supprimer les accents et convertir en minuscule
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // QCM
  addAnswer(): void {
    if (this.answers.length < 10) {
      this.answers.push('');
    }
  }

  removeAnswer(): void {
    if (this.answers.length > 2) {
      this.answers.pop();
      if (this.currentTab === 2){
        const removedIndex = this.answers.length - 1;
        this.correctAnswerIndices = this.correctAnswerIndices.filter(index => index !== removedIndex);
      }
    }
  }

  toggleCorrectAnswer(index: number): void {
    if (this.correctAnswerIndices.includes(index)) {
      this.correctAnswerIndices = this.correctAnswerIndices.filter(i => i !== index);
    } else {
      this.correctAnswerIndices.push(index);
    }
  }

  trackByFn(index: number, item: string): number {
    return index; // Utilise l'index comme identifiant unique
  }


  
  remplirForm(){
    if (this.currentTab === 1) {
      this.formData.questionType = 'QCM';
      if (this.correctAnswerIndex !== null && this.correctAnswerIndex >= 0 && this.correctAnswerIndex < this.answers.length) {
        this.formData.answerText = this.answers[this.correctAnswerIndex];
        this.formData.fakeAnswer = this.answers.filter((_, index) => index !== this.correctAnswerIndex);
      } else {
        console.error('Index de la réponse correcte invalide ou non défini');
        this.formData.answerText = null;
        this.formData.fakeAnswer = [];
      }
    } else if (this.currentTab === 2) {
      this.formData.questionType = 'Selection';
      this.formData.trueAnswers = this.correctAnswerIndices.map(index => this.answers[index]);
      this.formData.fakeAnswers = this.answers.filter((_, index) => !this.correctAnswerIndices.includes(index));
    } else if (this.currentTab === 3) {
      this.formData.questionType = 'Vrai/Faux';
    } else {
      this.formData.questionType = 'Ouverte';
    }
  }


  resetForm(): void {
    this.formData = {
        questionText: '',
        answerText: null,
        themeText: '',
        difficulty: '',
        questionType: null,
        fakeAnswer: null,
        trueAnswers: null,
        fakeAnswers: null
    };

    this.themes.forEach(theme => theme.status = 'neutral'); 
    this.currentTab = 0; 
    this.selectedValue = null; 
}


  // Soumettre le formulaire
  onSubmit(): void {
    // // Vérifiez que toutes les réponses sont renseignées (QCM)
    // const nonEmptyAnswers = this.answers.filter(answer => answer.trim() !== '');
    // if (nonEmptyAnswers.length < 2) {
    //   alert('Veuillez entrer au moins deux réponses valides.');
    //   return;
    // }

    // // Vérifiez qu'une réponse correcte est sélectionnée
    // if (this.correctAnswerIndex === null || this.correctAnswerIndex < 0 || this.correctAnswerIndex >= this.answers.length) {
    //   alert('Veuillez sélectionner une réponse correcte.');
    //   return;
    // }


    this.remplirForm();
    this.questionService.submitQuestion(this.formData).subscribe(
      (response) => {
        alert('La question a été ajoutée avec succès!');
        this.resetForm();
      },
      (error) => {
        alert('Il y a eu une erreur lors de l\'ajout de la question. Veuillez réessayer.');
      }
    );
  }
}