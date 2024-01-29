import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

import { WsService } from '../../ws/ws.service';
import { Competitions } from './competition';
import { InCmd, OutCmd } from '../../ws/ws-messages';
import { ServerSettingMap } from '../../settings/types';

@Component({
  selector: 'q-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompetitionComponent implements OnInit, OnDestroy {
  created = false;
  competitions = Competitions;
  selectedRound = Competitions[0]?.rounds[0];
  private sub = new Subscription();

  constructor(
    public ws: WsService,
    private ref: MatDialogRef<CompetitionComponent>,
  ) { }

  ngOnInit(): void {
    this.sub.add(this.ws.subscribe(InCmd.NavigateTo, () => this.ref.close()));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  createLobby(c: ServerSettingMap<'l/cade'>): void {
    this.created = true;
    this.ws.send(OutCmd.LobbyCreate, c as ServerSettingMap);
  }
}
