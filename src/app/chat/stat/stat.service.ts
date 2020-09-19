import { Injectable } from '@angular/core';

import { WsService } from 'src/app/ws.service';
import { FriendsService } from '../friends/friends.service';
import { WindowService } from 'src/app/window.service';
import { Message } from '../chat.service';
import { InCmd, OutCmd } from 'src/app/ws-messages';

export interface Stat {
  statId: number;
  name: string;
  value: number;
  suffix?: number;
}

export interface Leader extends Message {
  name: string;
  value: number;
  details?: string;
  clean?: boolean;
  seed?: string;
}

export interface Column {
  title: string;
  property: keyof Leader;
}

const mapColumns: Column[] = [
  { title: 'Details', property: 'details' },
  { title: 'Fresh Seed', property: 'clean' },
  { title: 'Seed', property: 'seed' },
];

@Injectable({
  providedIn: 'root'
})
export class StatService {
  open = false;
  target = '';
  stats: Stat[] = [];

  leadersOpen = false;
  id = 0;
  groupName = '';
  leaders: Leader[] = [];
  columns: Column[] = [];

  constructor(
    private ws: WsService,
    private fs: FriendsService,
    private wd: WindowService,
  ) { }

  openUser(name: string) {
    this.target = name;
    this.open = true;
    this.refresh();
    this.wd.active = 'stat';
  }

  openLeaders(id: number, name: string) {
    this.id = id;
    this.groupName = name;
    this.leadersOpen = true;
    this.refreshLeaders();
    this.wd.active = 'leaders';
  }

  async refresh() {
    this.stats = [];
    this.stats = await this.ws.request(OutCmd.StatsUser, this.target);
  }

  async refreshLeaders() {
    this.leaders = [];
    const leaders = await this.ws.request(OutCmd.StatsTop, this.id);
    this.leaders = leaders;
    if (!leaders || !leaders.length) return;

    if (leaders[0].seed) this.columns = mapColumns;
    else this.columns = [];
    for (const l of leaders) {
      l.from = l.name;
      l.friend = this.fs.isFriend(l.name);
    }
  }
}
