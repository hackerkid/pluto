/*
var express = require('express');
var app2 = express();
app2.use(express.static('public'));
app2.listen(8080);
*/

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
var crypto = new toxcore.ToxEncryptSave();
var fs = require('fs');

var usernames = {};
var numUsers = 0;

username = "epic";
fileName = username + ".tox";
//fs.exists(fileName, function(exists) {

    console.log(fileName);
/*
    if (exists) {
        tox = new toxcore.Tox({
            data: fileName,
            pass: 'ninjaisback'
        });

    } else {
        tox = new toxcore.Tox();
    }
    */
    
    console.log("hey");
    tox = new toxcore.Tox();

    tox.bootstrapSync('23.226.230.47', 33445, 'A09162D68618E742FFBCA1C2C70385E6679604B2D80EA6E84AD0996A1AC8A074'); // stal
    tox.bootstrapSync('104.219.184.206', 443, '8CD087E31C67568103E8C2A28653337E90E6B8EDA0D765D57C6B5172B4F1F04C'); // Jfreegman

    tox.setNameSync('Big Hero 6');
    tox.setStatusMessageSync('I am back!!');
    console.log('Address: ' + tox.getAddressHexSync());


            tox.on('friendMessage', function(e) {
                var friendName = tox.getFriendNameSync(e.friend());

                console.log(e.friend() + " " + e.message() + " " + e.messageType());

                socket.emit('new_message', {
                    username: friendName,
                    message: e.message()
                });


            });

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

/*
    io.on('connection', function(socket) {


        	var addedUser = false;
        	var username = "";

        	socket.emit('start');
            socket.emit('new_message', "check");

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

                socket.emit('new_message', {
                    username: friendName,
                    message: e.message()
                });


            });



    socket.username = username;
    usernames[username] = username;
    ++numUsers;
    addedUser = true;

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
});
*/
