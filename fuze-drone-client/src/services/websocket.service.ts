import { Injectable, Inject } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/skipUntil';

import { ConfigService } from './config.service';

@Injectable()
export class WebsocketService {
  socket: Subject<WebSocket> = new ReplaySubject(1);
  readyStream: Observable<any>;
  stream: Observable<any>;
  emitter: Subject<Object> = new Subject();

  constructor(private configService: ConfigService){
    this.readyStream = this.socket
      .mergeMap(socket => Observable.fromEvent(socket, 'open'));

    /*let autoReconnect = this.socket
      .mergeMap(socket => Observable.fromEvent(socket, 'close'))
      .mergeMap(event => Observable.interval(5000))
      .takeUntil(this.readyStream)
      .subscribe(x => { this.connectWebsocket(); console.log(x); });
*/
    this.stream = this.socket
      .mergeMap(socket => Observable.fromEvent(socket, 'message'))  // When a ws message is received
      .map((message:any) => JSON.parse(message.data))               // Parse the JSON message

      //this.stream.subscribe(message => console.log(message));

    this.emitter
      .skipUntil(this.readyStream)     // Check if the websocket is open
      .withLatestFrom(this.socket, (message, socket) => ({message, socket}))
      .subscribe(({ message, socket }) => socket.send(message));

    this.connectWebsocket();

    this.socket.subscribe(socket => console.log(socket));
  }

  connectWebsocket(){
    console.log(this.configService);
    this.configService.config
      .subscribe((config:any) => this.socket.next(new WebSocket("ws://"+ config.ipAdress +":7777/")));
  }
}
