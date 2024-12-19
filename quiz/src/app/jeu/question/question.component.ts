import { Component } from '@angular/core';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [],
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent {
  // Exemple de code JavaScript
  ngOnInit() {    

    let time = document.getElementById('time');
    let bc = document.getElementById('bc');
    let sc = document.getElementById('sc');
    let dot = document.querySelector('.dot');
    let btn = document.getElementById('timer-start');
    if (btn) {
      btn.addEventListener('click', start);
    }

    // Initialisation variables 
    let nb_question = 2;
    let no_question = 0;
    let timer:any;
    let max:number;
    let count:number;

    // Exemple question :
    let question_theme = 'Géographie';
    let question_text = 'Quel est le pays qui compte le plus de lacs ?';
    showQuestion(5, question_theme, question_text, '');

    function showQuestion(question_max: number,question_theme: string,question_text: string,question_answer: string){
      let question_nb_span = document.getElementById('question-nb');
      let question_theme_span = document.getElementById('question-theme');
      let question_text_span = document.getElementById('question-text');

      if (question_nb_span && question_theme_span && question_text_span) {

        max = question_max;
        count = max;
        resetTimer(max);

        no_question++;
        question_nb_span.innerHTML = `Question ${no_question}/${nb_question}`;
        question_theme_span.innerHTML = question_theme;
        question_text_span.innerHTML = `${question_text}`;
      }
    }

    function start(){
      if (btn && time && bc && sc && dot) {
        btn.style.visibility = 'hidden';
        timer = setInterval(function(){
          count--;
          if (count == -1) {
              btn.style.visibility = 'visible';
              nextQuestion();
          }
          time.innerHTML = count.toString();
          bc.style.stroke = 'var(--box)';
  
          sc.style.strokeDashoffset = ((314 * count) / max).toString();
          (dot as HTMLElement).style.transform = `rotateZ(${(max-count) / max * 360}deg)`;
  
          sc.style.transition = 'linear 1s';
          (dot as HTMLElement).style.transition = 'linear 1s';
  
      }, 1000);
    }
  }
  
  function resetTimer(count:number){
    if (time && bc && dot && sc) {
      time.innerHTML = count.toString();
      bc.style.stroke = 'var(--box)';
      (dot as HTMLElement).style.stroke = 'var(--grn)';
      sc.style.transition = 'none';
      (dot as HTMLElement).style.transition = 'none';
      sc.style.strokeDashoffset = "314";
    }
  }
  
  function nextQuestion(){
      // remplir
      max = 5;
      question_theme = 'Histoire';
      question_text = 'En quelle année Auguste a-t-il été sacré empereur ?'
      showQuestion(max, question_theme, question_text, '');
      resetTimer(max)
      clearInterval(timer);
      count = max;
      if (no_question <= nb_question) {
        start()
      }
      else {
        return;
      }
    }
  }
}