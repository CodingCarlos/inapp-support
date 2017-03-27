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

function Storage(iasSettings, props) {

	var settings = iasSettings;
	var constructor = {
		sendMessage: null,
		onMessage: null,
		getChat: null,
		getUser: null,
		saveUser: null,
		upload: null,
		storage: 'firebase'
	};
	
	if(typeof props !== 'undefined') {

		/* Storage types */
		var types = ['firebase', 'ecserver'];

		if(typeof props.type !== 'undefined' && types.indexOf(props.type.toLowerCase()) !== -1) {
			constructor.type = props.type.toLowerCase();
		}
	}

	connect();

	return constructor;


	/* Internal functions */

	function connect() {

		switch(constructor.type) {

			case 'firebase':
				// Load firebase constructor
				constructor = FirebaseStorage(settings, constructor);
				break;

			case 'ecserver':
				// Load ecServer constructor
				console.warn('EcServer not integrated yet T_T');
				break;

			default:
				console.error('Unexpected storage type ' + constructor.type + '. Currently, only firebase and ecserver are integrated');
		}

	}

}