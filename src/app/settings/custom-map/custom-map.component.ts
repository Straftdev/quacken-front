import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { SettingMap } from '../settings.service';
import { WsService } from 'src/app/ws.service';

@Component({
  selector: 'q-custom-map',
  templateUrl: './custom-map.component.html',
  styleUrls: ['./custom-map.component.scss']
})
export class CustomMapComponent implements OnInit {
  @Input() group?: SettingMap;
  @Input() setting: any = {};
  @Input() disabled?: boolean;
  @Output() save = new EventEmitter();

  data = [];
  loading = true;

  constructor(private ws: WsService) { }

  async ngOnInit() {
    const m = await this.ws.request(this.setting.cmd);
    for (const i of m) i.label = i.name + ' (' + i.username + ')';
    this.data = m;
    this.loading = false;
  }

}
