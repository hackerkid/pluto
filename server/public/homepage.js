var socket = io.connect('http://localhost:8080');
    
    // on connection to server, ask for user's name with an anonymous callback

    var userId = "epic";
    /*
    socket.on('start', function(){
        // call the server-side function 'adduser' and send one parameter (value of prompt)
        
        console.log("here");
        socket.emit('add_user', userId);
    });
*/

    // listener, whenever the server emits 'updatechat', this updates the chat body
    socket.on('new_message', function (username, data) {
        //$('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');

        var mem = '<div class="demo-card-wide mdl-card mdl-shadow--2dp"><div class="mdl-card__title"><h2 class="mdl-card__title-text">' + username + '  </h2></div><div class="mdl-card__supporting-text"> ' + data + '</div></div> <br>';
        
        $('#conversation').append(mem);
        

    });
    
    
    // on load of page
    


$("document").ready(function () {
    $(function(){
        // when the client clicks SEND
        $('#datasend').click( function() {
            var message = $('#data').val();
            $('#data').val('');
            // tell server to execute 'sendchat' and send along one parameter
            socket.emit('sendchat', message);
            //io.emit('sendchat', message);
        });
        // when the client hits ENTER on their keyboard
        $('#data').keypress(function(e) {
            if(e.which == 13) {
                $(this).blur();
                $('#datasend').focus().click();
            }
        });
    });


// handles the friend request part
    $('#fixed-header-drawer-exp').bind("enterKey", function(e) {
            var search_input = $("#fixed-header-drawer-exp").val()
            alert("Friend Request Send");
            socket.emit('addFriends', search_input);
        
    });

//handles the friend request part
    $('#fixed-header-drawer-exp').keyup(function(e) {
        if (e.keyCode == 13) {
            $(this).trigger("enterKey");
        }
    });

});


