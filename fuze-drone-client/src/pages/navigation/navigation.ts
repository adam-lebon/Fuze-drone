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
  isKilling:Boolean;
  isArming:Boolean;

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
    new JSMpeg.Player('ws://'+ this.configService.config.ipAdress +':7778/', {canvas: document.getElementById('video') });
  }

  ngOnDestroy(){
    if(this.platform.is('mobile')) {
      StatusBar.show();
    }
  }
  toggleHornets(){
    if(this.joystickSocket.readyState == 1){
      if(this.isKilling){
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
      if(this.isRecording){
        this.joystickSocket.send(JSON.stringify({ command: "stopRecord" }));
        this.isRecording = true;
      }else{
        this.joystickSocket.send(JSON.stringify({ command: "startRecord" }));
        this.isRecording = false;
      }
    }
  }
  toggleArm(){
    if(this.joystickSocket.readyState == 1){
      if(this.isArming){
        this.joystickSocket.send(JSON.stringify({ command: "mavlinkCommand", data: { name: "command_long", params: [400,0,1]} }));
        this.isArming = true;
      }else{
        this.joystickSocket.send(JSON.stringify({ command: "mavlinkCommand", data: { name: "command_long", params: [400,0,0]} }));
        this.isArming = false;
      }
    }
  }
}
