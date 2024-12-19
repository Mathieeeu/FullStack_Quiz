import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './connexion.component.html',
  styleUrl: './connexion.component.css'
})
export class ConnexionComponent {
  login: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Méthode appelée au clic du bouton
  goToAdmin(): void {
      if (this.login && this.password) {
      this.authService.login(this.login, this.password).subscribe({
        next: (isAuthenticated) => {
          if (isAuthenticated) {
            this.router.navigate(['/admin']);
          } else {
            alert('Identifiants incorrects');
          }
        },
        error: (error) => {
          console.error('Erreur lors de la tentative de connexion', error);
        },
        complete: () => {
          console.log('Requête terminée');
        }
      });
      } else {
        alert('Veuillez remplir tous les champs');
      }
    }

}
