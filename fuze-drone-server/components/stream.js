import { Config } from './config';
import { Server } from 'ws';
import Http from 'http';
import spawn from 'child_process';
//import execFile from 'child_process';

console.log(`[GENERAL] Starting stream server on port: ${Config.stream.port.http}`);

const server = new Http.createServer(onRequest).listen(Config.stream.port.http);

console.log(`[GENERAL] Starting websocket stream server on port: ${Config.stream.port.websocket} `);

const websocket = new Server({ port: Config.stream.port.websocket});

console.log(`[GENERAL] Starting FFMPEG on the stream server:`);

/*const child = execFile('ffmpeg', ['v4l2 -video_size 640x480 -i /dev/video0 -vcodec mpeg1video -threads 4 -f mpegts http://localhost:' + Config.stream.port.http], (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
});*/

/*const child = execFile('echo', ['hello'], (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
});*/


//const ls = spawn('echo', ['ello']);

websocket.on('connection', ws => {

	if(websocket.clients.lenght === Config.stream.maxClients){
		console.log('[STREAM-WS] New video client, but the server is full. Kicking client.');
		ws.terminate();
	}
	else {
		console.log('[STREAM-WS] New video client !');
		console.log('[STREAM-WS] Address:' + ws.upgradeReq.socket.remoteAddress);
		console.log('[STREAM-WS] Explorer:' + ws.upgradeReq.headers['user-agent']);
	}
});

websocket.broadcast = function(data) {
	websocket.clients.forEach(function each(client) {
			if (client.readyState === websocket.OPEN) {
        client.send(data);
      }
	});
};

websocket.on('deconnection', function close() {
  console.log('[STREAM-WS] JE ME CASSE VOUS ME FAITES CHIER !');
});

function onRequest(request, reply) {
  reply.connection.setTimeout(0); // On désactive la déconnexion automatique pour éviter de se faire déconnecter pour inactivité
  console.log('[STREAM-HTTP] Stream Connected: ' + request.socket.remoteAddress + ':' +	request.socket.remotePort ); // On affiche un message

  // Quand on reçoit une trame vidéo
  request.on('data', data => {
  		websocket.broadcast(data);   // On l'envois sur le websocket
  	});
	request.on('end',function(){
		console.log('[STREAM-HTTP] Stream connection closed'); // On affiche un message de déconnexion.
	});
}
