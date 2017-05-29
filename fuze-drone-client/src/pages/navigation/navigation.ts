import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng, Marker } from '@ionic-native/google-maps';
import { JSMpeg } from  './jsmpeg.js';
import * as nipplejs from 'nipplejs';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/skipUntil';
import 'rxjs/add/operator/skipWhile';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/takeWhile';

import { ConfigService } from '../../services/config.service';
import { WebsocketService } from '../../services/websocket.service';
@Component({
  selector: 'navigation',
  templateUrl: 'navigation.html'
})

export class NavigationPage implements OnInit, OnDestroy {
  isAlive:boolean;
  joystickLeft:any;
  joystickRight:any;
  videoPlayer:any;

  map: GoogleMap;
  droneMarker: Marker;

  backgroundMode:string = "video"; // "video" or "map"

  isRecording:Boolean;
  isKilling:Boolean;

  // Observables
  channelsStream:Observable<number[]>; // See JOTSICKS STREAM section
  debugMessages:Observable<string>;    // See DEBUG MESSAGES section
  gpsStream: Observable<number>;        // See SAT COUNT section

  constructor(
    private platform: Platform,
    private toastController: ToastController,
    private statusBar: StatusBar,
    private googleMaps: GoogleMaps,
    private configService: ConfigService,
    private websocketService: WebsocketService
  ) { }

  ngOnInit(){
    this.websocketService.stream.subscribe(message => console.log(message));
    this.isAlive = true; // Keep observables alive

    if(this.platform.is('mobile')) {
      this.statusBar.hide();
    }

    // Init the video player
    this.videoPlayer = new JSMpeg.Player('ws://'+ this.configService.config.ipAdress +':7778/', {canvas: document.getElementById('video') });

    /******** JOYSTICKS INITIALISATION ***********/
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
    /******** END JOYSTICKS INITIALISATION ***********/

    /********  DEBUG MESSAGES *****************
      Show a toast on the bottom when a STATUSTEXT
      is received from the flightController     */
    this.websocketService.stream
      .filter(message => message.command === "STATUSTEXT")// Keep only STATUSTEXT messages
      .map(message => message.data.text)                  // let's find the text to show
      .takeWhile(() => this.isAlive)
      .subscribe(message => this.toastController.create({ // And show a toast with the message
        message,
        duration: 1500,
        position: 'bottom'
      }).present());
    /******* END DEBUG MESSAGES *****************/

    /*************** GPS ***************************/
    this.gpsStream = this.websocketService.stream
      .filter(message => message.command === "GPS")
      .map(message => message.data);

    this.gpsStream.subscribe(message => console.log(message));
    /************* END GPS *************************/

    /******* JOTSICKS STREAM ********************
      Emit an array with the latest values emitted by the two joysticks
      between a range of 1000-2000 (1500 is the center) [ yLeftValue , xLeftValue, yRightValue, xRightValue ]
      (ex: [ 1500, 1500, 1300, 1800 ] = dont touching the left joy. but is moving the right joy.) */
    let joysticksStream = Observable.combineLatest(          // Combine latest event emitted by the two joysticks

      Observable.fromEvent(this.joystickLeft, 'move', (event, data) => data)  // We dont care about event we just want the data
      .map(data => data.instance.frontPosition)              // Keep only the relative coord
      .map(data => this.processCoords(data))                 // Parse coord to rc range (see processCoords function)
      .startWith([ 1500, 1500 ])                             // Start with neutral values
      .merge(Observable.fromEvent(this.joystickLeft, 'end')  // Emit neutral values when release the jotystick (it will keep old value otherwise)
        .map(() => [ 1500, 1500 ])
      ),

    Observable.fromEvent(this.joystickRight, 'move', (event, data) => data) // Same as above but for the right joystick
      .map(data => data.instance.frontPosition)
      .map(data => this.processCoords(data))
      .startWith([ 1500, 1500 ])
      .merge(Observable.fromEvent(this.joystickRight, 'end')
        .map(event => [ 1500, 1500 ])
      )

    ).map(values => [].concat(...values)); // Merge the two peers of values (ex: [[1500, 1500], [1500, 1500]] => [1500, 1500, 1500, 1500])
    /************ END JOYSTICKS STREAM **************************/

    /************ SEND JOYSTICKS COMMANDS *******************
      - Send the commands through the websocket when the JOYSTICKS STREAM emit values
      - Add a security when no values are emitted (when the users don't touch the screen),
        it sends neutral values: [ 1500, 1500, 1500, 1500 ] every 500ms
    */
    joysticksStream    // Emit when the user is moving the joystick
    .map(values => JSON.stringify(  // Wrap the message and stringify it
      { command: "mavlink",
        data:{
          cmdName: "rc_channels_override",
          params: values
        }
      }
    ))
    .takeWhile(() => this.isAlive)                                    // Check if the page is leaved (auto unsubscribe)
    .subscribe(message => { console.log(message); this.websocketService.emitter.next(message); });  // And send the message through the websocket
    /************ END SEND JOYSTICKS COMMANDS ********************/
  }

