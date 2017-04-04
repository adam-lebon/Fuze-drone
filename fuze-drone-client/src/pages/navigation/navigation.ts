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
    if(this.platform.is('mobile')) {
      StatusBar.hide();
    }

    this.joystickLeft = nipplejs.create({
      zone: document.getElementById('joystickLeft'),
      color: this.configService.config.couleurGaucheJoystick ,
      mode: this.configService.config.modeJoystick,
      catchDistance: 50
    }).on('move', (evt, data) => {
      console.log(data.instance.frontPosition.x*2);
      console.log(data.instance.frontPosition.y*2);
    });

    this.joystickRight = nipplejs.create({
      zone: document.getElementById('joystickRight'),
      color: this.configService.config.couleurDroiteJoystick,
      mode: this.configService.config.modeJoystick,
      catchDistance: 50
    });
    /*var client = new WebSocket( 'ws://172.22.2.0:8082' );
    var canvas = document.getElementById('video-canvas');
    var player = new JSMpeg(client, {canvas: canvas});*/
    var canvas = document.getElementById('video');
    var url = 'ws://10.9.0.1:7779/';
    var player = new JSMpeg.Player(url, {canvas: canvas});


  }

  ngOnDestroy(){
    if(this.platform.is('mobile')) {
      StatusBar.show();
    }
  }

 }
