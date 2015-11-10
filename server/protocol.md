#Pluto Protocoal


##Requests

##Request For Friend Update

{"type":"request","senderId":"0459216ea1b0577e327a14dc4093befeaac4bc45a56c81ddc089b2a661adf30c", "lastMessageId": "id of the last mesage"}

##Send back update

{"type":"update","senderId":"0459216ea1b0577e327a14dc4093befeaac4bc45a56c81ddc089b2a661adf30cis", "data": JSON Updates}

##Updates format
{"type":"message", "messageID": "id of the message", "content": "content of the message"}


##Functions

* function get_last_message_id(id, callback)
* function merge_the_new_update(update)
* function fetch_updates(senderId, lastId, callback)
* function create_request(senderId, callback)





