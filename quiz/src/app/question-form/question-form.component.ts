import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './question-form.component.html',
  styleUrl: './question-form.component.css'
})
export class QuestionFormComponent {
  questionText: string = '';
  answerText: string = '';
  themeText: string = '';

  addQuestion() {
    // Implémenter l'ajout d'une question
    console.log('Question: ' + this.questionText);
    console.log('Answer: ' + this.answerText);
    console.log('Theme: ' + this.themeText);

    // Vider les champs après l'ajout de la question
    this.questionText = '';
    this.answerText = '';
    this.themeText = '';
  }
}