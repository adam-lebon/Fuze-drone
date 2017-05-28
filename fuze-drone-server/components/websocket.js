import { Config } from './config';
import { Server } from 'ws';
import { flightController } from './flightController';
import { setRecordingState } from './stream';
import 'colors';

var websocket;

try{
  websocket = new Server({ port: Config.websocket.port });
  console.log(`[WEBSOCKET] \u2713 Websocket is started on port ${Config.websocket.port}`.green);

}catch(err){
  console.log(`[WEBSOCKET] Error: ${err.message}`.bgRed);

}finally{
  websocket.broadcast = function(data){
    websocket.clients.forEach(client => client.send(data));
  }
  
  websocket.on('connection', ws => {

    console.log('New client !');

  });
}

export { websocket };
