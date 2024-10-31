import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [],
  templateUrl: './connexion.component.html',
  styleUrl: './connexion.component.css'
})
export class ConnexionComponent {
  constructor(private router: Router) {}

  // Méthode appelée au clic du bouton
  goToAdmin(): void {
    this.router.navigate(['/admin']);

  }

}
