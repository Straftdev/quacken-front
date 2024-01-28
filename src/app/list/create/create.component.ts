import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Subscription } from 'rxjs';
import { CadeDesc } from '../../lobby/cadegoose/cadegoose.component';
import { QuackenDesc } from '../../lobby/quacken/quacken.component';
import { SbDesc } from '../../lobby/seabattle/seabattle.component';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../settings/setting/settings';
import { InCmd, OutCmd } from '../../ws/ws-messages';
import { WsService } from '../../ws/ws.service';
import { SettingMap } from '../../settings/types';

export const Descriptions = {
  Quacken: QuackenDesc,
  Spades: 'A classic card game.',
  CadeGoose: CadeDesc,
  SeaBattle: SbDesc,
};

const groups = ['quacken', 'spades', 'cade', 'cade', 'flaggames'];

@Component({
  selector: 'q-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateComponent implements OnInit, OnDestroy {
  created = false;
  settings: SettingMap = {};
  createGroup: SettingMap = {};
  idDescriptions = Object.values(Descriptions);
  typeSettings: (keyof typeof Settings)[][] = [
    ['maxPlayers', 'hotEntry', 'publicMode'],
    ['turnTime', 'playTo', 'watchers'],
    ['cadeMaxPlayers', 'cadeHotEntry', 'cadePublicMode', 'allowGuests'],
    ['cadeMaxPlayers', 'cadeHotEntry', 'cadePublicMode', 'allowGuests'],
    ['flagMaxPlayers', 'flagHotEntry', 'flagPublicMode', 'flagAllowGuests'],
  ];

  private sub = new Subscription();

  constructor(
    public ws: WsService,
    private ss: SettingsService,
    private ref: MatDialogRef<CreateComponent>,
  ) { }

  ngOnInit(): void {
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (!v) return;
      this.ws.send(OutCmd.LobbyListJoin);
      void this.ss.getGroup('l/create').then(s => {
        this.settings = s;
        void this.changeType();
      });
    }));
    this.sub.add(this.ws.subscribe(InCmd.NavigateTo, () => this.ref.close()));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  createLobby(): void {
    this.createGroup.createType = this.settings.createType ?? this.createGroup.createType;
    const group: SettingMap = {};
    for (const [key, value] of Object.entries(this.createGroup)) {
      if (!value) continue;
      const copy = { ...value };
      delete copy.stream;
      if (value?.value !== undefined) group[key] = copy;
    }
    this.ws.send(OutCmd.LobbyCreate, group);
    this.created = true;
  }

  async changeType(): Promise<void> {
    this.createGroup = await this.ss.getGroup('l/' + groups[this.settings.createType?.value || 0], true);
  }
}
