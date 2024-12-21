import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SessionAdminService} from '../service/session-admin.service';

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
  superUser: boolean = false; // valeur par défaut

  constructor(
    private authService: AuthService, 
    private router: Router,
    private sessionAdmin: SessionAdminService
  ) 
  {}


  // Méthode appelée au clic du bouton
  goToAdmin(): void {
    if (this.password == this.password_conf){
      if (this.login && this.password && this.password_conf) {
        this.authService.register(this.login, this.password, false).subscribe({
          next: (isAuthenticated) => {
            if (isAuthenticated) {
              this.sessionAdmin.setUsername(this.login);
              this.router.navigate(['/admin']);
            }
          },
          error: (error) =>{
             if (error.status === 409) { // Code d'état HTTP pour conflit (identifiant pris)
              alert('Identifiant déjà utilisé');
            } else {
              alert('Erreur lors de l\'inscription');
            }
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
