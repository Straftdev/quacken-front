import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatDialogModule,
} from '@angular/material';

import { LoginComponent } from './login.component';
import { CreateComponent } from './create/create.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';
import { LogoutConfirmComponent } from './logout-confirm/logout-confirm.component';
import { ResetComponent } from './reset/reset.component';

@NgModule({
  declarations: [
    LoginComponent,
    CreateComponent,
    PrivacyComponent,
    TermsComponent,
    LogoutConfirmComponent,
    ResetComponent,
  ],
  entryComponents: [
    TermsComponent,
    PrivacyComponent,
    LogoutConfirmComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
  ]
})
export class LoginModule { }