  ngAfterViewInit(){
    /******************************* GPS POSITION *****************************************/
    let mapStream: Observable<GoogleMap> = Observable.of(this.googleMaps.create(document.getElementById('map'))); // Emit the googleMap instance
    let mapReadyStream = mapStream.mergeMap(map => Observable.fromPromise(map.one(GoogleMapsEvent.MAP_READY)));   // Emit the mapReady event

    mapStream
      .mergeMap(map => { map.setClickable(false); return Observable.fromPromise(map.one(GoogleMapsEvent.MAP_READY)) })  // Waiting the map to be ready
      .withLatestFrom(mapStream, (dummyEvent:any, map:GoogleMap) => map)                                                // Keep only the map (not the ready event)
      .map(map => { map.setClickable(false); return map; })                                                             // Set the map untouchable
      .mergeMap((map) => Observable.fromPromise(map.addMarker({position: new LatLng(43.0741904,-89.3809802)})))         // Waiting new marker to be created
      .combineLatest(this.gpsStream, mapStream, (marker:Marker, gps:any, map:any) => ({ marker, gps, map }))            // Combining the marker + gps + map stream
      .takeWhile(() => this.isAlive)                                                                                    // Auto unsubscribe
      .subscribe(({ marker, gps, map }) => {
        map.moveCamera({ target: new LatLng(gps.lat, gps.lon), zoom: 18, tilt: 20 });                                   // Center the camera on the position
        marker.setPosition(new LatLng(gps.lat, gps.lon));                                                               // Move the marker to the new position
      });
    /************************* END GPS POSITION ********************************************/
 }

  ngOnDestroy(){
    this.isAlive = false; // Automatic unsubscribe all Observables
    if(this.platform.is('mobile')) {
      this.statusBar.show();
    }
    this.videoPlayer.destroy();   // Disconnect the video websocket
    //this.map.remove();
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
    this.websocketService.emitter.next(JSON.stringify({
      command: "changeMode",
      data: {
        pwm: 1300
      }
    }));
  }

  altHoldMode(){
    this.websocketService.emitter.next(JSON.stringify({
      command: "changeMode",
      data: {
        pwm: 500
      }
    }));
  }

  autotuneMode(){
    this.websocketService.emitter.next(JSON.stringify({
      command: "changeMode",
      data: {
        pwm: 1400
      }
    }));
  }
  toggleHornets(){
      if(this.isKilling == false){
        this.websocketService.emitter.next(JSON.stringify({ command: "stopKillingHornets" }));
        this.isKilling = true;
      }else{
        this.websocketService.emitter.next(JSON.stringify({ command: "startKillingHornets" }));
        this.isKilling= false;
      }
  }
  toggleRecord(){
      if(this.isRecording == false){
        this.websocketService.emitter.next(JSON.stringify({ command: "stopRecord" }));
        this.isRecording = true;
      }else{
        this.websocketService.emitter.next(JSON.stringify({ command: "startRecord" }));
        this.isRecording = false;
    }
  }

}
