import { SerialPort } from 'serialport';
import { mavlink, mavDecoder } from '../lib/mavlink.js';
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
  })

})

function initSerialPort(portId){
  port = new SerialPort(portId, {
    baudrate: 57600
  });

  port.on('open', () => {
    console.log('serialPort is ready!');
    port.on('data', (data) => {
      mavlinkParser.parseBuffer(data);
    });
  });
}

mavlinkParser.on('message', (message) => {
/*  console.log('Got a message !');
  console.log(message);*/
});

mavlinkParser.on('ATTITUDE', (message) => {
//  console.log(message);
});

export { port };
