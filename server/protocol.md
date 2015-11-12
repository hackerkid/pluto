#Pluto Protocol

> Implementation details is coming soon. For now refer the code. 

##Requests

##Request For Friend Update

{"type":"request","senderId":"0459216ea1b0577e327a14dc4093befeaac4bc45a56c81ddc089b2a661adf30c", "lastMessageId": "id of the last mesage"}

##Send back updates

{"type":"update","senderId":"0459216ea1b0577e327a14dc4093befeaac4bc45a56c81ddc089b2a661adf30c", "data": JSON Updates as described below}

##Updates format
{"type":"message", "messageId": "id of the message", "content": "content of the message"}


##Functions

* function get_last_message_id(id, callback)
* function set_last_id(id,lastId, callback)
* function merge_the_new_update(update)
* function fetch_updates(senderId, lastId, callback)
* function create_request(senderId, callback)





