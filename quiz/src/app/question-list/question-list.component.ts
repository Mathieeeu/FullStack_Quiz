import { Component, OnInit } from '@angular/core';
import { QuestionService } from '../service/question.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css']
})
export class QuestionListComponent implements OnInit {
  questions: any[] = [];

  constructor(private questionService: QuestionService) {}

  ngOnInit() {
    this.questionService.getQuestions().subscribe(
      (data: any[]) => {
        this.questions = data;
      },
      error => {
        console.error('Error fetching questions', error);
      }
    );
  }
}