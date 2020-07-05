import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from 'src/app/ws.service';
import { MapEditor, DBTile } from '../map-editor.component';

@Component({
  selector: 'q-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  @Input() map: MapEditor = {
    selected: 50,
    selectedTile: {
      undos: [],
      redos: [],
      id: null,
      name: '',
      group: 'tile_sets',
      data: [],
    },
    settingsOpen: true,
  };
  groups = {
    maps: 'Map',
    tile_sets: 'Tile Set',
    structure_sets: 'Structure Set',
    cgmaps: 'Map'
  };
  types = [
    'Head',
    'Middle Egg', 'Right Egg',
    'Left Pod', 'Middle Pod', 'Right Pod',
    'Left Locker', 'Right Locker',
    'Left Cuttle', 'Right Cuttle',
    'Middle Obstacle', 'Right Obstacle'
  ];
  selected: string | number = 'new';
  options: DBTile[] = [];
  private sub: Subscription;
  private mapData: { [key: string]: DBTile[] } = {};

  error = '';
  success = '';
  pending = false;
  shown: DBTile;

  constructor(private socket: WsService) { }

  ngOnInit() {
    this.handleSubs();
    this.shown = this.map.selectedTile;
    if (!this.map.tileSettings) {
      this.shown = this.map.tileSet || this.map.structureSet || this.shown;
      this.socket.send('getMaps');
      this.map.hex = this.shown.hex;
    }
    this.shown = { ...this.shown };
    this.selected = typeof this.shown.id === 'number' ? this.shown.id : 'new';

    let unsaved = this.shown.unsaved;
    if (!this.map.tileSettings) switch (this.shown.group) {
      case 'tile_sets':
        if (this.map.tiles) tiles: for (const group of this.map.tiles) {
          if (group) for (const tile of group) {
            if (tile.unsaved) {
              unsaved = true;
              break tiles;
            }
          }
        }
        break;
      case 'structure_sets':
        if (this.map.structures) for (const structure of this.map.structures) {
          if (structure.unsaved) {
            unsaved = true;
            break;
          }
        }
        break;
      default:
    }
    if (unsaved) this.error = 'Unsaved changes! They will be discarded if you select a different map without saving.';
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  private handleSubs() {
    this.sub = this.socket.subscribe('getTileSet', ts => this.handleTileSet(ts));
    this.sub.add(this.socket.subscribe('getStructureSet', ss => this.handleStructureSet(ss)));
    this.sub.add(this.socket.subscribe('createMap', m => this.handleMap(m)));
    this.sub.add(this.socket.subscribe('saveMap', m => this.handleMap(m)));
    this.sub.add(this.socket.subscribe('getMap', m => this.gotMap(m)));
    this.sub.add(this.socket.subscribe('mapList', l => this.gotList(l)));
  }

  private gotList(list: any) {
    this.mapData = list;
    const tile = this.shown;
    this.options = list[tile.group];
  }

  private handleTileSet(tileSet: any) {
    delete this.map.structures;
    delete this.map.structureSet;
    const tiles = [];
    this.map.tiles = tiles;
    this.map.tileSet = this.shown;
    this.map.tileSet.data = [[]];

    for (const t of tileSet) {
      if (!t.type) t.type = 0;
      if (!tiles[t.type]) tiles[t.type] = [t];
      else tiles[t.type].push(t);
    }
    this.map.selectedTile = tileSet[0] || {
      id: null, name: '', undos: [], redos: [],
    };
    const tile = this.map.selectedTile;
    tile.undos = tile.undos || [];
    tile.redos = tile.redos || [];
    this.map.settingsOpen = false;
  }

  private handleStructureSet(structureSet: DBTile[]) {
    delete this.map.tiles;
    delete this.map.tileSet;
    this.map.structures = structureSet;
    this.map.structureSet = this.shown;
    this.map.structureSet.data = [[]];
    this.map.selectedTile = structureSet[0] || {
      id: null, name: '', undos: [], redos: [],
    };
    const tile = this.map.selectedTile;
    tile.undos = tile.undos || [];
    tile.redos = tile.redos || [];
    this.map.settingsOpen = false;
  }

  // Fetched data
  private gotMap(map: any) {
    delete this.map.tiles;
    delete this.map.tileSet;
    delete this.map.structures;
    delete this.map.structureSet;
    const tile = this.shown;
    tile.data = map.data || tile.data;
    tile.undos = map.undos || [];
    tile.redos = map.redos || [];
    this.map.selectedTile = tile;
    this.map.hex = tile.hex;
    this.map.settingsOpen = false;
  }

  // Create or save
  private handleMap(msg: any) {
    this.pending = false;
    this.error = msg && msg.error;
    if (this.error) return;
    this.map.tileSettings = false;

    const tile = this.shown;
    tile.unsaved = false;
    if (msg) Object.assign(tile, msg);
    switch (tile.group) {
      case 'tiles':
        const groups = this.map.tiles;
        const type = (tile.type) || 0;
        const tiles = groups[type] || [];
        groups[type] = tiles;

        const oldTile = tiles.find(el => el.id === tile.id);
        if (oldTile) Object.assign(oldTile, tile);
        else tiles.push(tile);
        this.map.selectedTile = oldTile || tile;
        this.map.tileSet.activeGroup = this.map.selectedTile.type;
        this.map.settingsOpen = false;
        return;
      case 'structures':
        const structures = this.map.structures || [];
        this.map.structures = structures;

        const oldStructure = structures.find(el => el.id === tile.id);
        if (oldStructure) Object.assign(oldStructure, tile);
        else this.map.structures.push(tile as any);
        this.map.selectedTile = oldStructure || tile;
        this.map.settingsOpen = false;
        return;
      case 'tile_sets':
        this.map.tileSet = tile;
        break;
      case 'structure_sets':
        this.map.structureSet = tile;
        break;
      default:
    }

    if (msg) {
      this.mapData[msg.group].push(msg);
      tile.id = msg.id;
      this.selected = tile.id;
      this.success = this.groups[tile.group] + ' Created!';
      return;
    }

    const selected = this.options.find(option => option.id === +this.selected);
    if (selected) Object.assign(selected, tile);
  }

  select() {
    this.error = '';
    this.success = '';
    delete this.map.tiles;
    delete this.map.structures;
    const tile = this.shown;
    tile.unsaved = false;
    tile.hex = false;

    const selected = this.options.find(option => option.id === +this.selected) || {
      id: null, name: '', undos: [], redos: [],
    };
    Object.assign(tile, selected);
    this.map.hex = tile.hex;
  }

  updateOptions() {
    this.options = this.mapData[this.shown.group];
    this.selected = 'new';
    this.select();
  }

  private buildMap(type: string): number[][] {
    const types = {
      cgmaps: { x: 20, y: 36 },
      maps: { x: 25, y: 52 },
      tiles: { x: 8, y: 8 }
    };

    const size = types[type];
    if (!size) return [];
    const map = [];

    for (let y = 0; y < size.y; y++) {
      const row = [];
      for (let x = 0; x < size.x; x++) row.push(0);
      map.push(row);
    }

    return map;
  }

  save(tile = this.shown) {
    this.success = '';
    this.error = tile.name ? '' : 'Name is required.';
    if (this.error) return;

    if (this.selected === 'new') {
      tile.data = this.buildMap(tile.group);
      tile.weight = 1;
    }

    if (tile.unsaved) {
      this.pending = true;
      const cmd = this.selected === 'new' ? 'createMap' : 'saveMap';
      this.socket.send(cmd, tile);
    }

    switch (tile.group) {
      case 'tile_sets':
        if (this.map.tiles) for (const group of this.map.tiles) {
          if (group) for (const t of group) {
            t.group = 'tiles';
            if (t.unsaved) this.save(t);
            t.unsaved = false;
          }
        }
        break;
      case 'structure_sets':
        if (this.map.structures) for (const structure of this.map.structures) {
          structure.group = 'structures';
          if (structure.unsaved) this.save(structure);
          structure.unsaved = false;
        }
        break;
      default:
    }
  }

  edit() {
    if (this.map.tileSettings) {
      this.map.tileSettings = false;
      this.map.settingsOpen = false;
      return;
    }

    this.pending = true;
    this.map.hex = false;
    const tile = this.shown;
    switch (tile.group) {
      case 'tile_sets':
        this.map.hex = tile.hex;
        if (!this.map.tiles || this.map.tileSet.id !== tile.id) this.socket.send('getTileSet', tile.id);
        else this.map.settingsOpen = false;
        return;
      case 'structure_sets':
        if (!this.map.structures || this.map.structureSet.id !== tile.id) this.socket.send('getStructureSet', tile.id);
        else this.map.settingsOpen = false;
        return;
      default:
        this.map.hex = tile.hex;
        this.socket.send('getMap', { group: tile.group, tile: tile.id });
    }
  }

}
