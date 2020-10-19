import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';

import { CadegooseComponent } from './cadegoose.component';
import { QdragModule } from 'src/app/qdrag/qdrag.module';
import { ChatModule } from 'src/app/chat/chat.module';
import { SettingsModule } from 'src/app/settings/settings.module';
import { QuackenModule } from '../quacken/quacken.module';
import { CadeHudComponent } from './hud/hud.component';
import { CadeEntryStatusComponent } from './cade-entry-status/cade-entry-status.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { NameModule } from 'src/app/chat/name/name.module';
import { StatsComponent } from './stats/stats.component';
import { StatEndComponent } from './stat-end/stat-end.component';

@NgModule({
  declarations: [CadegooseComponent, CadeHudComponent, CadeEntryStatusComponent, MainMenuComponent, StatsComponent, StatEndComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    QdragModule,
    ChatModule,
    SettingsModule,
    QuackenModule,
    NameModule,
  ],
  exports: [CadegooseComponent],
})
export class CadegooseModule { }
