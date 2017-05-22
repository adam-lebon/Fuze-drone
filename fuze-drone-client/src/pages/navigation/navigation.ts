import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { JSMpeg } from  './jsmpeg.js';
import * as nipplejs from 'nipplejs';
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

  constructor(private platform:Platform , private configService: ConfigService) { }

  ngOnInit(){
    this.joystickSocket = new WebSocket("ws://"+ this.configService.config.ipAdress +":7777/");
    this.joystickSocket.onmessage = event => {
      if(JSON.parse(event.data).command == 'ping'){
        this.joystickSocket.send('{ "command": "pong" }');
      }
    };

    if(this.platform.is('mobile')) {
      StatusBar.hide();
    }

    this.joystickLeft = nipplejs.create({
      zone: document.getElementById('joystickLeft'),
      color: this.configService.config.couleurGaucheJoystick ,
      mode: this.configService.config.modeJoystick,
      size:(this.configService.config.tailleJoystick),
      catchDistance: (((this.configService.config.tailleJoystick))/2)
    }).on('move', (evt, data) => {
      let x = (data.instance.frontPosition.x*2)/this.configService.config.tailleJoystick;
      let y = (-data.instance.frontPosition.y*2)/this.configService.config.tailleJoystick;

      let leftJoystick = {
        command: "leftJoystick" ,
        data: {
          x: Math.round(1500+400*(0.5*Math.sqrt(2+Math.pow(x,2)-Math.pow(y,2)+2*x*Math.SQRT2) - 0.5*Math.sqrt(2+Math.pow(x,2)-Math.pow(y,2)-2*x*Math.SQRT2))),
          y: Math.round(1500+400*(0.5*Math.sqrt(2-Math.pow(x,2)+Math.pow(y,2)+2*y*Math.SQRT2) - 0.5*Math.sqrt(2-Math.pow(x,2)+Math.pow(y,2)-2*y*Math.SQRT2)))
        }
      };
      console.log(leftJoystick.data.x);
      console.log(leftJoystick.data.y);

      if(this.joystickSocket.readyState == 1){
        this.joystickSocket.send(JSON.stringify(leftJoystick));
      }
    }).on('end', () => {
      if(this.joystickSocket.readyState == 1){
        this.joystickSocket.send(JSON.stringify({
          command: "leftJoystick" ,
          data: {
            x: 1500,
            y: 1500
          }
        }));
      }
    });

    this.joystickRight = nipplejs.create({
      zone: document.getElementById('joystickRight'),
      color: this.configService.config.couleurDroiteJoystick,
      mode: this.configService.config.modeJoystick,
      size:(this.configService.config.tailleJoystick),
      catchDistance: (((this.configService.config.tailleJoystick))/2)
    }).on('move', (evt, data) => {
      let x = (data.instance.frontPosition.x*2)/this.configService.config.tailleJoystick;
      let y = (-data.instance.frontPosition.y*2)/this.configService.config.tailleJoystick;

      let rightJoystick = {
        command: "rightJoystick" ,
        data: {
          x: Math.round(1500+400*(0.5*Math.sqrt(2+Math.pow(x,2)-Math.pow(y,2)+2*x*Math.SQRT2) - 0.5*Math.sqrt(2+Math.pow(x,2)-Math.pow(y,2)-2*x*Math.SQRT2))),
          y: Math.round(1500+400*(0.5*Math.sqrt(2-Math.pow(x,2)+Math.pow(y,2)+2*y*Math.SQRT2) - 0.5*Math.sqrt(2-Math.pow(x,2)+Math.pow(y,2)-2*y*Math.SQRT2)))
        }
      };
      if(this.joystickSocket.readyState == 1){
        this.joystickSocket.send(JSON.stringify(rightJoystick));
      }
    }).on('end', () => {
      if(this.joystickSocket.readyState == 1){
        this.joystickSocket.send(JSON.stringify({
          command: "rightJoystick" ,
          data: {
            x: 1500,
            y: 1500
          }
        }));
      }
    });;
    this.videoPlayer = new JSMpeg.Player('ws://'+ this.configService.config.ipAdress +':7778/', {canvas: document.getElementById('video') });
  }

  ngOnDestroy(){
    if(this.platform.is('mobile')) {
      StatusBar.show();
    }
    this.joystickSocket.close();
    this.videoPlayer.destroy();
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
