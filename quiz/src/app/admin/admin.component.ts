import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { SessionAdminService } from '../service/session-admin.service';

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

  constructor(
    private authService: AuthService,
    private SessionAdminService: SessionAdminService
  ) {
    this.login = this.SessionAdminService.getUsername();
    this.superUser = this.SessionAdminService.getSuperUser();
  }

  ngOnInit(): void {
    this.loadUsers();
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

  showTab(index: number): void {
    this.currentTab = index;
  }
}
