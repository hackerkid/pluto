
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;

server.listen(port, function() {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));


var toxcore = require('toxcore');

// Create a default Tox instance
var tox = new toxcore.Tox({
  data: 'epic.tox',
  pass: 'ninjaisback'
});

//var tox = new toxcore.Tox();

var crypto = new toxcore.ToxEncryptSave();

var friend;

tox.bootstrapSync('23.226.230.47', 33445, 'A09162D68618E742FFBCA1C2C70385E6679604B2D80EA6E84AD0996A1AC8A074'); // stal
tox.bootstrapSync('104.219.184.206', 443, '8CD087E31C67568103E8C2A28653337E90E6B8EDA0D765D57C6B5172B4F1F04C'); // Jfreegman

tox.setNameSync('Big Hero 6');
tox.setStatusMessageSync('I am back!!');




io.sockets.on('sendchat', function(data) {
    tox.sendFriendMessageSync(friend, data, 0);
    console.log(data);
})

tox.on('friendRequest', function(e) {
  io.sockets.emit('new_message', 'hello');
  console.log('Friend request from: ' + e.publicKeyHex());
 
  	tox.addFriendNoRequestSync(e.publicKey());

    tox.getSavedata(function(err, data) {
    
    if (!err) {
      crypto.encryptFile('epic.tox', data, 'ninjaisback', function(err) {
        if (!err) console.log('Success!');
          else console.error(err);
        });
      } else console.error(err);
    });


    console.log("Friend request accepted");

});



tox.on('friendMessage', function(e) {
  var friendName = tox.getFriendNameSync(e.friend());
  console.log(e.friend() + " " + e.message() + " " + e.messageType());
  friend = e.friend();
  console.log(friend);
  io.sockets.emit('new_message', friendName, e.message());

});

io.on('connection', function(socket) {
    
    socket.on('sendchat', function(data) {
       tox.sendFriendMessageSync(0, data, 0);
    	console.log(data);
    });

    socket.on('addFriends', function (address) {
    	message = "epic";
    	console.log("friend going to be added" + address + message);
    	tox.addFriend(address, message, function() {
    		console.log("friend added");
    	});
    });
});

var count = tox.getFriendListSizeSync();
console.log("count is "+ count);

console.log('Address: ' + tox.getAddressHexSync());



// Start!
tox.start();