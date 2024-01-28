import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import * as dayjs from 'dayjs';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import { MatSort } from '@angular/material/sort';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatLegacyChipInputEvent } from '@angular/material/legacy-chips';
import { OutCmd } from '../../../ws/ws-messages';
import { WsService } from '../../../ws/ws.service';
import { StatService } from '../stat.service';
import { TeamImages } from '../../../lobby/cadegoose/types';
import { Match, TeamPlayer } from '../types';

const Results = ['N/A', 'Loss', 'Draw', 'Win'];

function searchMatch(match: Match, term: string): boolean {
  if (match.lobby.toLowerCase().indexOf(term) !== -1) return true;
  if (match.createdAtString.toLowerCase().indexOf(term) !== -1) return true;
  if (match.score.toString().indexOf(term) !== -1) return true;
  if ((Results[match.result] as string).toLowerCase().indexOf(term) !== -1) return true;
  for (const p of match.players) {
    if (p.from.toLowerCase().indexOf(term) !== -1) return true;
  }
  return false;
}

@Component({
  selector: 'q-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchesComponent implements OnInit {
  matches: Match[][] = [[], [], [], []];
  teamImages = TeamImages;
  results = Results;

  dataSource = new TableVirtualScrollDataSource<Match>();
  displayedColumns = ['lobby', 'createdAtString', 'score', 'result', 'team', 'players', 'view'];
  @ViewChild(MatSort) sort?: MatSort;
  searchTerms: string[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    public ws: WsService,
    public stat: StatService,
    private cd: ChangeDetectorRef,
  ) {
    this.dataSource.filterPredicate = (data: Match, filter: string) => {
      if (!searchMatch(data, filter)) return false;

      for (const term of this.searchTerms) {
        if (term === filter) continue;
        if (!searchMatch(data, term)) return false;
      }
      return true;
    };
  }

  ngOnInit(): void {
    this.stat.profileTabChange$.subscribe(value => {
      if (value === 4) void this.fetchMatches();
    });
  }

  async fetchMatches(name = this.stat.target): Promise<void> {
    if (name !== this.stat.target) {
      this.stat.target = name;
      void this.stat.refresh();
    }
    const matches = await this.ws.request(OutCmd.MatchesUser, this.stat.target);
    // matches.push(...matches);
    // matches.push(...matches);
    // matches.push(...matches);
    // matches.push(...matches);
    // matches.push(...matches);
    // matches.push(...matches);
    // matches.push(...matches);
    // matches.push(...matches);
    this.matches = [[], [], [], []];
    if (!matches) return this.updateDataSource();
    let newest = { createdAt: 0 } as Match;
    for (const m of matches) {
      if (m.createdAt > newest.createdAt) newest = m;
      m.createdAtString = dayjs.unix(m.createdAt).format('D MMM YYYY HH:mm');
      m.teams = this.parseTeams(m.players);
      this.matches[m.rankArea - 1]?.push(m);
    }
    this.stat.group = (newest.rankArea ?? 2) - 1;

    if (!this.matches[this.stat.group]?.length) {
      for (let i = 0; i < this.matches.length; i++) if (this.matches[i]?.length) this.stat.group = i;
    }
    this.updateDataSource();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase() || this.searchTerms[0] || '';
  }

  updateDataSource(): void {
    this.dataSource.data = this.matches[this.stat.group] || [];
    setTimeout(() => {
      if (!this.dataSource.sort) {
        this.sort?.sort({ id: 'createdAtString', start: 'desc', disableClear: false });
      }
      this.dataSource.sort = this.sort || null;
    });
    this.cd.detectChanges();
  }

  private parseTeams(players: TeamPlayer[]): TeamPlayer[][] {
    const teams: TeamPlayer[][] = [];
    for (const p of players) {
      if (p.team >= 99) continue;
      const team = teams[p.team] ?? [];
      team.push(p);
      teams[p.team] = team;
    }
    return teams;
  }

  imgSrc(team: keyof typeof TeamImages): string {
    return this.teamImages[team].src;
  }

  imgTitle(team: keyof typeof TeamImages): string {
    return this.teamImages[team].title;
  }

  addSearchTerm(event: MatLegacyChipInputEvent): void {
    const value = (event.value || '').trim().toLowerCase();
    if (value) {
      this.searchTerms.push(value);
    }
    event.chipInput?.clear();
    this.applyFilter(this.searchTerms[0] || '');
  }

  removeSearchTerm(index: number): void {
    if (index >= 0) {
      this.searchTerms.splice(index, 1);
    }
    this.applyFilter(this.searchTerms[0] || '');
  }
}
