import { Component, Input, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { OutCmd } from 'src/app/ws-messages';
import { WsService } from 'src/app/ws.service';
import { SettingsService } from '../settings.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MapFilterComponent } from './map-filter/map-filter.component';

interface MapOption {
  id: number
  description: string,
  name: string,
  released: boolean
  userId: number
  username: string,
  tags: string[],
  ratingAverage?: number;
}

@Component({
  selector: 'q-map-list',
  templateUrl: './map-list.component.html',
  styleUrls: ['./map-list.component.scss']
})

export class MapListComponent implements OnInit {
  @Input() data: string = "";
  servermapList: MapOption[] = [];
  maplist = new ReplaySubject<MapOption[]>(1);

  selectedFilters: string[] = [];
  visible: boolean = true;
  selectable: boolean = true;
  removable: boolean = true;
  sortList: string[] = ["Ascending Avg. Rating","Descending Avg. Rating", "Ascending User", 
                        "Descending User", "Ascending Map Name", "Descending Map Name"];
  selectedSortOption: string = this.sortList[0];
  tagList: string[] = [];
  userList: string[] = [];
  setting = {
    admin: true, id: 18, group: 'l/cade', name: 'map', type: 'customMap', label: 'Custom Map', cmd: OutCmd.CgMapList
  }

  constructor(private bottomSheet: MatBottomSheet, public ws: WsService, public ss: SettingsService) { }

  openFilter() {
    this.bottomSheet.open(MapFilterComponent, {
      data: {
        tagList: this.tagList,
        userList: this.userList,
        addTag: this.addTag.bind(this),
      },
    });
  }

  async ngOnInit() {
    this.servermapList = await this.ws.request(OutCmd.CgMapList);
    // this.servermapList.unshift({
    //   id: 0,
    //   description: "",
    //   name: "Generated",
    //   released: false,
    //   userId: 0,
    //   username: "",
    // });
    this.servermapList.forEach((map)=> {
      if(map.tags){
        for (let tag of map.tags){
          const search = new RegExp(tag, 'i')
          if (!this.tagList.find(a =>search.test(a))) this.tagList.push(tag);
        }
      }
      const search = new RegExp(map.username, 'i')
      if (!this.userList.find(a =>search.test(a))) this.userList.push(map.username);
    });
    this.maplist.next(this.servermapList);
  }

  async selectMap(id: number) {
    const maps = this.servermapList;
    const rand = Math.floor(Math.random() * maps.length);
    this.ss.save({
      id: this.setting.id,
      name: this.setting.name,
      value: id < 0 ? maps[rand].id : id,
      group: this.setting.group,
      data: id < 0 ? maps[rand].name : "Generated",
    });
  }

  filter(data: string) {
    if (data === "" || data === undefined) this.maplist.next(this.servermapList);
    this.maplist.next(this.servermapList.filter(map => {
      const search = new RegExp(data, 'i');
      if (this.selectedFilters.length > 0){
        return map.tags.find(a =>search.test(a));
      }
      return search.test(map.name) || search.test(map.username) || map.tags.find(a =>search.test(a));;
    }));
  }

  removeTag(tag: string): void {
    const index = this.selectedFilters.indexOf(tag);

    if (index >= 0) {
      this.selectedFilters.splice(index, 1);
    }
    this.maplist.next(this.servermapList);
    this.filter(tag);
  }

  addTag(tag: string): void {
    const searchTags = new RegExp(tag, 'i');
    if (this.selectedFilters.find(a =>searchTags.test(a))) return;
    this.selectedFilters.push(tag);
    this.filter(tag);
  }

  sort(value: string){
    switch(value){
      case this.sortList[0]: this.maplist.next(this.servermapList.sort((n1,n2) => n1.ratingAverage! > n2.ratingAverage! ? 1 : -1)); break;
      case this.sortList[1]: this.maplist.next(this.servermapList.sort((n1,n2) => n1.ratingAverage! > n2.ratingAverage! ? -1 : 1)); break;
      case this.sortList[2]: this.maplist.next(this.servermapList.sort((n1,n2) => n1.username > n2.username ? 1 : -1)); break;
      case this.sortList[3]: this.maplist.next(this.servermapList.sort((n1,n2) => n1.username > n2.username ? -1 : 1)); break;
      case this.sortList[4]: this.maplist.next(this.servermapList.sort((n1,n2) => n1.name > n2.name ? 1 : -1)); break;
      case this.sortList[5]: this.maplist.next(this.servermapList.sort((n1,n2) => n1.name > n2.name ? -1 : 1)); break;
      default: this.maplist.next(this.servermapList);
    }
  }
  
}
