import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription, BehaviorSubject, Subject } from 'rxjs';

import { FriendsService } from '../../../chat/friends/friends.service';
import { InCmd, Internal, OutCmd } from '../../../ws-messages';
import { KeyBindingService } from '../../../settings/key-binding/key-binding.service';
import { SettingsService, SettingMap } from '../../../settings/settings.service';
import { EscMenuService } from '../../../esc-menu/esc-menu.service';
import { Lobby } from '../../lobby.component';
import { Turn } from '../boats/boats.component';
import { Boat } from '../boats/boat';
import { WsService } from '../../../ws.service';
import { Tokens } from '../../../boats/move-input/move-input.component';
import { KeyActions } from '../../../settings/key-binding/key-actions';

export const weapons = [
  '', '', 'powderkeg', '', '', '', '', '', '', '',
  '', '', '', 'spin',
];

export interface BoatTick {
  t: [number[], number[], number[]];
  d: number;
  b: number;
  tp: number;
  attr: Record<number, number>;
}

@Component({
  selector: 'q-hud',
  templateUrl: './hud.component.html',
  styleUrls: ['./hud.component.scss'],
})
export class HudComponent implements OnInit, OnDestroy {
  @Input() kbControls = 1;
  @Input() moveKeys: Record<number, KeyActions> = {
    0: KeyActions.QBlank,
    1: KeyActions.QLeft,
    2: KeyActions.QForward,
    3: KeyActions.QRight,
    4: KeyActions.QToken,
  } as const;

  @Input() actions = {
    bombLeft: KeyActions.QBombLeft,
    bombRight: KeyActions.QBombRight,
    BombLeftStrict: KeyActions.QBombLeftStrict,
    BombRightStrict: KeyActions.QBombRightStrict,
    tokenLeft: KeyActions.Noop,
    tokenRight: KeyActions.Noop,
    prevSlot: KeyActions.QPrevSlot,
    nextSlot: KeyActions.QNextSlot,
    ready: KeyActions.QReady,
    back: KeyActions.QBack,
  };

  tokens = [
    '', '', '', '', '', '', '', '', '', '',
    'duckpoo', 'duckpoo', 'duckpoo', 'duckpoo',
  ];

  localBoat = {
    moves: [0, 0, 0, 0],
    shots: [0, 0, 0, 0, 0, 0, 0, 0],
  };

  serverBoat = {
    moves: [0, 0, 0, 0],
    shots: [0, 0, 0, 0, 0, 0, 0, 0],
  };

  protected serverBoatPending = {
    moves: [0, 0, 0, 0],
    shots: [0, 0, 0, 0, 0, 0, 0, 0],
  };

  totalTokens: Tokens = {
    moves: [5, 5, 5],
    shots: 0,
    maneuvers: [0, 0, 0, 0],
  };

  unusedTokens: Tokens = {
    moves: [0, 0, 0],
    shots: 0,
    maneuvers: [0, 0, 0, 0],
  };

  weapons = weapons;
  myBoat = new Boat('');

  turn = 0;
  lastMoveReset = 0;
  dragContext = { source: 8, move: 0 };
  resetMoves$ = new Subject<void>();
  protected subs = new Subscription();
  protected group = 'l/quacken';
  protected lobbySettings: SettingMap = { turns: { value: 90 }, turnTime: { value: 30 } };
  protected get maxTurn(): number { return this.lobbySettings.turns?.value || 90; }
  get secondsPerTurn(): number { return this.lobbySettings.turnTime?.value || 30; }

  private timeInterval?: number;
  private minutes = 0;
  private seconds = 0;
  protected turnSeconds = 0;
  public blockedPosition = 3;
  seconds$ = new BehaviorSubject<number>(76);

  constructor(
    protected ws: WsService,
    public fs: FriendsService,
    protected kbs: KeyBindingService,
    protected ss: SettingsService,
    public es: EscMenuService,
  ) { }

