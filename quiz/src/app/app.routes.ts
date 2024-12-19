import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccueilComponent } from './accueil/accueil.component';
import { JeuComponent } from './jeu/jeu.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AdminComponent } from './admin/admin.component';
import { ConnexionComponent } from './connexion/connexion.component';
import { QuestionFormComponent } from './question-form/question-form.component';
import { LobbyComponent } from './lobby/lobby.component';
import { CreateGameComponent } from './create-game/create-game.component';
import { GameComponent } from './game/game.component';

export const routes: Routes = [
  { path: '', component: AccueilComponent },
  { path: 'jeu', component: JeuComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'form', component: QuestionFormComponent },
  { path: 'lobby/:code', component: LobbyComponent},
  { path: 'create', component: CreateGameComponent },
  { path: 'game/:code', component: GameComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule] })

export class AppRoutingModule { }