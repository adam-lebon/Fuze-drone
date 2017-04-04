import { Config } from './config';
import { Server } from 'ws';
import Http from 'http';

var nbClients = 0;


var test1=50000000000000,
		test2=52;
console.log(`[GENERAL] Starting stream server on port: ${Config.stream.port.http}`);

const server = new Http.createServer(onRequest).listen(Config.stream.port.http);

console.log(`[GENERAL] Starting websocket stream server on port: ${Config.stream.port.websocket} `);

const websocket = new Server({ port: Config.stream.port.websocket, backlog: Config.stream.maxClients, maxPayload: test1});

websocket.on('connection', ws => {

	console.log(websocket.clients);
	if(websocket.clients.lenght === Config.stream.maxClients){
		console.log('[STREAM-WS] New video client, but the server is full. Kicking client.');
		ws.terminate();
	}
	else {
		console.log('[STREAM-WS] New video client !');
		console.log('[STREAM-WS] Address:' + ws.upgradeReq.socket.remoteAddress);
		console.log('[STREAM-WS] Explorer:' + ws.upgradeReq.headers['user-agent']);
		//nbClients++;
	}
});

/*websocket.on('close', ws => {

	console.log("JE ME CASSE VOUS ME FAITES CHIER !");

});*/

/*websocket.on('disconnection',function(){
		console.log('[STREAM-WS] Client disconnected.');
		nbClients--;
});*/

websocket.broadcast = function(data) {
	websocket.clients.forEach(function each(client) {
			client.send(data);
	});
};

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
