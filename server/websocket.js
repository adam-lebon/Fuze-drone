var app = require('./webserver.js');
var http = require('http').Server(app);
var io = require('socket.io')(http);


http.listen(3000);


var channels = [
  1500,
  1500,
  1500,
  1500
];

io.on('connection', function(socket){
  console.log("New user");
  socket.emit('setValue', channels);

  socket.on('newValue', function(data){
    console.log('new value');
    channels = data;
    io.emit('setValue', channels);
  });

});
