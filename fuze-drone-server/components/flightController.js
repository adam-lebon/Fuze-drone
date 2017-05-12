import mavlink from 'mavlink_ardupilotmega_v1.0';
import { SerialPort } from 'serialport';
import prompt from 'prompt-promise';

console.log("TEST");


 class FlightController {
   constructor(){
     //this.defaultPortId = 0;
     this.values = {
       "RC_CHANNELS_RAW": {}
     };
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
           initSerialPort(port.comName);
         }
         console.log('---');
       });

       if(!this.port){
         console.log('TEST');
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

     this.port.on('open', () => {
       console.log('serialPort is ready!');
       // Provision the instantiated mavlinkParser object with the connection
       this.mavlinkParser.setConnection(this.port);

       // When the connection issues a "got data" event, try and parse it
       this.port.on('data', data => {
        this.mavlinkParser.parseBuffer(data);

       });

       //this.mavlinkParser.send(new mavlink.messages.request_data_stream(1, 1, mavlink.MAV_DATA_STREAM_RC_CHANNELS, 255, 1));
       this.overrideRc([1000, 1500, 1500, 1500, 0, 0, 0, 0]);
       setTimeout(() => {
         this.mavlinkParser.on('message', message => {
           console.log(message);
           //message.fieldnames.forEach( fieldname => console.log(`${fieldname}: ${message[fieldname]}`) );
         });
         this.mavlinkParser.send(new mavlink.messages.command_long(1, 1, 400, 0, 1));
       } , 10000);
     });
   }

   initListeners(){
     this.mavlinkParser.on('RC_CHANNELS_RAW', message => {
       this.values.rcChannelsRaw = {
         "chan1_raw": message.chan1_raw,
         "chan2_raw": message.chan2_raw,
         "chan3_raw": message.chan3_raw,
         "chan4_raw": message.chan4_raw,
         "chan5_raw": message.chan5_raw,
         "chan6_raw": message.chan6_raw,
         "chan7_raw": message.chan7_raw,
         "chan8_raw": message.chan8_raw,
       };
       //console.log(this.values.rcChannelsRaw);
     });
   }

   sendCommand(name, ...params){
     if (name === "rc_channels_override") {

       if(this.security) { clearTimeout(this.security); }

       security = setTimeout(() => this.sendCommand("rc_channels_override", 0, 0, 0, 0, 0, 0, 0, 0), 1000);
     }
     this.mavlinkparser.send(new mavlink.messages[name](1, 1, params));
   }
 }

const flightController = new FlightController;

//var flightController = "test";
 export { flightController };

// Instantiate the parser



/*
function initSerialPort(portId){
  port = new SerialPort(portId, {
    baudrate: 57600
  });


}

/*

mavlinkParser.on('fsdfsdfsd', function(message) {
 //console.log('Got a message of any type!');
 console.log('---');
 console.log(message);
 let me = new mavlink.messages.rc_channels_override(255, 1, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800);
//console.log(me);
 mavinkParser.send(me);
});

export { port, mavlink };
/*
import { mavlink, mavDecoder } from '../lib/mavlink.js';
import { SerialPort } from 'serialport';
//var MAVLink = require('../lib/mavlink.js');
var port,
    mavlinkParser = new mavDecoder(null, 255, 1);

SerialPort.list((err, ports) => {
  if (err) {
    console.error(err);
    return;
  }
  ports.forEach((port) => {
    console.log(`Name: ${port.comName}`);
    console.log(`ID: ${port.pnpId}`);
    console.log(`Name: ${port.manufacturer}`);

    if (port.pnpId && port.pnpId.includes('PX4')) {
      console.log(`Found flight controller on port ${port.comName}`);
      initSerialPort(port.comName);
    }
    console.log('---');
  });

  if(!port){
    initSerialPort("COM20");

  }


})

function initSerialPort(portId){
  port = new SerialPort(portId, {
    baudrate: 57600
  });

  port.on('open', () => {
    console.log('serialPort is ready!');
    let message = new Buffer(new mavlink.messages.message_interval(mavlink.MAVLINK_MSG_ID_RC_CHANNELS_RAW, 100).pack(mavlinkParser));
    console.log(message);

    port.write(message, (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log('Message send');
    });
    port.on('data', (data) => {
      mavlinkParser.parseBuffer(data);
    });

    setInterval(() => {
      let message = new mavlink.messages.rc_channels_override(1, 1, 1600, 1600, 1600, 1600, 1600, 1600, 1600, 1600);

      console.log(typeof new Buffer(message.pack(mavlinkParser)));
      port.write(new Buffer(message.pack(mavlinkParser)));
      console.log('SENDDDDDDDDDDDDDDDDDDDDDD');
    }, 1000);

  });
}

mavlinkParser.on('RC_CHANNELS_RAW', (message) => {
  console.log(message.chan1_raw);
});

export { port };*/
