function FirebaseStorage(settings, storage) {

	storage.sendMessage = sendMessage;
	storage.onMessage = onMessage;
	storage.getChat = getChat;
	storage.getUser = getUser;
	storage.saveUser = saveUser;
	storage.readLastMessage = readLastMessage;
	storage.upload = upload;

	// var firebase = storage.server.firebase || window.firebase;
	var messagesRef;
	var userRef;
	var storageRef = firebase.storage().ref();

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
		firebase.database().ref('users/' + settings.cid + '/lastMessage').update({read: true});
	}

	function upload(file, metadata, callback) {
		// Upload file and metadata to the object 'images/mountains.jpg'
		var uploadTask = storageRef.child('images/' + settings.uid + '/' + file.name).put(file, metadata);

		// Listen for state changes, errors, and completion of the upload.
		uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
			function(snapshot) {
				// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
				var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				console.log('Upload is ' + progress + '% done');
				switch (snapshot.state) {
					case firebase.storage.TaskState.PAUSED: // or 'paused'
						console.log('Upload is paused');
						break;
					case firebase.storage.TaskState.RUNNING: // or 'running'
						console.log('Upload is running');
						break;
				}
			}, function(error) {
				switch (error.code) {
					case 'storage/unauthorized':
						// User doesn't have permission to access the object
						console.error('User doesn\'t have permission to access the object');
						break;

					case 'storage/canceled':
						// User canceled the upload
						console.error('User cancelled upload');
						break;

					case 'storage/unknown':
						// Unknown error occurred, inspect error.serverResponse
						console.error('Unknown error ocured:');
						console.error(error.serverResponse);
						break;

					default:
						console.error('Unexpected and unhandeled error ocured:');
						console.error(error);
				}
			}, function(snapshot) {

				if(typeof(callback) === 'function') {
					callback(uploadTask.snapshot.downloadURL);
				}

			});
	}

}
