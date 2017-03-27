function FirebaseStorage(settings, storage) {

	storage.sendMessage = sendMessage;
	storage.onMessage = onMessage;
	storage.getChat = getChat;
	storage.getUser = getUser;
	storage.saveUser = saveUser;
	storage.readLastMessage = readLastMessage;

	// var firebase = storage.server.firebase || window.firebase;
	var messagesRef;
	var userRef;

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

	function onMessage(callback) {
		if(typeof(messagesRef) !== 'undefined') {
			messagesRef.off();
		}
		messagesRef = firebase.database().ref('messages/' + settings.cid);
		messagesRef.on('child_added', function(data) {
			if(typeof(callback) === 'function') {
				callback(data.val(), data.key);
			}
		});
	}

	function getChat() {
		console.warn('Not ready');
	}

	function getUser(callback) {
		userRef = firebase.database().ref('users/' + settings.cid);
		userRef.on('value', function(data) {
			if(typeof(callback) === 'function') {
				callback(data.val(), data.key);
			}
		});
	}

	function saveUser() {
		console.warn('Not ready');
	}

	function readLastMessage() {
		// console.warn('Not ready');
		firebase.database().ref('users/' + settings.cid + '/lastMessage').update({read: true});
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
		readLastMessage: null,
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