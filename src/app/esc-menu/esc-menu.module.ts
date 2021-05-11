import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ChatModule } from '../chat/chat.module';
import { InventoryModule } from './inventory/inventory.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { EscMenuComponent } from './esc-menu.component';
import { ProfileComponent } from './profile/profile.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule, TooltipComponent } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeadersComponent } from './profile/leaders/leaders.component';
import { NameModule } from '../chat/name/name.module';
import { SettingsModule } from '../settings/settings.module';
import { LogoutConfirmComponent } from './logout-confirm/logout-confirm.component';
import { MatchesComponent } from './profile/matches/matches.component';
import { FriendsModule } from '../chat/friends/friends.module';

@NgModule({
  declarations: [
    EscMenuComponent,
    LeadersComponent,
    ProfileComponent,
    LogoutConfirmComponent,
    MatchesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatExpansionModule,
    MatCardModule,
    ChatModule,
    InventoryModule,
    NameModule,
    SettingsModule,
    FriendsModule,
  ],
  exports: [EscMenuComponent],
})
export class EscMenuModule { }
