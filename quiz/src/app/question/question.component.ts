import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameService } from '../service/game.service'; // Chemin vers votre service

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit {
  questions: any[] = [];
  code: string;

  constructor(private route: ActivatedRoute, private gameService: GameService) {
    this.code = this.route.snapshot.paramMap.get('code') || '';
  }

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.gameService.getGameDetails(this.code).subscribe(data => {
      this.questions = data.questions; // Supposant que les questions sont une partie des détails du jeu
    }, error => {
      console.error(error);
    });
  }
}
