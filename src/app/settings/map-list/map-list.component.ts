import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

import { debounceTime, map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Internal, OutCmd } from '../../ws/ws-messages';
import { WsService } from '../../ws/ws.service';
import { SettingsService } from '../settings.service';
import { MapFilterComponent } from './map-filter/map-filter.component';
import { ServerSettingGroup, Settings } from '../setting/settings';
import { MapOption } from './map-card/types';

const starRatings = [
  '4+ Stars',
  '3+ Stars',
  '2+ Stars',
  '1+ Star',
];

const enum SortOptions {
  AscendingAvgRating = 'Ascending Avg. Rating',
  DescendingAvgRating = 'Descending Avg. Rating',
  Newest = 'Newest',
  Oldest = 'Oldest',
  AscendingUser = 'Ascending User',
  DescendingUser = 'Descending User',
  AscendingMapName = 'Ascending Map Name',
  DescendingMapName = 'Descending Map Name',
  MapsYouRated = 'Maps You Rated',
}

const compareRating = (n1: MapOption, n2: MapOption, direction: number) => {
  // Generated map should always be first
  if (n1.id <= 1) return -1;
  if (n2.id <= 1) return 1;

  if (!n1.ratingCount && !n2.ratingCount) return n2.id - n1.id;
  if ((n1.ratingCount > 1) !== (n2.ratingCount > 1)) return n2.ratingCount - n1.ratingCount;
  if (!n1.ratingCount) return 1;
  if (!n2.ratingCount) return -1;
  if (n1.ratingAverage !== n2.ratingAverage) {
    return direction * ((n1.ratingAverage || Number.MIN_VALUE) - (n2.ratingAverage || Number.MIN_VALUE));
  }
  if (n1.ratingCount !== n2.ratingCount) return n2.ratingCount - n1.ratingCount;
  return n2.id - n1.id;
};

const compareProperty = (n1: MapOption, n2: MapOption, direction: number, prop: keyof MapOption) => {
  // Generated map should always be first
  if (n1.id <= 1) return -1;
  if (n2.id <= 1) return 1;

  const v = n1[prop];
  const v2 = n2[prop];
  if (v === v2) return n2.id - n1.id;
  if (!v) return 1;
  if (!v2) return -1;
  if (typeof v === 'string' && typeof v2 === 'string') {
    return direction * v.toLocaleLowerCase().localeCompare(v2.toLocaleLowerCase());
  } else if (typeof v === 'number' && typeof v2 === 'number') {
    return direction * (v - v2);
  }
  return 0;
};

const SortCompare: Record<SortOptions, (n1: MapOption, n2: MapOption) => number> = {
  [SortOptions.AscendingAvgRating]: (n1: MapOption, n2: MapOption) => compareRating(n1, n2, 1),
  [SortOptions.DescendingAvgRating]: (n1: MapOption, n2: MapOption) => compareRating(n1, n2, -1),
  [SortOptions.AscendingUser]: (n1: MapOption, n2: MapOption) => compareProperty(n1, n2, 1, 'username'),
  [SortOptions.DescendingUser]: (n1: MapOption, n2: MapOption) => compareProperty(n1, n2, -1, 'username'),
  [SortOptions.Oldest]: (n1: MapOption, n2: MapOption) => compareProperty(n1, n2, 1, 'createdAt'),
  [SortOptions.Newest]: (n1: MapOption, n2: MapOption) => compareProperty(n1, n2, -1, 'createdAt'),
  [SortOptions.AscendingMapName]: (n1: MapOption, n2: MapOption) => compareProperty(n1, n2, 1, 'name'),
  [SortOptions.DescendingMapName]: (n1: MapOption, n2: MapOption) => compareProperty(n1, n2, -1, 'name'),
  [SortOptions.MapsYouRated]: (n1: MapOption, n2: MapOption) => compareProperty(n1, n2, -1, 'ratingMine'),
};

const MapSizes = {
  2: { width: 20, height: 36, safeZone: true },
  3: { width: 25, height: 25, safeZone: false },
  4: { width: 31, height: 41, safeZone: true },
};

