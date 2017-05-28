import mavlink from 'mavlink_ardupilotmega_v1.0';
import SerialPort from 'serialport';
import prompt from 'prompt-promise';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';

class FlightController {
  constructor(){
    this.defaultPortId = 0;
    this.port = null;
    this.security = null;
    this.mavlinkParser = new mavlink(undefined, 255);

    this.initListeners();

    SerialPort.list((err, ports) => {
      if (err) {
        throw new Error(err.message);
        return;
      }
      ports.forEach((port) => {
        console.log(`N°${ports.indexOf(port)}`);
        console.log(`Name: ${port.comName}`);
        console.log(`ID: ${port.pnpId}`);
        console.log(`Name: ${port.manufacturer}`);

        if (port.pnpId && port.pnpId.includes('PX4')) {
          console.log(`Found flight controller on port ${port.comName}`);
          this.initSerialPort(port.comName);
        }
        console.log('---');
      });

      if(!this.port){
        if (this.defaultPortId === null || this.defaultPortId === undefined) {
          prompt('Wich port do you want to use? : ')
          .then(value => { console.log(ports[parseInt(value)].comName); this.initSerialPort(ports[parseInt(value)].comName); });
        }else {
          this.initSerialPort(ports[parseInt(this.defaultPortId)].comName);
        }
      }

    })
  }

  initSerialPort(comName){
    this.port = new SerialPort(comName, {
      baudrate: 57600
    });

    Observable.fromEvent(this.port, 'open')
      .subscribe(() => {
        console.log(`'[F.C.] \u2713 Serial port is open on port ${comName}`.green);
        this.mavlinkParser.setConnection(this.port);
        this.mavlinkParser.send(new mavlink.messages.request_data_stream(1, 1, mavlink.MAV_DATA_STREAM_EXTENDED_STATUS, 255, 1));
      });

    Observable.fromEvent(this.port, 'data')
      .subscribe(data => this.mavlinkParser.parseBuffer(data));

    /*this.port.on('open', () => {
      console.log('serialPort is ready!');
      // Provision the instantiated mavlinkParser object with the connection
      this.mavlinkParser.setConnection(this.port);

      // When the connection issues a "got data" event, try and parse it
      this.port.on('data', data => {
        this.mavlinkParser.parseBuffer(data);

      });

      this.mavlinkParser.send(new mavlink.messages.request_data_stream(1, 1, mavlink.MAV_DATA_STREAM_RC_CHANNELS, 255, 1));
      //this.overrideRc([1000, 1500, 1500, 1500, 0, 0, 0, 0]);
      setTimeout(() => {
        this.mavlinkParser.on('message', message => {
          //console.log(message);
          //message.fieldnames.forEach( fieldname => console.log(`${fieldname}: ${message[fieldname]}`) );
        });
        //this.sendCommand('rc_channels_override', 1600, 1650, 1700, 1750);
        //this.mavlinkParser.send(new mavlink.messages.command_long(1, 1, 400, 0, 1));
      } , 1000);
    });*/
  }

  initListeners(){
    Observable.fromEvent(this.mavlinkParser, 'STATUSTEXT')
      .map(message => JSON.stringify({ message: "STATUSTEXT", data: { text: message.text}}))
      .subscribe(message => console.log(message.data.text));
  }

  sendCommand(name, ...params){
    if(!(this.port && this.port.isOpen())){ return true; }

    if (name === "rc_channels_override") {

      //if(this.security) { clearTimeout(this.security); }

      //security = setTimeout(() => this.sendCommand("rc_channels_override", 0, 0, 0, 0, 0, 0, 0, 0), 1000);
    }
    //console.log('Envoie de valeurs de test: ' + params);
    this.mavlinkParser.send(new mavlink.messages[name](1, 1, ...params));
  }
}

const flightController = new FlightController();

export { flightController };
