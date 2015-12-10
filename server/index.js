var config = require("./config");
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || config.PORT;
var hyperlog = require('hyperlog')
var lib = require('./lib');

//handles the express part for managing the user interface

server.listen(port, function() {
    console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname + '/public'));


var toxcore = require('toxcore');

// load already created profile from the file

var tox = new toxcore.Tox({
    data: config.PASS_FILE,
    pass: config.PASS_PHRASE
});

//uncomment this line if a new account should be created
//var tox = new toxcore.Tox();

function print(data) {
    console.log(data);
}


//fetch name from the hex-public-key of the friend
function fetch_name(x) {

    for (var i = 0; i < tox.getFriendListSizeSync(); i++) {
        if (tox.getFriendPublicKeyHexSync(i) == x) {
            return tox.getFriendNameSync(i);
        }
    }

    //return if no match found
    return "Aaron Swartz";

}


var crypto = new toxcore.ToxEncryptSave();

var friend;

tox.bootstrapSync('23.226.230.47', 33445, 'A09162D68618E742FFBCA1C2C70385E6679604B2D80EA6E84AD0996A1AC8A074'); // stal
tox.bootstrapSync('104.219.184.206', 443, '8CD087E31C67568103E8C2A28653337E90E6B8EDA0D765D57C6B5172B4F1F04C'); // Jfreegman

//set the Display name
tox.setNameSync(config.NAME);
//set the Status message
tox.setStatusMessageSync(config.STATUS);

//Get my public hex key
var myadd = tox.getAddressHexSync();
//obtain the shortened version
myadd = myadd.substring(0, 64);

//start the tox 
tox.start();

console.log('Address: ' + tox.getAddressHexSync());

//got a new friend request from a stranger
tox.on('friendRequest', function(e) {

    io.sockets.emit('new_message', 'hello');
    console.log('Friend request from: ' + e.publicKeyHex());
    //automatically accept the friend request
    tox.addFriendNoRequestSync(e.publicKey());
    //save the status
    tox.getSavedata(function(err, data) {

        if (!err) {
            crypto.encryptFile(config.PASS_FILE, data, config.PASS_PHRASE, function(err) {

                if (!err) {
                    // sucessfull stored

                } else {

                    console.error(err);

                }

            });
        } else console.error(err);
    });

});



// new message arrived from a friend
//e has ids => friend, message and messageType
tox.on('friendMessage', function(e) {

    var inp = e.message();

    //check whether the message is a vlid json file as pluto use json for communication

    if (lib.IsJsonString(inp)) {
        var request = JSON.parse(inp);

        // the friend is requesting the updates from the with the given senderId

        if (request.type == "request") {
            
            print("request for update recieved");
            var senderId = request.senderId;
            
            //the last messageId the friend has from senderId
            var lastId = request.lastMessageId;

            //fetch the messages after lastId of the person senderId and send back to the friend

            lib.fetch_updates(senderId, lastId, function(result) {
                tox.sendFriendMessageSync(e.friend(), result, 0);
            });

        } else {

            //got the requested updates
            if (request.type == "update") {
                var red = request;
                
                //send the message to the browser
                for (var i = 0; i < red.data.length; i++) {
                    io.sockets.emit('new_message', fetch_name(red.senderId), red.data[i].content);
                }
                
                console.log(JSON.stringify(request));

                //store the updates to the database
                lib.merge_the_new_update(JSON.stringify(request), function() {

                    //sucessfully stored  					
                });
            }
        }


    } else {
        //not a valid JSON file
    }




});

//browser started

io.on('connection', function(socket) {
    //recieved a new message from the browser
    socket.on('sendchat', function(data) {
        var obj = {};
        
        //get the last message id so that the message can be stored in the databse with lastId+1 
        lib.get_last_message_id(myadd, function(count) {
            obj.type = "message";
            var new_count = parseInt(count);
            new_count = new_count + 1;
            var newId = new_count.toString();
            obj.messageId = newId;
            obj.content = data;

            console.log(obj.messageId);

            var arr = new Array();
               
            //get the updates so that the new messages can be inserted and stored back (array)
            lib.updates.get(myadd, function(err, res) {
                if (err == 0) {
                    var old_updates = JSON.parse(res);
                    old_updates.push(obj);
                    var final_res = JSON.stringify(old_updates);

                    lib.set(myadd, final_res, function(err) {
                        if (err == 1) {
                            console.log("unable to save data");
                        }
                    });
                } else {
                    arr.push(obj);

                    lib.updates.put(myadd, final_res, function(err) {
                        if (err == 1) {
                             console.log("unable to save data");
                        }
                    })
                }
            });
               
            //time to update the lastId as the message is stored
            lib.set_last_id(myadd, new_count, function() {
                // console.log("last message id updated\n");
            });

        })

    });
    
    //need to send a new friend request
    socket.on('addFriends', function(address) {
        //message does not matter as of now
        var message = "PLUTO: NEW FRIEND REQUEST";
        tox.addFriend(address, message, function() {
            console.log("Friend request send to " + address);
        });
    });
});


//get the count of friends
var count = tox.getFriendListSizeSync();

//periodically requests of updates from friends would be send
setInterval(function() {
    tox.getSavedata(function(err, data) {

        if (!err) {
            crypto.encryptFile(config.PASS_FILE, data, 'ninjaisback', function(err) {
                if (!err) {
                    //sucessfully saved
                } else console.error(err);
            });
        } else console.error(err);
    });

    for (var i = 0; i < count; i++) {
        //check whether the friend is online or not
        var status = tox.getFriendConnectionStatusSync(i);


        //friend is online and available for information exchange
        if (status == 2) {

            for (var j = 0; j < count; j++) {
                var address2 = tox.getFriendPublicKeyHexSync(j);

                lib.create_request(address2, i, status, function(req, sendTo, statusTo) {
                    var final_request = req;
                    
                    if ((statusTo == 2)) { 
                        tox.sendFriendMessageSync(sendTo, final_request, 0);
                    }
                });

            }
        }


    }

}, 60 * 100)

