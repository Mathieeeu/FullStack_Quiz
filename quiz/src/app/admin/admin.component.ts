import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';

import { AuthService } from '../service/auth.service';
import { SessionAdminService } from '../service/session-admin.service';
import { GameService } from '../service/game.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  login: string = '';
  superUser: boolean = false;
  tabs: string[] = ['Mon compte', 'Gestion comptes', 'Gestion parties'];
  currentTab: number = 0;
  users: any[] = [];
  games: any[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private SessionAdminService: SessionAdminService,
    private gameService: GameService,
  ) {
    this.login = this.SessionAdminService.getUsername();
    this.superUser = this.SessionAdminService.getSuperUser();
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadGames();
    this.subscription = interval(1000).subscribe(() => {
      this.loadUsers();
      this.loadGames();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadUsers(): void {
    this.authService.getUsers().subscribe(
      (users) => {
        this.users = users.map(user => ({
          ...user,
          Superuser: !!user.Superuser // Ensure Superuser is a boolean
        }));
      },
      (error) => {
        console.error('Erreur lors du chargement des utilisateurs', error);
      }
    );
  }

  loadGames(): void {
    this.gameService.getGames().subscribe(
      (games: any[]) => {
        this.games = games.map(game => ({
          ...game,
          creationDate: this.formatDate(game.creationDate)
        }));
      },
      (error) => {
        console.error('Erreur lors du chargement des parties', error);
      }
    );
  }

  formatDate(dateString: string): string {
    const dateParts = dateString.split('_'); 
    const formattedDate = `${dateParts[0]} ${dateParts[1].replace(/_/g, ':')}`;
    return formattedDate;
  }

  toggleSuperUser(user: any): void {
    user.Superuser = !user.Superuser;
    this.authService.editUser(user, 'superuser').subscribe(
      () => {
        console.log('Statut de super utilisateur mis à jour');
        this.loadUsers(); // Rafraîchir la liste des utilisateurs
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du statut de super utilisateur', error);
      }
    );
  }

  editUsername(user: any): void {
    const newUsername = prompt("Nouvel identifiant:", user.username);
    if (newUsername) {
      this.authService.editUser(user, 'rename', newUsername).subscribe(
        () => {
          console.log('Utilisateur renommé avec succès');
          this.loadUsers(); // Rafraîchir la liste des utilisateurs
        },
        (error) => {
          console.error('Erreur lors du renommage de l\'utilisateur', error);
        }
      );
    }
  }

  deleteUser(user: any): void {
    if (confirm(`Voulez-vous vraiment supprimer l'utilisateur ${user.username} ?`)) {
      this.authService.deleteUser(user.username).subscribe(
        () => {
          console.log('Utilisateur supprimé avec succès');
          this.loadUsers(); // Rafraîchir la liste des utilisateurs
        },
        (error) => {
          console.error('Erreur lors de la suppression de l\'utilisateur', error);
        }
      );
    }
  }

  launchGame(game: any): void {
    this.gameService.startGame(game.code).subscribe(
      () => {
        console.log('Partie lancée avec succès');
        this.loadGames(); // Rafraîchir la liste des parties
      },
      (error) => {
        console.error('Erreur lors du lancement de la partie', error);
      }
    );
  }

  deleteGame(game: any): void {
    if (confirm(`Voulez-vous vraiment supprimer la partie ${game.code} ?`)) {
      this.gameService.deleteGame(game.code).subscribe(
        () => {
          console.log('Partie supprimée avec succès');
          this.loadGames(); // Rafraîchir la liste des parties
        },
        (error) => {
          console.error('Erreur lors de la suppression de la partie', error);
        }
      );
    }
  }

  showTab(index: number): void {
    this.currentTab = index;
  }
}
