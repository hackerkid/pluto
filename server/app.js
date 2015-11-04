var app = require('http').createServer()
var io = require('socket.io')(app);

var express = require('express');
var app2 = express();
app2.use(express.static('public'));
app2.listen(8080);

var toxcore = require('toxcore');
var crypto = new toxcore.ToxEncryptSave();
var fs = require('fs');

var usernames = {};
var numUsers = 0;

io.on('connection', function(socket) {
    

    var addedUser = false;



	socket.emit('start');    
    socket.on('add_user', function(username) {
    	console.log("hey");

        fileName = username + ".tox";
        fs.exists(fileName, function(exists) {
            if (exists) {
                tox = new toxcore.Tox({
                    data: fileName,
                    pass: 'ninjaisback'
                });
            } else {
                tox = new toxcore.Tox();
            }


        	tox.bootstrapSync('23.226.230.47', 33445, 'A09162D68618E742FFBCA1C2C70385E6679604B2D80EA6E84AD0996A1AC8A074'); // stal
			tox.bootstrapSync('104.219.184.206', 443, '8CD087E31C67568103E8C2A28653337E90E6B8EDA0D765D57C6B5172B4F1F04C'); // Jfreegman

			tox.setNameSync(username);
			tox.setStatusMessageSync('I am back!!');

			tox.on('friendRequest', function(e) {

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

       		socket.broadcast.emit('new_message', {
            	username: friendName,
            	message: e.message()
       	 	});


    	});

        });

		socket.username = username;
        usernames[username] = username;
        ++numUsers;
        addedUser = true;
        
        socket.emit('login', {
            numUsers: numUsers
        });
        
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    socket.on('typing', function() {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    socket.on('stop typing', function() {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    socket.on('disconnect', function() {
        if (addedUser) {
            delete usernames[socket.username];
            --numUsers;

            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});

