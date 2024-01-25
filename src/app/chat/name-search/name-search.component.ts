import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, debounceTime, mergeMap } from 'rxjs/operators';
import { OutCmd } from '../../ws-messages';
import { WsService } from '../../ws.service';
import { FriendsService } from '../friends/friends.service';

@Component({
  selector: 'q-name-search',
  templateUrl: './name-search.component.html',
  styleUrls: ['./name-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NameSearchComponent implements OnInit {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  @Input() onlineOnly = false;
  searchedNames?: Observable<string[]>;
  myControl = new UntypedFormControl();

  constructor(
    private ws: WsService,
    private fs: FriendsService,
  ) { }

  ngOnInit(): void {
    this.searchedNames = this.myControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        mergeMap(value => this.searchName(value)),
      );
  }

  private searchName(search: string): Promise<string[]> {
    if (search.length < 2) {
      const nameTemp = [...this.fs.lobby$.getValue().map(m => m.from), ...this.fs.friends];
      if (!this.onlineOnly) nameTemp.push(...this.fs.offline);
      const names = new Map(nameTemp.map(n => [n, undefined]));

      return Promise.resolve(Array.from(names.keys()));
    }
    return this.ws.request(this.onlineOnly ? OutCmd.SearchNamesOnline : OutCmd.SearchNames, search);
  }
}
