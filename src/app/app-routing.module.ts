import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { CreateComponent } from './login/create/create.component';
import { AuthGuard } from './auth.guard';
import { TermsComponent } from './login/terms/terms.component';
import { PrivacyComponent } from './login/privacy/privacy.component';
import { ResetComponent } from './login/reset/reset.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'terms',
    component: TermsComponent,
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
  },
  {
    path: 'create',
    component: CreateComponent,
  },
  {
    path: 'reset/:token',
    component: ResetComponent,
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'list',
        loadChildren: () => import('./list/list.module').then(m => m.ListModule),
      },
      {
        path: 'lobby/:id',
        loadChildren: () => import('./lobby/lobby.module').then(m => m.LobbyModule),
      },
      {
        path: 'editor',
        loadChildren: () => import('./map-editor/map-editor.module').then(m => m.MapEditorModule),
      },
      {
        path: '**',
        redirectTo: 'list',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
