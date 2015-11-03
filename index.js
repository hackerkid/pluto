var toxcore = require('toxcore');

// Create a default Tox instance

var tox = new toxcore.Tox({
  data: 'epic.tox',
  pass: 'passphrase'
});

//var tox = new toxcore.Tox();

var crypto = new toxcore.ToxEncryptSave();



tox.bootstrapSync('23.226.230.47', 33445, 'A09162D68618E742FFBCA1C2C70385E6679604B2D80EA6E84AD0996A1AC8A074'); // stal
tox.bootstrapSync('104.219.184.206', 443, '8CD087E31C67568103E8C2A28653337E90E6B8EDA0D765D57C6B5172B4F1F04C'); // Jfreegman

tox.setNameSync('Big Hero 6');
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


tox.on('message', function(e) {
  //var friendName = tox.getFriendNameSync(e.friend());
  console.log("normal " + e.message() + " " + e.messageType());

});

tox.on('friendMessage', function(e) {
  var friendName = tox.getFriendNameSync(e.friend());
  console.log(e.friend() + " " + e.message() + " " + e.messageType());

});


console.log('Address: ' + tox.getAddressHexSync());



// Start!
tox.start();