import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { WsService } from '../../ws.service';
import { AdvancedComponent } from '../advanced/advanced.component';
import { SettingsService, SettingMap } from '../settings.service';

import { Settings } from './settings';

export const links: Record<number, string> = {
  14: 'smsloop/smsloop',
  15: 'lgsloop/lgsloop',
  16: 'dhow/dhow',
  17: 'fanchuan/fanchuan',
  18: 'longship/longship',
  19: 'baghlah/baghlah',
  20: 'merchbrig/merchbrig',
  21: 'junk/junk',
  22: 'warbrig/warbrig',
  23: 'merchgal/merchgal',
  24: 'xebec/xebec',
  25: 'wargal/wargal',
  26: 'warfrig/warfrig',
  27: 'grandfrig/grandfrig',
  28: 'blackship/blackship',
};

export function getShipLink(id: number): string {
  return `/assets/boats/${links[id] || 'boat' + id}.png`;
}

@Component({
  selector: 'q-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
})

export class SettingComponent {
  @Input() set name(value: keyof typeof Settings) {
    this.setting = Settings[value] || {};
    this.setting.name = this.setting.name || value;
    void this.fetch();
  }

  @Output() valueChange = new EventEmitter<number>();

  setting: any = {};
  group: SettingMap = {};
  getShipLink = getShipLink;
  private debounce?: number;

  constructor(public ss: SettingsService, private ws: WsService, private dialog: MatDialog) { }

  private async fetch() {
    this.group[this.setting.name] = { value: 0 };
    if (this.setting.group) this.group = await this.ss.getGroup(this.setting.group);
  }

  openAdvanced(): void {
    this.dialog.open(AdvancedComponent, {
      data: {
        component: this.setting.advancedComponent,
        setting: this.group[this.setting.name],
        save: this.save.bind(this),
      },
    }).afterClosed().subscribe(this.save.bind(this));
  }

  send(): void {
    this.ws.send(this.setting.trigger, this.setting.data);
  }

  save(): void {
    const newSetting = this.group[this.setting.name];
    if (typeof this.setting.max === 'number') {
      if (newSetting.value > this.setting.max) newSetting.value = this.setting.max;
      else if (newSetting.value < this.setting.min) newSetting.value = this.setting.min;
    }

    clearTimeout(this.debounce);
    this.debounce = window.setTimeout(() => {
      this.valueChange.emit(+newSetting.value);
      void this.ss.save({
        id: this.setting.id,
        name: this.setting.name,
        value: +newSetting.value,
        group: this.setting.group,
        data: this.setting.stepLabels ? this.setting.stepLabels?.[newSetting.value] : newSetting.data,
      });
      if (this.setting.trigger) {
        this.ws.send(this.setting.trigger, +newSetting.value);
      }
    }, 750);
  }
}
