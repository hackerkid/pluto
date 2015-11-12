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

function merge_the_new_update(update)
{
	var obj = JSON.parse(update);
	var id = obj.senderId;

	updates.get(id, function(err, res) {
			
		// insert the new update directly as nothing is present already
		data = JSON.parse(res);

		if(err) {
			updates.put(id, update, function(err) {
				if(err) {
					return console.log("oops something went wrong while saving", err);
				}
			});
		}
		// append to the already present array
		else {
			for (var i = 0; i < obj.length; i++) {
				data.push(update[i]);
			}

			var str = JSON.stringify(data);

			updates.put(id, str, function(err) {
				if(err) {
					return console.log("oops something went wrong while saving", err);
				}
			});
		}

	});
}


function fetch_updates(senderId, lastId, callback)
{	
	var obj = new Array();

	console.log(senderId + " ========= " + lastId);

	updates.get(senderId, function(err, res) {
		if(err) {
			print("error");
			res = JSON.stringify(obj);
			callback(res);
		}
		else {
			data = JSON.parse(res);
			for (var i = 0; i < data.length; i++) {
				if(data[i].messageId > lastId) {
					obj.push(data[i]);
				}
			}


			var result = JSON.stringify(obj);
			callback(result);
		}


	});
}

function create_request(senderId, callback)
{
	var obj = {};

	obj.type = "request";
	obj.senderId = senderId;
	get_last_message_id(senderId, function(data) {
		obj.lastMessageId = data;	
		var result = JSON.stringify(obj);
		callback(result);	
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
	updates: updates
}