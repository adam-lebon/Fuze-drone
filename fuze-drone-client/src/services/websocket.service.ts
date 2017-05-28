import { Injectable, Inject } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

import { ConfigService } from './config.service';

@Injectable()
//@Inject(ConfigService)
export class WebsocketService {
  socket: WebSocket;
  stream: Observable<any>;
  emitter: Subject<Object>;

  constructor(private configService: ConfigService){
    this.socket = new WebSocket("ws://"+ this.configService.config.ipAdress +":7777/");

    this.stream = Observable.fromEvent(this.socket, 'message')  // When a ws message is received
      .map((message:any) => JSON.parse(message.data))                 // Parse the JSON message

    this.emitter = new Subject();
    this.emitter
      .skipUntil(Observable.fromEvent(this.socket, 'open'))     // Check if the websocket is open
      .subscribe(message => this.socket.send(message));
  }
}
