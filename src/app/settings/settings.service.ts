import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { InCmd, OutCmd } from '../ws-messages';

import { WsService } from '../ws.service';
import { Settings } from './setting/settings';

export interface Setting {
  id: number;
  name: string;
  title: string;
  group: string;
  value: number;
  data?: any;
}

export interface SettingPartial {
  value: number;
  data?: any;
  stream?: BehaviorSubject<number>;
}

export interface SettingMap {
  [key: string]: SettingPartial | undefined;
}

type SettingList = (keyof typeof Settings)[];

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private settings = new Map<string, SettingMap>();
  private ready = new Map<string, Subject<SettingMap>>();

  tabIndex = 1;
  admin = true;
  lAdminSettings: SettingList = [];
  showMapChoice = false;

  constructor(private ws: WsService) {
    ws.subscribe(InCmd.SettingSet, (s: Setting) => {
      const group = this.settings.get(s.group);
      const setting = group?.[s.name];
      if (setting) {
        setting.value = s.value;
        setting.stream?.next?.(s.value);
      }
    });
  }

  setFakeSettings(group: string, settings: SettingMap): void {
    this.settings.set(group, settings);
  }

  setLobbySettings(adminNames: SettingList, showMapChoice = false): void {
    this.lAdminSettings = adminNames;
    this.showMapChoice = showMapChoice;
  }

  getGroup(group: string, update = false): Promise<SettingMap> {
    if (!update) {
      const settings = this.settings.get(group);
      if (settings) return Promise.resolve(settings);
    }

    let ready = this.ready.get(group);
    if (!ready) {
      ready = new Subject<SettingMap>();
      this.ready.set(group, ready);

      void this.ws.request(OutCmd.SettingGetGroup, group).then((m: Setting[]) => {
        let localSettings = this.settings.get(group);
        if (!localSettings) {
          localSettings = {};
          this.settings.set(group, localSettings);
        }

        for (const setting of m) {
          const oldSetting = localSettings[setting.name];
          if (oldSetting) {
            Object.assign(oldSetting, setting);
            oldSetting.stream?.next?.(setting.value);
          } else localSettings[setting.name] = { ...setting, stream: new BehaviorSubject(setting.value) };
        }
        ready?.next?.(localSettings);
        this.ready.delete(group);
      });
    }
    return new Promise<SettingMap>(resolve => {
      ready?.subscribe(v => resolve(v));
    });
  }

  async get(group: string, name: string): Promise<SettingPartial | undefined> {
    const settings = await this.getGroup(group);
    return Promise.resolve(settings[name]);
  }

  async save(setting: Setting): Promise<void> {
    this.ws.send(OutCmd.SettingSet, setting);
    const oldSetting = await this.get(setting.group, setting.name);
    if (oldSetting) {
      Object.assign(oldSetting, setting);
      oldSetting.stream?.next?.(setting.value);
    }
  }
}
