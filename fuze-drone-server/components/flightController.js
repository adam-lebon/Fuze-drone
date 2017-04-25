var port,
 mavlink = require('mavlink_ardupilotmega_v1.0'),
 net = require('net');
 import { SerialPort } from 'serialport';

// Instantiate the parser
var mavlinkParser = new mavlink();

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
    // Provision the instantiated mavlinkParser object with the connection
    mavlinkParser.setConnection(port);

    // When the connection issues a "got data" event, try and parse it
    port.on('data', function(data) {
     mavlinkParser.parseBuffer(data);

    });

    let request = new mavlink.messages.request_data_stream(1, 1, mavlink.MAV_DATA_STREAM_RC_CHANNELS, 1, 1);
    console.log(request);
    mavlinkParser.send(request);

    setInterval(() =>{
      let azea = new mavlink.messages.rc_channels_override(1, 1, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200);
      mavlinkParser.send(azea);
    }, 10);
  });
}

mavlinkParser.on('RC_CHANNELS_RAW', function(message){
  console.log(message);
})

mavlinkParser.on('fsdfsdfsd', function(message) {
 //console.log('Got a message of any type!');
 console.log('---');
 console.log(message);
 let me = new mavlink.messages.rc_channels_override(1, 1, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800);
//console.log(me);
 mavinkParser.send(me);

 let cmd = new mavlink.messages.command_long(1, 1, 400, 0, 1);
 mavlinkParser.send(cmd);
});

export { port };
/*
import { mavlink, mavDecoder } from '../lib/mavlink.js';
import { SerialPort } from 'serialport';
//var MAVLink = require('../lib/mavlink.js');
var port,
    mavlinkParser = new mavDecoder(null, 1, 1);

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
    let message = new Buffer(new mavlink.messages.message_interval(mavlink.MAVLINK_MSG_ID_RC_CHANNELS_SCALED, 100).pack(mavlink));
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
      port.write(new Buffer(new mavlink.messages.command_long(1, 1, mavlink.MAV_CMD_COMPONENT_ARM_DISARM, 0, 1).pack(mavlink)));

      let message = new mavlink.messages.rc_channels_override(1, 1, 1600, 1600, 1600, 1600, 1600, 1600, 1600, 1600);
      port.write(new Buffer(message.pack(mavlink)));
      console.log('SENDDDDDDDDDDDDDDDDDDDDDD');
    }, 100000);

  });
}

mavlinkParser.on('RC_CHANNELS_RAW', (message) => {
  console.log(message);
});

export { port };
*/
