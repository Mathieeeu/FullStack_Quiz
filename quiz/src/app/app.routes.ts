import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccueilComponent } from './accueil/accueil.component';
import { JeuComponent } from './jeu/jeu.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AdminComponent } from './admin/admin.component';
import { ConnexionComponent } from './connexion/connexion.component';
import { QuestionFormComponent } from './question-form/question-form.component';
import { QuestionListComponent } from './question-list/question-list.component';
import { LobbyComponent } from './lobby/lobby.component';
import { CreateGameComponent } from './create-game/create-game.component';
import { JoinGameComponent } from './join-game/join-game.component';
import { QuestionComponent } from './question/question.component'

export const routes: Routes = [
  { path: '', component: AccueilComponent },
  { path: 'jeu', component: JeuComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'form', component: QuestionFormComponent },
  { path: 'list', component: QuestionListComponent },
  { path: 'lobby/:code', component: LobbyComponent},
  { path: 'question/:code', component: QuestionComponent},
  { path: 'create', component: CreateGameComponent },
  { path: 'join', component: JoinGameComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule] })

export class AppRoutingModule { }