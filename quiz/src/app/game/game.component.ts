import { Component, OnInit, OnDestroy, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { GameService } from '../service/game.service';
import { SessionService } from '../service/session.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('answerInput') answerInput!: ElementRef;
  @ViewChild('trueButton') trueButton!: ElementRef;
  @ViewChild('falseButton') falseButton!: ElementRef;
  @ViewChildren('qcmButton') qcmButtons!: QueryList<ElementRef>;
  @ViewChildren('selectionButton') selectionButtons!: QueryList<ElementRef>;
  @ViewChild('validateButton') validateButton!: ElementRef;
  gameCode: string = '';
  username: string = '';
  gameDetails: any;
  answer: string = '';
  selectedOptions: string[] = [];
  motd: string = '';
  checked: boolean = false;
  private subscription: Subscription = new Subscription();
  private isNavigatingAway: boolean = false;
  private readonly tickRate: number = 4; // Frequence de rafraichissement des données du jeu (en Hz)

  constructor(
    private gameService: GameService,
    private sessionService: SessionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.gameCode = this.route.snapshot.paramMap.get('code') || '';
    this.username = this.sessionService.getUsername();
  }

  ngOnInit(): void {
    // console.log(this.username);
    // console.log(this.gameCode);

    if (!this.username) {
      this.router.navigate(['/']);
    } else {
      this.loadGameDetails();
      this.subscription = interval(1000/this.tickRate).subscribe(() => this.loadGameDetails());
    }

    this.gameService.getMotd().subscribe(
      (data: any) => {
        this.motd = data.motd;
        this.setMotdAnimationSteps(this.motd.length);
      },
      (error: any) => {
        console.error(error);
      }
    );

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  setMotdAnimationSteps(length: number): void {
    const root = document.documentElement;
    root.style.setProperty('--steps', `${length+2}`);
    root.style.setProperty('--stepsch', `${length+2}ch`);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }

    if (this.isNavigatingAway) {
      this.leaveGame();
    }
  }

  loadGameDetails(): void {
    // console.log(this.gameDetails);
    try {
      this.gameService.getGameDetails(this.gameCode).subscribe(
        data => {
          this.gameDetails = data;

          // Focus sur l'input de réponse si une question est en cours (pour éviter de cliquer dessus à chaque fois)
          if (this.answerInput && this.gameDetails.currentQuestionIndex !== -1 && !this.gameDetails.isOver) {
            if (this.gameDetails.currentQuestion.questionType === 'Ouverte') {
              setTimeout(() => this.answerInput.nativeElement.focus(), 0);
            }
          }

          // Si le timer est égal à 0 et que la question est en cours, on check la réponse si c'est une question Ouverte et vide la réponse
          if (this.gameDetails.currentQuestionIndex !== -1  && this.gameDetails.countdown === 0) {
            if (this.gameDetails.currentQuestion.questionType === 'Ouverte') {
              try {
                this.answerInput.nativeElement.style.display = 'none';
                this.answer = '';
              } catch (error) {
                console.error(error);
                console.log('Error while checking answer');
              }
            } else if (this.gameDetails.currentQuestion.questionType === 'Selection') {
              if (!this.checked)  {
                this.checkAnswer();
              }
            }
          }

          // Si le timer est de retour au max, on réinitialise le check
          // console.log(this.gameDetails.countdown);
          // console.log(this.gameDetails.options.questionTime);
          // console.log(this.gameDetails.countdown === this.gameDetails.options.questionTime);
          // console.log(this.checked);
          if (this.gameDetails.countdown === -1 && this.checked) {
            // console.log('Resetting checked');
            this.checked = false;
          }
        },
        error => {
          console.error(error);
        }
      );

      if (this.gameDetails.isOver) {
        // console.log(this.gameDetails);
        // console.log('Game is over');
        this.showEndScreen();
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }

  checkAnswer(selectedAnswer?: string, event?: Event): void {
    // console.log('Answer=' + (selectedAnswer || this.answer));
    // console.log('Checking answer');
    this.checked = true;

    // Jouer un son de plop aléatoire à chaque réponse (parce que c'est marrant non ??)
    const plopSound = new Audio();
    plopSound.src = `/sounds/plop${Math.floor(Math.random() * 5)}.wav`;
    plopSound.load();
    plopSound.play();
  
    const questionType = this.gameDetails.currentQuestion.questionType;
    const clickedButton = event?.target as HTMLElement;
  
    switch (questionType) {
      case 'Ouverte':
        this.checkOpenAnswer();
        break;
      case 'VF':
        this.checkTrueFalseAnswer(selectedAnswer);
        break;
      case 'QCM':
        this.checkMultipleChoiceAnswer(selectedAnswer, clickedButton);
        break;
      case 'Selection':
        this.checkSelectionAnswer();
        break;
      default:
        console.error('Type de question inconnu');
    }
  }
  
  checkOpenAnswer(): void {
  
    if (this.isCorrectAnswer()) {
      // console.log('Bonne réponse');

      // Ptite animation de couleur
      this.answerInput.nativeElement.style.color = 'cyan';
      setTimeout(() => {
        this.answerInput.nativeElement.style.color = '';
        this.answer = '';
        this.answerInput.nativeElement.style.display = 'none';
      }, 300);
  
      // Augmentation du score du joueur
      this.gameService.increaseScore(this.gameCode, this.username).subscribe(
        res => {
          // console.log(res);
        },
        err => console.error(err)
      );
    } else {
      // console.log('Mauvaise réponse');

      this.gameService.hasTriedToAnswer(this.gameCode, this.username).subscribe(
        res => {
          // console.log(res);
        },
        err => console.error(err)
      );
      
      this.answerInput.nativeElement.style.color = 'red';
      setTimeout(() => {
        this.answerInput.nativeElement.style.color = '';
        this.answer = '';
      }, 300);
    }
  }
  
  checkTrueFalseAnswer(selectedAnswer?: string): void {
    const clickedButton = selectedAnswer === 'Vrai' ? this.trueButton : this.falseButton;
    if (this.isCorrectAnswer(selectedAnswer)) {
      // console.log('Bonne réponse');
      clickedButton.nativeElement.style.backgroundColor = 'var(--grn)';
    
      this.gameService.increaseScore(this.gameCode, this.username).subscribe(
        res => {
          // console.log(res);
        },
        err => console.error(err)
      );

    } else {
      // console.log('Mauvaise réponse');
      this.gameService.hasAnswered(this.gameCode, this.username).subscribe(
        res => {
          // console.log(res);
        },
        err => console.error(err)
      );
      clickedButton.nativeElement.style.backgroundColor = 'var(--red)';
    }

    setTimeout(() => {
      clickedButton.nativeElement.style.backgroundColor = '';
      this.trueButton.nativeElement.style.display = 'none';
      this.falseButton.nativeElement.style.display = 'none';
    }, 300);
  }
  
  checkMultipleChoiceAnswer(selectedAnswer?: string, clickedButton?: HTMLElement): void {
    // console.log('Clicked button=' + selectedAnswer); 
    if (clickedButton) {
      if (this.isCorrectAnswer(selectedAnswer)) {
        // console.log('Bonne réponse');
        clickedButton.style.backgroundColor = 'var(--grn)';

        this.gameService.increaseScore(this.gameCode, this.username).subscribe(
          res => {
            // console.log(res);
          },
          err => console.error(err)
        );

      } else{
        // console.log('Mauvaise réponse');
        this.gameService.hasAnswered(this.gameCode, this.username).subscribe(
          res => {
            // console.log(res);
          },
          err => console.error(err)
        );

        clickedButton.style.backgroundColor = 'var(--red)';
      }
      
      setTimeout(() => {
        this.qcmButtons.forEach((button: ElementRef) => {
          button.nativeElement.style.backgroundColor = '';
          button.nativeElement.style.display = 'none';
        });
      }, 300);
      
    } else {
      // console.log('Aucune réponse sélectionnée');
    }
  }

  checkSelectionAnswer(): void {
    const correctAnswerString = this.gameDetails.currentQuestion.trueAnswers.toString().split(',').sort().join(',');
    
    this.validateButton.nativeElement.style.display = 'none';

    if (this.selectedOptions.sort().join(',') === correctAnswerString) {
      // console.log('Bonne réponse');
      
      this.selectedOptions.forEach(option => {
        const button = this.selectionButtons.find((btn: ElementRef) => btn.nativeElement.textContent.trim() === option);
        if (button) {
          button.nativeElement.style.backgroundColor = 'var(--grn)';
        }
      });

      // Augmentation du score du joueur (100% de réussite sur la selection)
      this.gameService.increaseScore(this.gameCode, this.username, 1).subscribe(
        res => {
          // console.log(res);
        },
        err => console.error(err)
      );

    } else {
      // console.log('Mauvaise réponse');
      this.gameService.hasAnswered(this.gameCode, this.username).subscribe(
        res => {
          // console.log(res);
        },
        err => console.error(err)
      );

      this.selectedOptions.forEach(option => {
        const button = this.selectionButtons.find((btn: ElementRef) => btn.nativeElement.textContent.trim() === option);
        if (button) {
          button.nativeElement.style.backgroundColor = 'var(--red)';
        }
      });

      // Calcul du score du joueur en fonction des réponses correctes et incorrectes
      const allAnswers = this.gameDetails.currentQuestion.allAnswers;
      const correctAnswers = correctAnswerString.split(',');
      const selectedAnswers = this.selectedOptions;

      // Nombre de réponses correctes sélectionnées et incorrectes non-sélectionnées
      const correctSelected = selectedAnswers.filter(answer => correctAnswers.includes(answer)).length;
      const incorrectNotSelected = allAnswers.filter((answer: string) => !correctAnswers.includes(answer)).filter((answer: string) => !selectedAnswers.includes(answer)).length;

      // // Nobmre de réponses correctes et incorrectes dans la question
      // const correct = correctAnswers.length;
      // const incorrect = allAnswers.length - correct;

      // Nombre de réponses bien répondues (correctes sélectionnées + incorrectes non-sélectionnées)
      const totalCorrect = correctSelected + incorrectNotSelected;

      // On accorde un score proportionnel à la précision du joueur s'il y a au moins 20% de réponses correctes selectionnées et de réponses incorrectes non-sélectionnées
      let accuracy;
      const seuil = 0.2;
      if (correctSelected >= seuil * correctAnswers.length && incorrectNotSelected >= seuil * (allAnswers.length - correctAnswers.length)) {
        accuracy = totalCorrect / allAnswers.length;
        // console.log(`Précision suffisante pour accorder un score (${accuracy.toFixed(2)})`);
      } else {
        accuracy = 0;
        // console.log(`Précision insuffisante pour accorder un score (${accuracy.toFixed(2)})`);
      }
      
      // // Debug
      // console.log('Réponses correctes dans la question : ' + correct);
      // console.log('Réponses incorrectes dans la question : ' + incorrect);
      // console.log('Réponses correctes sélectionnées : ' + correctSelected);
      // console.log('Réponses incorrectes non-sélectionnées : ' + incorrectNotSelected);
      // console.log('Réponses bien répondues : ' + totalCorrect);

      this.gameService.increaseScore(this.gameCode, this.username, accuracy).subscribe(
        res => {
          // console.log(res);
        },
        err => console.error(err)
      );
    }

    setTimeout(() => {
      this.selectedOptions = [];
      this.selectionButtons.forEach((button: ElementRef) => {
        button.nativeElement.style.backgroundColor = '';
        button.nativeElement.style.display = 'none';
      });
    }, 300);
  }

  toggleSelection(option: string): void {
    const index = this.selectedOptions.indexOf(option);
    if (index > -1) {
      this.selectedOptions.splice(index, 1);
    } else {
      this.selectedOptions.push(option);
    }
  }

  isSelected(option: string): boolean {
    return this.selectedOptions.includes(option);
  }

  levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];

    // Initialisation de la première ligne et de la première colonne
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    // Calcul de la distance de Levenshtein
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // Substitution
            Math.min(
              matrix[i][j - 1] + 1, // Insertion
              matrix[i - 1][j] + 1 // Suppression
            )
          );
        }
      }
    }
    // Retourne la distance de Levenshtein
    return matrix[b.length][a.length];
  }

  isCorrectAnswer(selectedAnswer?: string): boolean {
    const questionType = this.gameDetails.currentQuestion.questionType;
    const correctAnswer = this.gameDetails.currentQuestion.answerText || this.gameDetails.currentQuestion.trueAnswers;
    // console.log('Correct answer=' + correctAnswer);
  
    switch (questionType) {
      case 'Ouverte':
        const distance = this.levenshtein(this.answer.toLowerCase(), correctAnswer.toLowerCase());
        const tolerance = 0.2; // Nombre de fautes autorisées par caractère de la réponse
        const maxDistance = Math.floor(tolerance * correctAnswer.length);
        return distance <= maxDistance;
  
      case 'VF':
        return selectedAnswer === correctAnswer;
  
      case 'QCM':
        return selectedAnswer === correctAnswer;
  
      case 'Selection':
        return this.selectedOptions.sort().join(',') === correctAnswer.toString().split(',').sort().join(',');
  
      default:
        return false;
    }
  }

  showEndScreen(): void {
    // Récupération des scores
    const scores = this.gameDetails.players.map((player: any) => {
      return {
        username: player.username,
        score: player.score
      };
    });

    // Tri des scores
    scores.sort((a: any, b: any) => b.score - a.score);
    
    // console.log('Meilleur score : ' + scores[0]);

    // on redirige vers le menu (peut etre qu'on pourrait faire une page de fin de partie) au bout de 120sec si le joueur ne fait rien
    setTimeout(() => {
      this.leaveGame();
    }, 120000);
    
  }

  leaveGame(): void {
    this.gameService.leaveGame(this.gameCode, this.username).subscribe(
      res => {
        this.sessionService.clearSession();
        this.router.navigate(['/']);
      },
      err => console.error(err)
    );
  }

  handleBeforeUnload = () => {
    this.isNavigatingAway = true;
    this.leaveGame();
  }
}
