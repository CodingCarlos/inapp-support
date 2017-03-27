function FirebaseStorage(settings, storage) {

	storage.sendMessage = sendMessage;
	storage.onMessage = onMessage;
	storage.getChat = getChat;
	storage.saveUser = saveUser;

	// var firebase = storage.server.firebase || window.firebase;

	return storage;


	/* Internal functions */

	function sendMessage(msg) {

		firebase.database().ref('messages/' + settings.cid).push(msg);

		firebase.database().ref('users/' + settings.cid).once('value').then(function(snapshot) {		
			
			var userLastMsg = msg;
			userLastMsg.read = false;

			if(!snapshot.val()) {
				// Add user
				firebase.database().ref('users/' + settings.cid).set({
					name: name,
					pic: pic,
					isSupporter: false,
					supporter: -1,
					lastMessage: userLastMsg
				});
			} else {
				firebase.database().ref('users/' + settings.cid).update({lastMessage: userLastMsg});
				if(!snapshot.val().profile) {
					generateUserData(settings.cid);
				}
			}
		});
	}

	function onMessage() {
		console.warn('Not ready');
	}

	function getChat() {
		console.warn('Not ready');
	}

	function getUser() {
		console.warn('Not ready');
	}

	function saveUser() {
		console.warn('Not ready');
	}

}
