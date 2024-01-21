import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import { InCmd, OutCmd } from '../ws-messages';

import { WsService } from '../ws.service';
import { KeyBindingService } from '../settings/key-binding/key-binding.service';
import { KeyActions } from '../settings/key-binding/key-actions';
import { Sounds, SoundService } from '../sound.service';

dayjs.extend(relativeTime);

export const TeamImages = {
  0: { title: 'Defenders', src: 'assets/images/icon_defend1.png' },
  1: { title: 'Attackers', src: 'assets/images/icon_attack1.png' },
  2: { title: '2nd Attackers', src: 'assets/images/icon_attack2.png' },
  3: { title: '3rd Attackers', src: 'assets/images/icon_attack3.png' },
  99: { title: 'Watchers', src: 'assets/images/watch.png' },
};

export interface Message {
  type: number;
  message?: any;
  team?: keyof typeof TeamImages;
  op?: boolean;
  from: string;
  copy?: number;
  sId?: number;
  friend?: boolean;
  blocked?: boolean;
  time?: number | string;
  ago?: string;
  admin: number;
}

export interface Command {
    base: string, title: string, params: { name: string, value: string }[], help: string
  }

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  commandsComponent: any;
  commandHistory: string[] = [];
  messages: Message[] = [];
  messages$ = new ReplaySubject<Message[]>(1);
  saveText = '';
  historyIndex = -1;
  commands: Command[] = [];
  nameCommands: Command[] = [];
  selectedCommand: Command = { params: [] } as any;

  constructor(
    private ws: WsService,
    private kbs: KeyBindingService,
    sound: SoundService,
  ) {
    this.messages$.next(this.messages);
    this.ws.subscribe(InCmd.ChatCommands, commands => {
      this.commands = commands.lobby;
      this.commands.push(...commands.global);
      if (commands.lobbyAdmin) this.commands.push(...commands.lobbyAdmin);

      let cmdFound = false;
      for (const cmd of this.commands) {
        if (cmd.base === this.selectedCommand.base) {
          Object.assign(cmd, this.selectedCommand);
          this.selectedCommand = cmd;
          cmdFound = true;
          continue;
        }
        cmd.title = cmd.base.substring(1);
        const params = cmd.params as any as string;
        cmd.params = params.replace(/[[\]<>]/g, '').split(' ').map(p => {
          return { name: p, value: p === 'new' ? p : '' };
        });
      }
      if (!cmdFound) this.selectedCommand = this.commands[0] ?? this.selectedCommand;
      this.nameCommands = this.commands.filter(cmd => cmd.params[0]?.name === 'name');
    });

    this.ws.subscribe(InCmd.ChatMessage, (message: Message) => {
      // if (message.type === 6) return;
      if ((document.hidden && message.type === 5) || [8, 9].includes(message.type)) {
        void sound.play(Sounds.Notification);
      }
      this.messages.push(message);
      if (message.type === 5) {
        let command = '/tell ' + message.from;
        if (message.from === 'Guest') command += `(${message.copy})`;
        command += ' ';

        this.commandHistory = this.commandHistory.filter(entry => entry !== command);
        this.commandHistory.push(command);
      } else if (message.type === 7 && message.time) {
        const time = dayjs.unix(+message.time);
        message.time = time.format('D MMM YYYY HH:mm');
        message.ago = time.fromNow();
      }
      this.messages$.next(this.messages);
    });
    this.ws.connected$.subscribe(value => {
      if (!value) this.messages = [];
    });

    this.ws.subscribe(InCmd.FriendAdd, (u: string) => {
      for (const m of this.messages) if (m.from === u) m.friend = true;
    });
    this.ws.subscribe(InCmd.FriendRemove, (u: string) => {
      for (const m of this.messages) if (m.from === u) m.friend = false;
    });

    this.ws.subscribe(InCmd.BlockUser, (u: string) => {
      for (const m of this.messages) if (m.from === u) m.blocked = true;
    });
    this.ws.subscribe(InCmd.UnblockUser, (u: string) => {
      for (const m of this.messages) if (m.from === u) m.blocked = false;
    });
  }

  sendMessage(text: string): void {
    this.ws.send(OutCmd.ChatMessage, text);
  }

  sendCommand(text: string): void {
    this.ws.send(OutCmd.ChatCommand, text);
  }

  setTell(name: string): void {
    const param = this.selectedCommand.params.find(p => p.name === 'message');
    if (param?.value) this.commandHistory.push(param.value);
    this.selectedCommand = this.commands.find(cmd => cmd.base === '/tell') || this.selectedCommand;
    const newParam = this.selectedCommand.params[0];
    if (newParam) newParam.value = name;
    this.kbs.emitAction(KeyActions.FocusChat);
  }

  sendTell(friend: string): void {
    this.setTell(friend);
    this.kbs.emitAction(KeyActions.FocusChat);
  }
}
