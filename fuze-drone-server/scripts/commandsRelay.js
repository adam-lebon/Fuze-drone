import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/filter';
import { websocket } from '../components/websocket';
import { flightController } from '../components/flightController';

let messageStream = Observable.fromEvent(websocket, 'connection')
                      .mergeMap(client => Observable.fromEvent(client, 'message'))
                      .map(message => message.data)
                      .map(message => JSON.parse(message));

messageStream.subscribe(message => console.log(message));

messageStream.filter(message => message.command === "mavlink")
  .map(message => message.data)
  .subscribe(command => flightController.sendCommand(command.cmdName, ...command.params))

flightController.mavlinkParser.on('STATUSTEXT', message => console.log(message.text));

let flightControllerStream = Observable.fromEvent(flightController.mavlinkParser, 'message')

flightControllerStream
  .filter(message => message.name === "STATUSTEXT")
  .map(message => message.text)
  .map(text => JSON.stringify({
    command: "STATUSTEXT",
    data: {
      text
    }
  }))
  .subscribe(message => { console.log(message); websocket.broadcast(message); },
      err => console.log(err));
