import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KeyActions } from '../../settings/key-binding/key-actions';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { OutCmd } from '../../ws-messages';
import { WsService } from '../../ws.service';
import { ChatService } from '../chat.service';

@Component({
  selector: 'q-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit, OnDestroy {
  @Input() disabled = false;
  private subs = new Subscription();

  constructor(
    private ws: WsService,
    public chat: ChatService,
    private kbs: KeyBindingService,
  ) { }

  ngOnInit(): void {
    this.subs.add(this.kbs.subscribe(KeyActions.FocusChat, v => {
      if (!v && !this.disabled) this.focusChat();
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  handleKey(e: KeyboardEvent): void {
    const param = this.chat.selectedCommand.params.find(p => p.name === 'message');
    if (e.key === 'Enter') {
      this.sendInput(e);
    } else if (e.key === 'ArrowUp') {
      const history = this.chat.commandHistory;
      if (this.chat.historyIndex === 0 || history.length === 0 || !param) return;

      if (this.chat.historyIndex > 0) this.chat.historyIndex--;
      else {
        this.chat.historyIndex = history.length - 1;
        this.chat.saveText = param.value;
      }
      param.value = history[this.chat.historyIndex] ?? param.value;
    } else if (e.key === 'ArrowDown') {
      if (this.chat.historyIndex === -1 || !param) return;
      const history = this.chat.commandHistory;
      if (this.chat.historyIndex === history.length - 1) {
        this.chat.historyIndex = -1;
        param.value = this.chat.saveText;
        return;
      }

      this.chat.historyIndex++;
      param.value = history[this.chat.historyIndex] ?? param.value;
    } else if (e.key === 'Escape') {
      this.blurChat();
    }
  }

  focusChat(): void {
    setTimeout(() => document.getElementById('message')?.focus());
  }

  blurChat(): void {
    setTimeout(() => document.getElementById('message')?.blur());
  }

  sendInput(e: Event): void {
    e.preventDefault();
    let text = this.chat.selectedCommand.base;
    for (const param of this.chat.selectedCommand.params) {
      if (!param.name) continue;
      const value = param.value;
      if (param.name === 'message') {
        if (!value) return this.blurChat();
        param.value = '';
      }
      if (value[0] === '/') {
        text = value;
        break;
      }
      text += ' ' + value;
    }
    this.chat.historyIndex = -1;

    if (text[0] !== '/') return this.ws.send(OutCmd.ChatMessage, text);
    this.ws.send(OutCmd.ChatCommand, text);

    const firstSpace = text.indexOf(' ');
    const secondSpace = text.indexOf(' ', firstSpace + 1);
    const cmdSplit = text.substr(0, firstSpace) === '/tell' ? secondSpace : firstSpace;
    const command = cmdSplit > 0 ? text.substr(0, cmdSplit + 1) : text;
    this.chat.commandHistory = this.chat.commandHistory.filter(entry => entry !== command);
    this.chat.commandHistory.push(command);
  }
}
