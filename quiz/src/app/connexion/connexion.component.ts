import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { mergeMap } from 'rxjs/operators';

import { SessionAdminService} from '../service/session-admin.service';

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
  superUser: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private sessionAdmin: SessionAdminService
  ) 
  { }

  // Méthode appelée au clic du bouton
  goToAdmin(): void {
    if (this.login && this.password) {
      this.authService.login(this.login, this.password).pipe(
        mergeMap((isAuthenticated) => {
          if (!isAuthenticated) {
            throw new Error('Identifiants incorrects');
          }
          return this.authService.getSuperUser(this.login);
        })
      ).subscribe({
        next: (result) => {
          console.log(result);
          this.superUser = result;
  
          // Mettre à jour la session
          this.sessionAdmin.setUsername(this.login);
          this.sessionAdmin.setSuperUser(this.superUser);
  
          // Redirection
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          console.error('Erreur', err);
          alert(err.message || 'Une erreur est survenue.');
        },
        complete: () => {
          console.log('Requête terminée');
        }
      });
    } else {
      alert('Veuillez remplir tous les champs');
    }
  } 
  
  goToInscription(): void {
    this.router.navigate(['/inscription']);
  }

}
