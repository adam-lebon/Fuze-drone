import { Config } from './config';
import { Server } from 'ws';

console.log(`Starting websocket server on port: ${Config.websocket.port}`);

const server = new Server({ port: Config.websocket.port });

//console.log(`Error starting websocket: ${e}`);

server.on('connection', ws => {

  console.log('New client !');

  ws.on('message', message => {
    console.log(message);
  })
});
