import { Config } from './config';
import WebSocket from 'ws';
import Http from 'http';
import { spawn } from 'child_process';
import fs from 'fs';
import { sync as commandExist } from 'command-exists';
import 'colors';


class Stream {
  constructor(){
    this.isRecording = false;
    this.recording = null;

    if(commandExist('ffmpeg')){
      console.log('\u2713 FFMPEG found\n'.green);

      try {
        this.server = new Http.createServer(this.onRequest).listen(Config.stream.port.http);
        console.log(`[STREAM] \u2713 Stream server started on port ${Config.stream.port.http}`.green);
      } catch (err) {
        console.log(`[STREAM] \u2717 Error while starting stream server: ${err.message}`.bgRed);
      }

      try {
        this.websocket = new WebSocket.Server({ port: Config.stream.port.websocket});
        this.initWebsocketListeners();
        console.log(`[STREAM] \u2713 Stream websocket server is started on port ${Config.stream.port.websocket}`.green);
      } catch (err) {
        console.log(`[STREAM] \u2717 Error while starting Stream websocket server: ${err.message}`.bgRed);
      }

      try {
        spawn('ffmpeg', ('-f v4l2 -video_size 640x480 -i /dev/video0 -vcodec mpeg1video -threads 4 -f mpegts http://localhost:' + Config.stream.port.http).split(" "));
        console.log(`[STREAM] \u2713 FFMPEG is started`.green);
      } catch (err) {
        console.log(`[STREAM] \u2717 Error in FFMPEG: ${err.message}`.bgRed);
      }

    }else{
      console.log('\u2717 FFMPEG not found in PATH'.bgRed);
      console.log('\u2937 Video streaming will not start !'.bgWhite.underline.blue);
    }
  }

  setRecordingState(status){
    isRecording = status;
    if(status == false){
      var path = '/home/pi/Videos/DRONE-' + Date.now() + '.ts';
      recording = fs.createWriteStream(path);
    }
  }

  initWebsocketListeners(){
      this.websocket.on('connection', ws => {

      	if(this.websocket.clients.lenght === Config.stream.maxClients){
      		console.log('[STREAM-WS] New video client, but the server is full. Kicking client.');
      		ws.terminate();
      	}
      	else {
      		console.log('[STREAM-WS] New video client !');
      		console.log('[STREAM-WS] Address:' + ws.upgradeReq.socket.remoteAddress);
      		console.log('[STREAM-WS] Explorer:' + ws.upgradeReq.headers['user-agent']);
      	}
      });

      this.websocket.broadcast = function(data) {
      	this.websocket.clients.forEach(function each(client) {
      			if (client.readyState === WebSocket.OPEN) {
              client.send(data);
            }
      	});
      };

      this.websocket.on('deconnection', function close() {
        console.log('[STREAM-WS] JE ME CASSE VOUS ME FAITES CHIER !');
      });
  }

  onRequest(request, reply) {
    reply.connection.setTimeout(0); // On désactive la déconnexion automatique pour éviter de se faire déconnecter pour inactivité
    console.log('[STREAM-HTTP] Stream Connected: ' + request.socket.remoteAddress + ':' +	request.socket.remotePort ); // On affiche un message

    // Quand on reçoit une trame vidéo
    request.on('data', data => {
    		this.websocket.broadcast(data);   // On l'envois sur le websocket
  			if (isRecording) {
  				recording.write(data);
  			}
    	});
  	request.on('end',function(){
  		console.log('[STREAM-HTTP] Stream connection closed'); // On affiche un message de déconnexion.
  		if (isRecording && recording != null) {
  			recording.close();
        recording = null;
  		}
  	});
  }
}

const stream = new Stream();

export { stream };
