import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { JSMpeg } from  './jsmpeg.js';
import * as nipplejs from 'nipplejs';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/skipUntil';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'navigation',
  templateUrl: 'navigation.html'
})

export class NavigationPage implements OnInit, OnDestroy {
  videoPlayer:any;
  joystickSocket:WebSocket;
  joystickLeft:any;
  joystickRight:any;
  isRecording:Boolean;
  isKilling:Boolean;

  channelsStream:Observable<number[]>;
  debugMessages:Observable<string>;

  constructor(
    private platform: Platform,
    private toastController: ToastController,
    private statusBar: StatusBar,
    private configService: ConfigService
  ) { }

  ngOnInit(){
    this.joystickSocket = new WebSocket("ws://"+ this.configService.config.ipAdress +":7777/");
    this.toastController.create({
      message: 'fsdj',
      duration: 1500,
      position: 'bottom'
    })
    Observable.fromEvent(this.joystickSocket, 'message')
      .map((message:any) => JSON.parse(message.data))
      .filter(message => message.command === "STATUSTEXT")
      .map(message => message.data.text)
      .subscribe(message => this.toastController.create({
        message,
        duration: 1500,
        position: 'bottom'
      }).present());

    if(this.platform.is('mobile')) {
      this.statusBar.hide();
    }

    this.joystickLeft = nipplejs.create({
      zone: document.getElementById('joystickLeft'),
      color: this.configService.config.couleurGaucheJoystick ,
      mode: this.configService.config.modeJoystick,
      size:(this.configService.config.tailleJoystick),
      catchDistance: (((this.configService.config.tailleJoystick))/2)
    });

    this.joystickRight = nipplejs.create({
      zone: document.getElementById('joystickRight'),
      color: this.configService.config.couleurDroiteJoystick,
      mode: this.configService.config.modeJoystick,
      size:(this.configService.config.tailleJoystick),
      catchDistance: (((this.configService.config.tailleJoystick))/2)
    });

    Observable.combineLatest(
      Observable.fromEvent(this.joystickLeft, 'move', (event, data) => data)
        .map(data => data.instance.frontPosition)
        .map(data => this.processCoords(data))
        .startWith([ 1500, 1500 ])
        .merge(Observable.fromEvent(this.joystickLeft, 'end')
          .map(event => [ 1500, 1500 ])
        ),

      Observable.fromEvent(this.joystickRight, 'move', (event, data) => data)
        .map(data => data.instance.frontPosition)
        .map(data => this.processCoords(data))
        .startWith([ 1500, 1500 ])
        .merge(Observable.fromEvent(this.joystickRight, 'end')
          .map(event => [ 1500, 1500 ])
        )
    )
    .map(values => [].concat(...values))
    .map(values => JSON.stringify(
      { command: "mavlink",
        data:{
          cmdName: "rc_channels_override",
          params: values
        }
      }
    ))
    .skipUntil(Observable.fromEvent(this.joystickSocket, 'open'))
    .subscribe(message => this.joystickSocket.send(message));

    this.videoPlayer = new JSMpeg.Player('ws://'+ this.configService.config.ipAdress +':7778/', {canvas: document.getElementById('video') });
  }

  ngOnDestroy(){
    if(this.platform.is('mobile')) {
      this.statusBar.show();
    }
    this.joystickSocket.close();
    this.videoPlayer.destroy();
  }

  processCoords(coords): number[] {
    let x = (coords.x*2)/this.configService.config.tailleJoystick;
    let y = (-coords.y*2)/this.configService.config.tailleJoystick;
    return [
      0.5*Math.sqrt(2-Math.pow(x,2)+Math.pow(y,2)+2*y*Math.SQRT2) - 0.5*Math.sqrt(2-Math.pow(x,2)+Math.pow(y,2)-2*y*Math.SQRT2),
      0.5*Math.sqrt(2+Math.pow(x,2)-Math.pow(y,2)+2*x*Math.SQRT2) - 0.5*Math.sqrt(2+Math.pow(x,2)-Math.pow(y,2)-2*x*Math.SQRT2)
    ].map(value => Math.round(1500+500*value));
  }

  loiterMode(){
    this.joystickSocket.send(JSON.stringify({
      command: "changeMode",
      data: {
        pwm: 1300
      }
    }));
  }

  altHoldMode(){
    this.joystickSocket.send(JSON.stringify({
      command: "changeMode",
      data: {
        pwm: 500
      }
    }));
  }

  autotuneMode(){
    this.joystickSocket.send(JSON.stringify({
      command: "changeMode",
      data: {
        pwm: 1400
      }
    }));
  }
  toggleHornets(){
    if(this.joystickSocket.readyState == 1){
      if(this.isKilling == false){
        this.joystickSocket.send(JSON.stringify({ command: "stopKillingHornets" }));
        this.isKilling = true;
      }else{
        this.joystickSocket.send(JSON.stringify({ command: "startKillingHornets" }));
        this.isKilling= false;
      }
    }
  }
  toggleRecord(){
    if(this.joystickSocket.readyState == 1){
      if(this.isRecording == false){
        this.joystickSocket.send(JSON.stringify({ command: "stopRecord" }));
        this.isRecording = true;
      }else{
        this.joystickSocket.send(JSON.stringify({ command: "startRecord" }));
        this.isRecording = false;
      }
    }
  }

}
