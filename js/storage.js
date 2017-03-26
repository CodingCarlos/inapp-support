var Storage = function Storage(props) {

	var constructor = {
		sendMessage: sendMessage,
		onMessage: onMessage,
		getChat: getChat,
		getUser: getUser,
		upsertUser: saveUser,
		insertUser: saveUser,	// For user comodity, but unnecessary
		updateUser: saveUser,	// For user comodity, but unnecessary
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
		console.warn('Not ready');
	}


	function sendMessage() {
		console.warn('Not ready');
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

};

exports Storage;