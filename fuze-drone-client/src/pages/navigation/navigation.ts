import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { JSMpeg } from  './jsmpeg.js';
import * as nipplejs from 'nipplejs';


@Component({
  selector: 'navigation',
  templateUrl: 'navigation.html'
})

export class NavigationPage implements OnInit, OnDestroy {
  manager:any;

  constructor(private platform:Platform) { }

  ngOnInit(){
    if(this.platform.is('mobile')) {
      StatusBar.hide();
    }
    this.manager = nipplejs.create({
      zone: document.getElementById('joystickLeft'),
      color: "#FF0000",
      mode: "semi",
      catchDistance: 50
    });
    this.manager = nipplejs.create({
      zone: document.getElementById('joystickRight'),
      color: "#00FF00",
      mode: "semi",
      catchDistance: 50
    });
    /*var client = new WebSocket( 'ws://172.22.2.0:8082' );
    var canvas = document.getElementById('video-canvas');
    var player = new JSMpeg(client, {canvas: canvas});*/
    var canvas = document.getElementById('video');
    var url = 'ws://10.9.0.1:8082/';
    var player = new JSMpeg.Player(url, {canvas: canvas});
  }

  ngOnDestroy(){
    if(this.platform.is('mobile')) {
      StatusBar.show();
    }
  }

 }
