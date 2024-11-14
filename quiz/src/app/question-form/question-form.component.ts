import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { QuestionService } from '../service/question.service';

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
  difficultyText: string = '';

  constructor(private questionService: QuestionService) {}

  addQuestion() {
    const questionData = {
      questionText: this.questionText,
      answerText: this.answerText,
      themeText: this.themeText,
      difficulty: this.difficultyText
    };

    this.questionService.submitQuestion(questionData).subscribe(
      response => {
        console.log('Question added successfully:', response);
        // Vider les champs après l'ajout de la question
        this.questionText = '';
        this.answerText = '';
        this.themeText = '';
        this.difficultyText = '';
      },
      error => {
        console.error('Error adding question:', error);
      }
    );
  }
}