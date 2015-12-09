var config = require("./config");
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || config.PORT;
var hyperlog = require('hyperlog')
var lib = require('./lib');


// console.log(config.PASS_PHRASE);
server.listen(port, function() {
    // console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));


var toxcore = require('toxcore');

// Create a default Tox instance
var tox = new toxcore.Tox({
  data: 'epic.tox',
  pass: config.PASS_PHRASE
});

//var tox = new toxcore.Tox();

function fetch_name(x)
{
  
  for (var i = 0; i <  tox.getFriendListSizeSync(); i++) {
    if(tox.getFriendPublicKeyHexSync(i) == x) {
      return tox.getFriendNameSync(i);
    }
  }

  return "aaron paul";

}


var crypto = new toxcore.ToxEncryptSave();

var friend;

tox.bootstrapSync('23.226.230.47', 33445, 'A09162D68618E742FFBCA1C2C70385E6679604B2D80EA6E84AD0996A1AC8A074'); // stal
tox.bootstrapSync('104.219.184.206', 443, '8CD087E31C67568103E8C2A28653337E90E6B8EDA0D765D57C6B5172B4F1F04C'); // Jfreegman

tox.setNameSync(config.NAME);
tox.setStatusMessageSync(config.STATUS);

var myadd = tox.getAddressHexSync();
myadd = myadd.substring(0, 64);



tox.on('friendRequest', function(e) {
  io.sockets.emit('new_message', 'hello');
   console.log('Friend request from: ' + e.publicKeyHex());
 
  	tox.addFriendNoRequestSync(e.publicKey());

    tox.getSavedata(function(err, data) {
    
    if (!err) {
      crypto.encryptFile('epic.tox', data, 'ninjaisback', function(err) {
        
        if (!err) {
          // console.log('Success!');

        }
        else { 
          
          console.error(err);
        
        }

        });
      } else console.error(err);
    });


    // console.log("Friend request accepted");

});




tox.on('friendMessage', function(e) {
  	
  	var friendName = tox.getFriendNameSync(e.friend());
  	//// console.log(e.friend() + " MESSAGE " + e.message() + " " + e.messageType());
  	friend = e.friend();
  	// console.log(friend);

  	// console.log("messaeg arrived\n");

  	var inp = e.message();
  	
  	if(lib.IsJsonString(inp)) {
  		var request = JSON.parse(inp);

  		//// console.log("REQUEST IS " + inp);


  		if(request.type == "request") {
  			// console.log("deteceted !!!!! request");
  			senderId = request.senderId;
  			lastId = request.lastMessageId;
  			//// console.log(senderId.length);
  			//// console.log(myadd.length);
  			if(senderId == myadd) {
  				// console.log("request for me");
  			}
  			lib.fetch_updates(senderId, lastId, function(result) {
  			//	 // console.log("here we go the reqested info||||" + result);
  			//	 // console.log("sending to " + friendName);
  				 tox.sendFriendMessageSync(e.friend(), result, 0);
  			});

  		}

  		else {
  			if(request.type == "update") {
  				var red = request;

  				for(var i = 0; i < red.data.length; i++) {
  						io.sockets.emit('new_message', fetch_name(red.senderId), red.data[i].content);
  						 console.log("logging " + red.data[i].content);
  				}

  				// console.log("update recieved	");
  				lib.merge_the_new_update(JSON.stringify(request), function() {
  					//// console.log("done");
  					
  				});
  			}
  		}

  
  	}

  	else {
  		// console.log("TESTING " + inp);
  	}

  
    

});

io.on('connection', function(socket) {
    

    socket.on('sendchat', function(data) {
       

    var obj = {};

// {"type":"message", "messageId": "id of the message", "content": "content of the message"}

   
   	lib.get_last_message_id(myadd, function(count) {
    	obj.type = "message";
    	var temp =  parseInt(count);

    	obj.messageId =  parseInt(temp) + 1;
    	obj.content = data;

      console.log(obj.messageId);

    	var arr = new Array();

    	lib.updates.get(myadd, function(err, res) {
	    	if(err == 0) {
    			var old_updates = JSON.parse(res);
    			old_updates.push(obj);
    			var final_res = JSON.stringify(old_updates);

    			lib.set(myadd, final_res, function(err) {
    				if(err == 1) {
    					// console.log("unable to save data");
    				}
    			});
    		}

    		else {
    			arr.push(obj);
    			var final_res = JSON.stringify(arr);
    			lib.updates.put(myadd, final_res, function(err) {
    				if(err == 1) {
    					// console.log("unable to save data");
    				}
    			})
    		}
    	});

    	lib.set_last_id(myadd, 	count + 1, function() {
    		// console.log("last message id updated\n");
    	});

   	})

   
    //// console.log(data);




    });

    socket.on('addFriends', function (address) {
    	message = "epic";
    	// console.log("friend going to be added" + address + message);
    	tox.addFriend(address, message, function() {
    		 console.log("friend request going to be send to " + address);
    	});
    });
});

var count = 0;

var count = tox.getFriendListSizeSync();



//// console.log("count is "+ count);

 console.log('Address: ' + tox.getAddressHexSync());



setInterval(function () {
  tox.getSavedata(function(err, data) {
    
    if (!err) {
      crypto.encryptFile('epic.tox', data, 'ninjaisback', function(err) {
         if (!err) {
          //console.log('Success!');
        } 
          else console.error(err);
        });
      } else console.error(err);
    });


  	
  	//// console.log(count);
  	for (var i = 0; i < count; i++) {
		
		
		// console.log("time for " + i);

		message = "hey guys";
		
		var address = tox.getFriendPublicKeyHexSync(i);
		var name = tox.getFriendNameSync(i);
		var status = tox.getFriendConnectionStatusSync(i);
		
		
		
		if(status == 2) {

			var person = {firstName:"John", lastName:"Doe", age:46};
			var per = JSON.stringify(person);

			//tox.sendFriendMessageSync(i, "hello hello", 0);


			//tox.sendFriendMessageSync(i, per, 0);

			for (var j = 0; j < count; j++) {
				var address2 = tox.getFriendPublicKeyHexSync(j);
				
				lib.create_request(address2,  i,status, function(req, sendTo, statusTo) {
					//// console.log(req);
					//var final_request = JSON.stringify(req);
					//// console.log("the request is " + final_request);
					
					var final_request = req;
		            //// console.log(" i is " + sendTo);

					//var status = tox.getFriendConnectionStatusSync(i);
					//// console.log("status is " + statusTo);
					if((statusTo == 2)) {

						// console.log(" sendTo is " + sendTo);
						tox.sendFriendMessageSync(sendTo, final_request, 0);
					}
				});

			}
		}


	}

}, 60 * 100)



tox.start();

lib.updates.get(myadd, function(err, data) {
	// console.log(data);
	//// console.log(JSON.stringify(data));
})