  ngOnInit(): void {
    void this.ss.getGroup(this.group).then(settings => this.lobbySettings = settings);
    this.handleKeys();
    this.subs.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => {
      this.myBoat = b;
      this.resetMoves();
    }));
    this.subs.add(this.ws.subscribe(Internal.ResetMoves, this.resetMoves.bind(this)));
    this.subs.add(this.ws.subscribe(InCmd.BoatTick, (t: BoatTick) => {
      this.myBoat.damage = t.d;
      this.totalTokens.shots = t.tp >= 2 ? 1 : 0;
    }));

    this.subs.add(this.ws.subscribe(Internal.Lobby, (m: Lobby) => {
      if (m.map === undefined) return;
      this.lastMoveReset = 0;
      this.turn = m.turn ?? this.turn;
      this.myBoat.ready = false;
      this.resetMoves();

      if (m.seconds) {
        if (m.seconds > 20) m.seconds = 20;
        m.seconds = Math.round(m.seconds * this.secondsPerTurn / 30);
      }
      if (!this.timeInterval && this.turn > 0 && this.turn <= this.maxTurn) this.startTimer();
      else this.stopTimer();
      this.setTurn(this.maxTurn - this.turn, this.secondsPerTurn - (m.seconds || -1) - 2);
    }));

    this.subs.add(this.ws.subscribe(InCmd.Turn, (turn: Turn) => {
      const turnNumber = turn.turn + 1;
      this.stopTimer();
      if (turnNumber <= this.maxTurn) {
        this.turn = turnNumber;
        this.startTimer();
        this.setTurn(this.maxTurn - turnNumber);
      } else {
        this.turn = 0;
        this.lastMoveReset = 0;
      }
      if (turnNumber !== 1) this.myBoat.moveLock = Math.max(this.turn + 1, this.myBoat.moveLock);
      if (this.myBoat.bomb) this.myBoat.tokenPoints = 0;
    }));
    this.subs.add(this.ws.subscribe(InCmd.Sync, s => {
      this.myBoat.ready = false;
      this.turn = s.turn ?? this.turn;
      this.resetMoves();
      setTimeout(() => {
        if (this.turn === 0) return;
        if (this.myBoat.moveLock > this.turn) {
          this.ws.dispatchMessage({
            cmd: InCmd.ChatMessage,
            data: { type: 1, message: 'Unlocking moves in ' + (this.myBoat.moveLock - this.turn - 1) + ' turns.' },
          });
        } else if (this.myBoat.moveLock === this.turn) {
          this.ws.dispatchMessage({
            cmd: InCmd.ChatMessage,
            data: { type: 1, message: 'Unlocking moves next turn.' },
          });
        }
      }, 100);
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.stopTimer();
  }

  protected resetMoves(): void {
    if (!this.ws.connected || this.myBoat.moveLock > this.turn + 1 || !this.myBoat.isMe) return;
    if (this.turn <= this.lastMoveReset) return;
    if (this.myBoat.moveLock === this.turn + 1) this.myBoat.moveLock = 0;
    this.lastMoveReset = this.turn;
    for (const i in this.serverBoat.moves) this.serverBoat.moves[i] = 0;
    for (const i in this.serverBoat.shots) this.serverBoat.shots[i] = 0;
    for (const i in this.serverBoatPending.moves) this.serverBoatPending.moves[i] = 0;
    for (const i in this.serverBoatPending.shots) this.serverBoatPending.shots[i] = 0;
    this.resetMoves$.next();
  }

  private handleKeys() {
    if (this.actions.ready) {
      this.subs.add(this.kbs.subscribe(this.actions.ready, v => {
        if (v && this.kbControls) this.imReady();
      }));
    }
  }

  imReady(): void {
    if (this.myBoat.ready) return;
    this.stopTimer();
    this.myBoat.ready = true;
    this.myBoat.moveLock = this.turn + 1;
    this.ws.send(OutCmd.Ready);
  }

  start(): void {
    this.ws.send(OutCmd.ChatCommand, '/start');
  }

  protected arrayEqual(a: number[], b: number[]): boolean {
    for (const i in a) if (a[i] !== b[i]) return false;
    return true;
  }

  async sendMoves(): Promise<void> {
    void this.sendShots();
    if (this.arrayEqual(this.serverBoatPending.moves, this.localBoat.moves)) return;
    this.serverBoatPending.moves = [...this.localBoat.moves];
    this.serverBoat.moves = await this.ws.request(OutCmd.Moves, this.localBoat.moves);
  }

  protected async sendShots(): Promise<void> {
    if (this.arrayEqual(this.serverBoatPending.shots, this.localBoat.shots)) return;
    this.serverBoatPending.shots = [...this.localBoat.shots];
    for (let i = 0; i < this.localBoat.shots.length; i++) {
      if (this.localBoat.shots[i]) {
        await this.ws.request(OutCmd.Bomb, [1, 5, 2, 6, 3, 7, 4, 8][i]);
        this.serverBoat.shots = [0, 0, 0, 0, 0, 0, 0, 0];
        this.serverBoat.shots[i] = 1;
        return;
      }
    }
    await this.ws.request(OutCmd.Bomb, 0);
    this.serverBoat.shots = [0, 0, 0, 0, 0, 0, 0, 0];
  }

  drag(move: number, slot = 8): void {
    this.dragContext.move = move;
    this.dragContext.source = slot;
  }

  setTurn(turn: number, sec: number = this.secondsPerTurn - 1): void {
    if (turn === this.maxTurn) sec = 0;
    else if (turn < 0) {
      this.endRound();
      return;
    }

    if (this.secondsPerTurn === 40) {
      this.seconds = turn === this.maxTurn ? turn : turn + 1;
      this.minutes = 0;
      this.turnSeconds = this.secondsPerTurn;
    } else {
      const remaining = this.secondsPerTurn * turn + sec;
      this.minutes = Math.floor(remaining / 60);
      this.seconds = remaining % 60;
      this.turnSeconds = sec;
    }
    this.updatetime();
  }

  private endRound(): void {
    this.ws.dispatchMessage({ cmd: Internal.Time, data: '0:00' });
    this.seconds$.next(0);
    this.stopTimer();
  }

  startTimer(ms = 1000): void {
    clearInterval(this.timeInterval);
    this.timeInterval = window.setInterval(() => this.tickTimer(), ms);
  }

  stopTimer(): void {
    clearInterval(this.timeInterval);
    delete this.timeInterval;
  }

  private tickTimer() {
    if (this.turn === 0) return this.stopTimer();
    // unlimited time
    if (this.secondsPerTurn === 40) return;
    if (this.turnSeconds < 1 || this.minutes + this.seconds === 0) {
      this.myBoat.ready = false;
      this.imReady();
      return;
    }

    this.seconds--;
    if (this.seconds < 0) {
      this.seconds += 60;
      this.minutes--;
    }
    if (this.turnSeconds > this.secondsPerTurn) this.setTurn(this.maxTurn - this.turn);
    this.turnSeconds--;
    this.updatetime();
  }

  protected updatetime(): void {
    this.seconds$.next(Math.round(this.turnSeconds * 76 / this.secondsPerTurn) - 4);
    const seconds = this.seconds < 10 ? '0' + this.seconds : this.seconds;
    this.ws.dispatchMessage({ cmd: Internal.Time, data: this.minutes + ':' + seconds });
  }
}
