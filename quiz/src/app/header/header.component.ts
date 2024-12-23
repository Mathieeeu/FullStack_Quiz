import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionAdminService } from '../service/session-admin.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
  login: string = '';
  superUser: boolean = false;
  menuOpen: boolean = false;

  constructor(
    private router: Router,
    private sessionAdmin: SessionAdminService
  ) {}

  ngOnInit(): void {
    // S'abonner aux changements de session
    this.sessionAdmin.username$.subscribe((username) => {
      this.login = username;
    });

    this.sessionAdmin.superUser$.subscribe((isSuperUser) => {
      this.superUser = isSuperUser;
    });
  }

  goToConnexion(): void {
    this.router.navigate(['/connexion']);
  }

  goToAccueil(): void {
    this.router.navigate(['/']);
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  deconnexion(){
    this.sessionAdmin.clearSession();
    this.login = '';
    this.superUser = false;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}