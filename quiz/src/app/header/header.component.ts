import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(private router: Router) {}

  // Méthodes appelées au clic du bouton
  goToConnexion(): void {
    this.router.navigate(['/connexion']);

  }

  goToAccueil(): void {
    this.router.navigate(['']);

  }
}

