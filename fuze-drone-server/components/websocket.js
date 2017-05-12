import { Config } from './config';
import { Server } from 'ws';
import { flightController } from './FlightController';

console.log(`Starting websocket server on port: ${Config.websocket.port}`);

const server = new Server({ port: Config.websocket.port });


//console.log(`Error starting websocket: ${e}`);

var channels = [ 0, 0, 0, 0 ];

server.on('connection', ws => {

  console.log('New client !');

  ws.on('message', message => {
    //console.log(message);
    let parsed = JSON.parse(message);
    switch (parsed.command) {
      case "leftJoystick":
        channels[0] = parsed.data.x;
        channels[1] = parsed.data.y;
        flightController.sendCommand('rc_channels_override', channels);
        break;

      case "rightJoystick":
        channels[2] = parsed.data.x;
        channels[3] = parsed.data.y;
        flightController.overrideRc('rc_channels_override', channels);
        break;

      case "mavlinkCommand":
        flightController.sendCommand(message.data.cmdName, ...message.data.params);
        break;

      case "startRecord":
        console.log("Start recording");
        break;

      case "stopRecord":
        console.log("Stop record")
        break;
    }

  })
});

export { server };
