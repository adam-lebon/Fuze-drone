import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/bufferTime';
import { websocket } from '../components/websocket';
import { flightController } from '../components/flightController';

let messageStream = Observable.fromEvent(websocket, 'connection')
                      .mergeMap(client => Observable.fromEvent(client, 'message'))
                      .map(message => message.data)
                      .map(message => JSON.parse(message));

let mavlinkCommandStream = messageStream.filter(message => message.command === "mavlink")
  .map(message => message.data)

mavlinkCommandStream.subscribe(command => flightController.sendCommand(command.cmdName, ...command.params));
mavlinkCommandStream.filter(command => command.cmdName === "rc_channels_override")
  .bufferTime(1000)
  .map(messages => messages.length)
  .filter(count => count < 2)
  .subscribe(count => flightController.sendCommand('rc_channels_override', 0, 0, 0, 0, 0, 0, 0, 0));


let flightControllerStream = Observable.fromEvent(flightController.mavlinkParser, 'message');

flightControllerStream
  .filter(message => message.name === "STATUSTEXT")
  .map(message => message.text)
  .map(text => JSON.stringify({
    command: "STATUSTEXT",
    data: {
      text
    }
  }))
  .subscribe(message => { console.log(message); websocket.broadcast(message); });

  Observable.fromEvent(flightController.mavlinkParser, "GPS_RAW_INT")
  .map(message => ({
    lat: message.lat/10000000,
    lon: message.lon/10000000,
    alt: message.alt/1000,
    satellites_visible: message.satellites_visible
  }))
  .map(data => JSON.stringify({
    command: "GPS",
    data
  }))
  .subscribe(message => { console.log(message); websocket.broadcast(message); });
