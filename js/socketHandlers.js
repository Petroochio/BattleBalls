me.canvas = document.querySelector('#area');
me.ctx = me.canvas.getContext('2d');
me.ctx.lineWidth = 5;
me.arena = game.createArena('white', /*230*/me.canvas.height/2-10, me.canvas.width/2, me.canvas.height/2);

//Set up socket events --Ha Andrew don't look at this --You can't stop me
socket.on('player join', function(data){
  var x = me.canvas.width/2, y = me.canvas.height/2;
  me.players[data.id] = new game.Player(data.id, data.color, x, y);
  me.playerIDs.push(data.id);
});

socket.on('player leave', function(data){
  me.playerIDs.splice(me.playerIDs.indexOf(data.id),1);
  delete me.players[data.id];
});

socket.on('charge start', function(data){
  me.players[data.id].beginCharge();
});

socket.on('charge end', function(data){
  me.players[data.id].endCharge();
});

socket.on('phone tilt', function(data) {
  if(me.players[data.id]) {
    me.players[data.id].updateAcceleration(data.yAcc/300, -data.xAcc/300);
  } //my eyes are everywhere --I will gouge your eyes out
});