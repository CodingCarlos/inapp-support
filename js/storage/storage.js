function Storage(iasSettings) {

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

		if(typeof iasSettings.storageType !== 'undefined' && types.indexOf(iasSettings.storageType.toLowerCase()) !== -1) {
			constructor.type = iasSettings.storageType.toLowerCase();
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