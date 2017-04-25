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
  joystickLeft:any;
  joystickRight:any;

  constructor(private platform:Platform , private configService: ConfigService) { }

  ngOnInit(){
    var joystickSocket = new WebSocket("ws://10.9.0.1:7777/");
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
      //console.log("1");
      //console.log(Math.round((100*(data.instance.frontPosition.x)/(this.configService.config.tailleJoystick))*10)/10);
      console.log(Math.round(1500+(data.instance.frontPosition.x*2/(this.configService.config.tailleJoystick))*500));
  //    console.log(data.instance.frontPosition.y);
        let leftJoystick = {
          type: "leftJoystick" ,
          x: Math.round(1500+(data.instance.frontPosition.x*2/(this.configService.config.tailleJoystick))*500) ,
          y: Math.round(1500+(data.instance.frontPosition.y*2/(this.configService.config.tailleJoystick))*500)
        };
        if(joystickSocket.readyState == 1){
        joystickSocket.send(JSON.stringify(leftJoystick));
      }
    });

    this.joystickRight = nipplejs.create({
      zone: document.getElementById('joystickRight'),
      color: this.configService.config.couleurDroiteJoystick,
      mode: this.configService.config.modeJoystick,
      size:(this.configService.config.tailleJoystick),
      catchDistance: (((this.configService.config.tailleJoystick))/2)
    }).on('move', (evt, data) => {
      console.log("2");
      /*console.log(data.instance.frontPosition.x);
      console.log(data.instance.frontPosition.y);*/

      let rightJoystick = {
        type: "rightJoystick" ,
        x: Math.round(1500+(data.instance.frontPosition.x*2/(this.configService.config.tailleJoystick))*500) ,
        y: Math.round(1500+(data.instance.frontPosition.y*2/(this.configService.config.tailleJoystick))*500)
      };
      if(joystickSocket.readyState == 1){
      joystickSocket.send(JSON.stringify(rightJoystick));

    }
    });

    /*var client = new WebSocket( 'ws://172.22.2.0:8082' );
    var canvas = document.getElementById('video-canvas');
    var player = new JSMpeg(client, {canvas: canvas});*/
    new JSMpeg.Player('ws://10.9.0.1:7779/', {canvas: document.getElementById('video') });


  }

  ngOnDestroy(){
    if(this.platform.is('mobile')) {
      StatusBar.show();
    }
  }

 }
