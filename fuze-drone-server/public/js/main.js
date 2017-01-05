var channels = [
  1500,
  1500,
  1500,
  1500
];


var sliders = [
  $("#control1").slider({
  	reversed : true
  }).on('slide', function(slider){
    channels[0] = slider.value;
    update();
  }),

  $("#control2").slider({
  	reversed : true
  }).on('slide', function(slider){
    channels[1] = slider.value;
    update();
  }),

  $("#control3").slider({
  	reversed : true
  }).on('slide', function(slider){
    channels[2] = slider.value;
    update();
  }),

  $("#control4").slider({
  	reversed : true
  }).on('slide', function(slider){
    channels[3] = slider.value;
    update();
  })
];


function update(){
  socket.emit('newValue', channels);
}

var socket = io();

socket.on('setValue', function(data){
  channels = data;
  for (var i = 0; i < sliders.length; i++) {
    sliders[i].slider('setValue', channels[i]);
  }
});
