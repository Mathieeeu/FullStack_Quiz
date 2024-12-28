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


  // Les données du formulaire
  formData: any = {
    questionText : '',
    answerText : null,
    themeText : '',
    difficulty : '',
    questionType: null,
    fakeAnswer : null,
    trueAnswers : null,
    fakeAnswers : null
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
  
  remplirForm(){
    this.selectValue;
    if (this.currentTab == 1){
      this.formData.questionType = 'QCM';
    }
    else if (this.currentTab == 2){
      this.formData.questionType = 'Selection';
    }
    else if (this.currentTab == 3){
      this.formData.questionType = 'Vrai/Faux';
    }
    else{
      this.formData.questionType = 'Simple';
    }
  }

  // Soumettre le formulaire
  onSubmit(): void {
    console.log('Données du formulaire:', this.formData);
    this.remplirForm();
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