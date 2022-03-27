import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { InCmd, Internal } from '../../../ws-messages';
import { EntryStatusComponent } from '../../quacken/entry-status/entry-status.component';
import { Turn } from '../../quacken/boats/boats.component';
import { Lobby } from '../../lobby.component';

export const TeamColors: Readonly<[number, number, number][]> = [
  [146, 236, 30], // green
  [236, 30, 30], // red
  [255, 165, 0], // orange
  [255, 0, 255], // magenta
];
export const TeamColorsCss: Readonly<string[]> = TeamColors.map(c => `rgb(${c.join(', ')})`);
export const TeamNames: Readonly<string[]> = ['Defenders', 'Attackers', '2nd Attackers', '3rd Attackers'];

@Component({
  selector: 'q-cade-entry-status',
  templateUrl: './cade-entry-status.component.html',
  styleUrls: ['./cade-entry-status.component.scss'],
})
export class CadeEntryStatusComponent extends EntryStatusComponent implements OnInit {
  points = [0, 0];
  time = '45:00';
  colors = TeamColorsCss;
  @Input() myTeam?: number;
  @Output() hoveredTeam = new EventEmitter<number>();

  ngOnInit(): void {
    super.ngOnInit();
    this.subs.add(this.ws.subscribe(InCmd.Turn, (t: Turn) => this.points = t.points));
    this.subs.add(this.ws.subscribe(Internal.Lobby, (l: Lobby) => l.points && (this.points = l.points)));
  }
}