@Component({
  selector: 'q-map-list',
  templateUrl: './map-list.component.html',
  styleUrls: ['./map-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapListComponent implements OnInit, OnDestroy {
  @ViewChild(CdkVirtualScrollViewport, { static: false }) mapViewport?: CdkVirtualScrollViewport;
  @Input() set visible(v: boolean) {
    if (!v) return;
    const i = this.filteredMapList.findIndex(m => m.id === this.selectedMap?.value);
    if (i !== -1) {
      setTimeout(() => {
        this.mapViewport?.scrollToIndex(i);
      });
    }
  }

  @Input() rankArea = 2;
  private servermapList: MapOption[] = [];
  private filteredMapList: MapOption[] = [];
  mapHeight = 36;
  mapWidth = 20;
  safeZone = true;
  maplist = new ReplaySubject<MapOption[]>(1);
  selectedFilters: string[] = [];
  sortList = [
    SortOptions.AscendingAvgRating, SortOptions.DescendingAvgRating,
    SortOptions.Newest, SortOptions.Oldest,
    SortOptions.AscendingUser, SortOptions.DescendingUser,
    SortOptions.AscendingMapName, SortOptions.DescendingMapName,
    SortOptions.MapsYouRated,
  ];

  selectedSortOption = this.sortList[1] || SortOptions.DescendingAvgRating;
  private tagList: string[] = [];
  private userList: string[] = [];
  private setting: typeof Settings['cadeMap'] | typeof Settings['flagMap'] = Settings.cadeMap;
  private subs = new Subscription();
  selectedMap = this.ss.prefetch(this.setting.group).map;
  searchCtrl = new FormControl();
  searchResults?: Observable<string[]>;

  constructor(
    private bottomSheet: MatBottomSheet,
     public ws: WsService,
     public ss: SettingsService,
     private cd: ChangeDetectorRef,
  ) { }

  async ngOnInit(): Promise<void> {
    if (this.rankArea === 4) this.setting = Settings.flagMap;
    const mapSize = MapSizes[this.rankArea as keyof typeof MapSizes] || MapSizes[2];
    this.mapHeight = mapSize.height;
    this.mapWidth = mapSize.width;
    this.safeZone = mapSize.safeZone;
    this.subs.add(this.ws.subscribe(Internal.Lobby, async l => {
      const settingValue = (await this.ss.get(this.setting.group, this.setting.name as ServerSettingGroup['l/cade']))?.value || 0;
      if (settingValue > 1 || !l.map || !this.servermapList[0]) return;
      const generatedMap = this.servermapList[0];
      generatedMap.data = this.b64ToArray(l.map);
      generatedMap.description = l.seed;
      this.cd.detectChanges();
    }));
    this.initGenerated();
    this.servermapList.push(...(await this.ws.request(OutCmd.CgMapList, this.rankArea) || []));
    this.filteredMapList = this.servermapList;
    this.sort(this.selectedSortOption);
    this.initFilters();
    this.maplist.next(this.filteredMapList);
    this.selectedMap = await this.ss.get(this.setting.group, this.setting.name as ServerSettingGroup['l/cade']);

    this.searchResults = this.searchCtrl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        map(value => this.searchMaps(value)),
      );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private searchMaps = (search: string): string[] => {
    const matches: string[] = [];
    for (const tag of this.tagList) {
      if (tag.toLowerCase().includes(search.toLowerCase())) matches.push(tag);
    }
    for (const star of starRatings) {
      if (star.toLowerCase().includes(search.toLowerCase())) matches.push(star);
    }
    for (const user of this.userList) {
      if (user.toLowerCase().includes(search.toLowerCase())) matches.push(user);
    }
    if (!search) return matches;

    matches.push(...this.filteredMapList.filter(map => {
      return map.name.toLowerCase().includes(search.toLowerCase());
    }).map(map => map.name));
    return matches;
  };

  initGenerated(): void {
    this.servermapList.push({
      id: 0,
      description: '',
      name: 'Generated',
      released: false,
      userId: 0,
      username: '',
      tags: [],
      ratingAverage: 0,
      ratingCount: 0,
      data: this.initMap(),
      createdAt: new Date().toISOString(),
    });
  }

  initFilters(): void {
    this.servermapList.forEach((map) => {
      if (map.username && !this.userList.includes(map.username)) this.userList.push(map.username);
      if (!map.tags) return;
      for (const tag of map.tags) {
        if (tag && !this.tagList.includes(tag)) this.tagList.push(tag);
      }
    });
  }

  openFilterWindow(): void {
    this.bottomSheet.open(MapFilterComponent, {
      data: {
        tagList: this.tagList,
        userList: this.userList,
        toggleTag: this.toggleTag.bind(this),
      },
    });
  }

  initMap(): number[][] {
    const map = [];
    for (let y = 0; y < this.mapHeight; y++) {
      const row = [];
      for (let x = 0; x < this.mapWidth; x++) {
        row.push(0);
      }
      map.push(row);
    }
    return map;
  }

  b64ToArray(map: string): number[][] {
    const data = this.initMap();
    const bString = window.atob(map);
    let i = 0;
    for (let y = 0; y < this.mapHeight; y++) {
      const row = data[y];
      if (!row) break;
      for (let x = 0; x < this.mapWidth; x++) {
        row[x] = bString.charCodeAt(i);
        i++;
      }
    }
    return data;
  }

  selectMap(id: number): void {
    const maps = this.filteredMapList.length < 1 ? this.servermapList : this.filteredMapList;
    const map = id < 0 ? maps[Math.floor(Math.random() * maps.length)] : maps.find(m => m.id === id);
    if (!map) return;

    void this.ss.save({
      id: this.setting.id,
      name: this.setting.name,
      title: this.setting.label || this.setting.name,
      value: map.id || 0,
      group: this.setting.group,
      data: map.username ? `${map.name} (${map.username})` : 'Generated',
    });
    this.selectedMap.setServerValue(map.id);
    if (id < 0) this.visible = true;
  }

  private filter(): void {
    if (!this.selectedFilters) this.maplist.next(this.servermapList);
    this.filteredMapList = this.servermapList.filter(map => {
      const tagMatched = this.selectedFilters.every(filter => {
        return filter === map.name || filter === map.username ||
         +filter <= map.ratingAverage || map.tags?.includes(filter);
      });
      return tagMatched;
    });
    this.maplist.next(this.filteredMapList);
  }

  toggleTag(tag: string): void {
    if (/\d\+/.test(tag)) {
      tag = tag[0] as string;
    }
    if (this.selectedFilters.indexOf(tag) !== -1) {
      this.selectedFilters = this.selectedFilters.filter(el => el !== tag);
    } else {
      if (this.selectedFilters.some(r => [1, 2, 3, 4].includes(+r))) return;
      this.selectedFilters.push(tag);
    }

    this.filter();
  }

  sort(value: SortOptions): void {
    this.filteredMapList.sort(SortCompare[value]);
    this.maplist.next(this.filteredMapList);
  }
}
