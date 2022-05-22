import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

import { WsService } from '../../ws.service';
import { Competitions } from './competition';
import { InCmd, OutCmd } from '../../ws-messages';
import { SettingMap } from '../../settings/settings.service';

@Component({
  selector: 'q-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.scss'],
})
export class CompetitionComponent implements OnInit, OnDestroy {
  created = false;
  competitions = Competitions
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

  createLobby(c: SettingMap): void {
    this.created = true;
    this.ws.send(OutCmd.LobbyCreate, c);
  }
}
