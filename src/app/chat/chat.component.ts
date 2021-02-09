import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from '../ws.service';
import { ChatService } from './chat.service';
import { InCmd, OutCmd } from '../ws-messages';

@Component({
  selector: 'q-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('inputEl', { static: true }) input?: ElementRef<HTMLElement>;
  @ViewChild('output', { static: true }) output?: ElementRef<HTMLElement>;
  @Input() disabled = false;
  colors = [
    '#873600', // info message
    '#873600', // HTML info message
    '#666', // lobby chat
    '#873600', // name with info message
    '#2874A6', // sent tell
    '#1A5276', // recieved tell
    '#873600', // command list
    '#873600', // last seen message
    ,
    'maroon', // alert/broadcast
  ];

  private subs = new Subscription();
  private focus = (e: KeyboardEvent) => {
    if (!this.ws.connected) return;
    if (document.activeElement?.className !== 'textinput' && (e.key === 'Tab' || e.code === 'Slash')) {
      this.input?.nativeElement.focus();
      if (e.code === 'Slash') this.chat.value += '/';
      e.preventDefault();
    } else if (e.key === 'Tab') {
      this.input?.nativeElement.blur();
      e.preventDefault();
    }
  }

  constructor(
    public socket: WsService,
    public chat: ChatService,
    private ws: WsService,
  ) { }

  ngOnInit() {
    if (!this.output) return;
    this.subs.add(this.socket.subscribe(InCmd.ChatMessage, () => this.addMessage()));
    const output = this.output.nativeElement;
    setTimeout(() => output.scrollTop = output.scrollHeight);

    // document.addEventListener('keydown', this.focus);
    this.input?.nativeElement.focus();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    // document.removeEventListener('keydown', this.focus);
  }

  handleKey(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      const history = this.chat.commandHistory;
      if (this.chat.historyIndex === 0 || history.length === 0) return;

      if (this.chat.historyIndex > 0) this.chat.historyIndex--;
      else {
        this.chat.historyIndex = history.length - 1;
        this.chat.saveText = this.chat.value;
      }
      this.chat.value = history[this.chat.historyIndex];

    } else if (e.key === 'ArrowDown') {
      if (this.chat.historyIndex === -1) return;
      const history = this.chat.commandHistory;
      if (this.chat.historyIndex === history.length - 1) {
        this.chat.historyIndex = -1;
        this.chat.value = this.chat.saveText;
        return;
      }

      this.chat.historyIndex++;
      this.chat.value = history[this.chat.historyIndex];
    } else if (e.key === 'Tab') {
      document.getElementById('textinput')?.focus();
    }
  }

  sendInput(e: Event) {
    e.preventDefault();
    const text = this.chat.value;
    if (!text) return;
    this.chat.value = '';
    this.chat.historyIndex = -1;

    if (text[0] !== '/') return this.socket.send(OutCmd.ChatMessage, text);
    this.socket.send(OutCmd.ChatCommand, text);

    const firstSpace = text.indexOf(' ');
    const secondSpace = text.indexOf(' ', firstSpace + 1);
    const command = secondSpace > 0 ? text.substr(0, secondSpace + 1) : text;
    this.chat.commandHistory = this.chat.commandHistory.filter(entry => entry !== command);
    this.chat.commandHistory.push(command);

  }

  addMessage(): void {
    if (!this.output) return;
    const output = this.output.nativeElement;
    if (output.scrollTop + 135 > output.scrollHeight) {
      setTimeout(() => output.scrollTop = output.scrollHeight);
    }
  }

  clickCommand(c: any) {
    if (c.params) {
      if (this.chat.value) this.chat.commandHistory.push(this.chat.value);
      this.chat.value = c.base + ' ';
      this.input?.nativeElement.focus();
      return;
    }

    this.socket.send(OutCmd.ChatCommand, c.base);
    this.chat.commandHistory = this.chat.commandHistory.filter(entry => entry !== c.base);
    this.chat.commandHistory.push(c.base);
  }
}
