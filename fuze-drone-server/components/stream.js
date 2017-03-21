import { Config } from './config';
import { Server } from 'ws';
import Http from 'http';

console.log(`Starting stream server on port: ${Config.stream.port.http}`);

const server = new Http.createServer(onRequest).listen(Config.stream.port.http);

console.log(`Starting websocket stream server on port: ${Config.stream.port.websocket}`);

const websocket = new Server({ port: Config.stream.port.websocket });

websocket.broadcast = function(data) {
	websocket.clients.forEach(function each(client) {
		//if (client.readyState === Server.OPEN) {
			client.send(data);
		//}
	});
};

function onRequest(request, reply) {
  reply.connection.setTimeout(0); // On désactive la déconnexion automatique pour éviter de se faire déconnecter pour inactivité
  console.log('Stream Connected: ' + request.socket.remoteAddress + ':' +	request.socket.remotePort ); // On affiche un message

  // Quand on reçoit une trame vidéo
  request.on('data', function(data){
  		websocket.broadcast(data);   // On l'envois sur le websocket
  	});
  	request.on('end',function(){
  		console.log('Stream connection closed'); // On affiche un message de déconnexion.
  	});
}
