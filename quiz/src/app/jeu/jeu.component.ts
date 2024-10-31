import { Component } from '@angular/core';

import { QuestionComponent } from '../jeu/question/question.component';

@Component({
  selector: 'app-jeu',
  standalone: true,
  imports: [QuestionComponent],
  templateUrl: './jeu.component.html',
  styleUrl: './jeu.component.css'
})
export class JeuComponent {

}
