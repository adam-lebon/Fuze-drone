var app = require('./webserver.js');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pwm = require('./pwm.js');

http.listen(3000);


io.on('connection', function(socket){
  console.log("New user");
  socket.emit('setValue', pwm.channels);

  socket.on('newValue', function(data){
    pwm.channels = data;
    io.emit('setValue', pwm.channels);
    pwm.update(pwm.channels);
  });

});
