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
  joystickSocket:WebSocket;
  joystickLeft:any;
  joystickRight:any;
  isRecording:Boolean;
  isKillingHornets:Boolean;
  isArmed:Boolean;

  constructor(private platform:Platform , private configService: ConfigService) { }

  ngOnInit(){
    this.joystickSocket = new WebSocket("ws://"+ this.configService.config.ipAdress +":7777/");
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
      console.log(Math.round(1500+(data.instance.frontPosition.x*2/(this.configService.config.tailleJoystick))*500));
        let leftJoystick = {
          command: "leftJoystick" ,
          data: {
            x: Math.round(1500+(data.instance.frontPosition.x*2/(this.configService.config.tailleJoystick))*500) ,
            y: Math.round(1500+(data.instance.frontPosition.y*2/(this.configService.config.tailleJoystick))*500)
          }
        };
        if(this.joystickSocket.readyState == 1){
        this.joystickSocket.send(JSON.stringify(leftJoystick));
      }
    });

    this.joystickRight = nipplejs.create({
      zone: document.getElementById('joystickRight'),
      color: this.configService.config.couleurDroiteJoystick,
      mode: this.configService.config.modeJoystick,
      size:(this.configService.config.tailleJoystick),
      catchDistance: (((this.configService.config.tailleJoystick))/2)
    }).on('move', (evt, data) => {

      let rightJoystick = {
        command: "rightJoystick" ,
        data: {
          x: Math.round(1500+(data.instance.frontPosition.x*2/(this.configService.config.tailleJoystick))*500) ,
          y: Math.round(1500+(data.instance.frontPosition.y*2/(this.configService.config.tailleJoystick))*500)
        }
      };
      if(this.joystickSocket.readyState == 1){
        this.joystickSocket.send(JSON.stringify(rightJoystick));
      }
    });
    new JSMpeg.Player('ws://'+ this.configService.config.ipAdress +':7778/', {canvas: document.getElementById('video') });
  }

  ngOnDestroy(){
    if(this.platform.is('mobile')) {
      StatusBar.show();
    }
  }
  toggleKillingHornets(){
    if(this.joystickSocket.readyState == 1){
      if(this.isKillingHornets){
        this.joystickSocket.send(JSON.stringify({ command: "stopKillingHornets" }));
      }else{
        this.joystickSocket.send(JSON.stringify({ command: "startKillingHornets" }));
      }
    }
  }
  toggleRecord(){
    if(this.joystickSocket.readyState == 1){
      if(this.isRecording){
        this.joystickSocket.send(JSON.stringify({ command: "stopRecord" }));
      }else{
        this.joystickSocket.send(JSON.stringify({ command: "startRecord" }));
      }
    }
  }
  toggleArm(){
    if(this.joystickSocket.readyState == 1){
      if(this.isArmed){
        this.joystickSocket.send(JSON.stringify({ command: "disarm" }));
      }else{
        this.joystickSocket.send(JSON.stringify({ command: "arm" }));
      }
    }
  }
}
