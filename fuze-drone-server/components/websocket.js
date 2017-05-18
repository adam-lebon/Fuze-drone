import { Config } from './config';
import { Server } from 'ws';
import { flightController } from './FlightController';

console.log(`Starting websocket server on port: ${Config.websocket.port}`);

const server = new Server({ port: Config.websocket.port });



//console.log(`Error starting websocket: ${e}`);

var channels = [ 0, 0, 0, 0 ];

server.on('connection', ws => {

  console.log('New client !');

  ws.security = setInterval(() => {
    ws.send('{ "command": "ping" }');
    setTimeout(() => { if(Date.getMilliseconds() - ws.lastMessage > 1000){ ws.close(); } }, 1000)
  }, 5000);

  ws.on('message', message => {
    console.log(message);
    let parsed = JSON.parse(message);
    switch (parsed.command) {
      case "pong":
        console.log("pong");
        ws.lastMessage = Date.getMilliseconds();
        break;
      case "leftJoystick":
        channels[1] = parsed.data.x;
        channels[0] = parsed.data.y;
        flightController.sendCommand('rc_channels_override', ...channels);
        break;

      case "rightJoystick":
        channels[3] = parsed.data.x;
        channels[2] = parsed.data.y;
        flightController.sendCommand('rc_channels_override', ...channels);
        break;

      case "mavlinkCommand":
        flightController.sendCommand(message.data.cmdName, ...message.data.params);
        break;

      case "startRecord":
        console.log("Start recording");
        Config.
        break;

      case "stopRecord":
        console.log("Stop record");
        break;
    }

  });
});
//.on('close', () => { console.log('closed'); flightController.sendCommand("rc_channels_override", 0, 0, 0, 0)} );

export { server };
