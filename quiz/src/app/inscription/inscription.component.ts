import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './inscription.component.html',
  styleUrl: './inscription.component.css'
})
export class InscriptionComponent {
  login: string = '';
  password: string = '';
  password_conf: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Méthode appelée au clic du bouton
  goToAdmin(): void {
    if (this.password == this.password_conf){
      if (this.login && this.password && this.password_conf) {
        this.authService.register(this.login, this.password, false).subscribe({
          next: (isAuthenticated) => {
            if (isAuthenticated) {
              this.router.navigate(['/admin']);
            } else {
              alert('Erreur - indentifiant déjà utilisé');
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
    else{
      alert('Mots de passe différents');
    }  
    }
}
