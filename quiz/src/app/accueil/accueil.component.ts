import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})

export class AccueilComponent {
  constructor(private router: Router) {}

  goToLobby(): void {
    this.router.navigate(['/lobby']);
       
  }
}
