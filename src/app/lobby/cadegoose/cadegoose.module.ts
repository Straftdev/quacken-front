import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { TwodRenderModule } from './twod-render/twod-render.module';

import { CadegooseComponent } from './cadegoose.component';
import { QdragModule } from 'src/app/qdrag/qdrag.module';
import { ChatModule } from 'src/app/chat/chat.module';
import { SettingsModule } from 'src/app/settings/settings.module';
import { QuackenModule } from '../quacken/quacken.module';
import { CadeHudComponent } from './hud/hud.component';
import { CadeEntryStatusComponent } from './cade-entry-status/cade-entry-status.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule, TooltipComponent } from '@angular/material/tooltip';
import { NameModule } from 'src/app/chat/name/name.module';
import { StatsComponent } from './stats/stats.component';
import { StatEndComponent } from './stat-end/stat-end.component';
import { ThreedRenderComponent } from './threed-render/threed-render.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RatingModule } from '../../settings/rating/rating.module';

@NgModule({
  declarations: [
    CadegooseComponent, CadeHudComponent, CadeEntryStatusComponent,
    MainMenuComponent, StatsComponent, StatEndComponent,
    ThreedRenderComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
    QdragModule,
    ChatModule,
    SettingsModule,
    QuackenModule,
    NameModule,
    TwodRenderModule,
    RatingModule,
  ],
  exports: [
    CadegooseComponent,
    CadeHudComponent,
    StatsComponent,
    MainMenuComponent,
    CadeEntryStatusComponent,
    StatEndComponent,
  ],
})
export class CadegooseModule { }
