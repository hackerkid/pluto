var levelup = require('levelup')
var db = levelup('./lastId')
var updates = levelup('./updates')

function print(x)
{
	// console.log(x);
}

function get_last_message_id(id, callback)
{
	db.get(id, function(err, ans) {
		
		if(err) {
			callback(0);
		}

		else {

			callback(ans);
		}
	})

}

function set_last_id(id,lastId, callback)
{
	db.put(id, lastId, function(err) {
		if(err) {
			// print("Unable to write to disk");
		}

		callback();

	})
}

function merge_the_new_update(update)
{
	var obj = JSON.parse(update);
	var id = obj.senderId;

	

	get_last_message_id(id, function(lastId) {

		updates.get(id, function(err, res) {
			
			// insert the new update directly as nothing is present already
			

			if(err) {	
				//// console.log("first");
				//// console.log(obj.data);
				var maxId = -1;

				// print(obj.data.length);
				for (var i = 0; i < obj.data.length; i++) {
					if(maxId < obj.data[i].messageId) {
						maxId = obj.data[i].messageId;
					}
				}

				// print(maxId);

				if(maxId != -1 && obj.data.length != 0) {
					
					set_last_id(id, maxId, function() {
					
						// console.log("set the maxid when nothing was present");
					
						updates.put(id, JSON.stringify(obj.data), function(err) {
							
							if(err) {
								return // console.log("oops something went wrong while saving", err);
							}

							else {
								// print("sucess");
							}
						});
					})
				}
			}


				
			
			// append to the already present array
			else {

				var maxId = -1;
				data = JSON.parse(res);


				get_last_message_id(id, function(lastId) {

					for (var i = 0; i < obj.data.length; i++) {
						// print("id is "+ obj.data[i].messageId)
						
						if(lastId < obj.data[i].messageId) {
							// print("here");	
							if(maxId < obj.data[i].messageId) {
								// print("i am in");
								maxId = obj.data[i].messageId;
								// print("mad max is now " + maxId);
							}

							data.push(obj.data[i]);
						}

						if(maxId != -1 && maxId > lastId) {
							set_last_id(id, maxId, function() {
								// print("maxid is set to "+ maxId);
							})
						}
					}

					var str = JSON.stringify(data);

					// print(str);

					updates.put(id, str, function(err) {	
						if(err) {
							return // console.log("oops something went wrong while saving", err);
						}
					});


				});
			}

		});
	});

}



// tested
function fetch_updates(senderId, lastId, callback)
{	
	var obj = new Array();
	var final_res = {}
	
	final_res.type = "update";
	final_res.senderId = senderId;
	final_res.data = obj;

	// console.log("here here here ");
	
	updates.get(senderId, function(err, res) {
		//print("senderid is " + senderId + "lastid is " + lastId);

		//// console.log(res);

		if(err) {
			// print("error");

			res = JSON.stringify(obj);
			callback(res);

		}
		else {
			data = JSON.parse(res);

			//print(data.length);
			for (var i = 0; i < data.length; i++) {
				if(parseInt(data[i].messageId) > parseInt(lastId)) {
					
					print("satsified ")
					obj.push(data[i]);
				}
			}

			final_res.data = obj;

			//print("after filter ");
			//// console.log( final_res);

			var result = JSON.stringify(final_res);
			callback(result);
		}


	});
}

function create_request(senderId, sendTo, status, callback)
{
	var obj = {};

	obj.type = "request";
	obj.senderId = senderId;
	get_last_message_id(senderId, function(data) {
		obj.lastMessageId = data;	
		var result = JSON.stringify(obj);
		callback(result, sendTo, status);	
	});

	
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


module.exports = {
	create_request: create_request,
	get_last_message_id: get_last_message_id, 
	merge_the_new_update: merge_the_new_update,
	fetch_updates: fetch_updates,
	IsJsonString: IsJsonString, 
	updates: updates,
	db : db,
	set_last_id: set_last_id
}