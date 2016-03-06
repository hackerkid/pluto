var levelup = require('levelup')
var db = levelup('./lastId')
var updates = levelup('./updates')

function print(x)
{
	 console.log(x);
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
			 print("Unable to write to disk");
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
				var maxId = -1;

				for (var i = 0; i < obj.data.length; i++) {
					if(maxId < obj.data[i].messageId) {
						maxId = obj.data[i].messageId;
					}
				}


				if(maxId != -1 && obj.data.length != 0) {
					
					set_last_id(id, maxId, function() {
					

						updates.put(id, JSON.stringify(obj.data), function(err) {
							
							if(err) {
								return // console.log("oops something went wrong while saving", err);
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

						if(lastId < obj.data[i].messageId) {
							if(maxId < obj.data[i].messageId) {
								maxId = obj.data[i].messageId;
							}

							data.push(obj.data[i]);
						}

						if(maxId != -1 && maxId > lastId) {
							set_last_id(id, maxId, function() {
							})
						}
					}

					var str = JSON.stringify(data);


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



function fetch_updates(senderId, lastId, callback)
{	
	var obj = new Array();
	var final_res = {}
	
	final_res.type = "update";
	final_res.senderId = senderId;
	final_res.data = obj;


	updates.get(senderId, function(err, res) {


		if(err) {

			res = JSON.stringify(obj);
			callback(res);

		}
		else {
			data = JSON.parse(res);

			for (var i = 0; i < data.length; i++) {
				if(parseInt(data[i].messageId) > parseInt(lastId)) {
					
					print("satsified ")
					obj.push(data[i]);
				}
			}

			final_res.data = obj;


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
