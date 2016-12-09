
function IASChat(config) {

	// ALSO ADD CHAT SETTINGS TO CONFIG
	var cid;
	var uid;
	var name;
	var button = config.button || false;
	var topbarBg = config.topbarBg || '#ff9800';
	var topbarColor = config.topbarColor || '#fff';

	// Prepare interface
	printInterface();

	// Prepare listeners
	var show = document.getElementById('ias-show');
	var ias = document.getElementById('ias');
	var close = document.getElementById('ias_topbar-close');
	var form = document.getElementById('ias_write-form');
	var messages = document.getElementById('ias_messages');

	var messagesRef;

	// Listen event submit
	if(show) {
		show.addEventListener('click', showIAS.bind(this));
	} else if(button) {
		console.warn('Coud not initializate listener for the button to open chat.');
	}
	close.addEventListener('click', hideIAS.bind(this));
	form.addEventListener('submit', saveMessage.bind(this));
	
	// Set user
	setUser(config);

	return {
		setUser: setUser,
		open: showIAS
	}

	/**/
	function setUser(config) {
		uid = config.uid;
		cid = config.cid || config.uid;
		name = config.name || '';

		clearMessages();

		if(typeof(messagesRef) !== 'undefined') {
			messagesRef.off();
		}
		messagesRef = firebase.database().ref('messages/' + cid);
		messagesRef.on('child_added', receiveMessage);
	}


	/* ### Interface ### */

	function printInterface(text, received) {
		// Compressed version of chat.html turned to string
		var ias = '<div id="ias" class="hidden"><div id="ias_topbar"><div id="ias_topbar-pic"><img src="https://s3.amazonaws.com/uifaces/faces/twitter/brad_frost/128.jpg"></div><div id="ias_topbar-text">Support</div><div id="ias_topbar-close"><img src="img/close.png"></div></div><div id="ias_messages"></div><div id="ias_write"><form id="ias_write-form"><input type="text" /><button type="submit"><img src="img/send.png"></button></form></div></div>';
	  	
		// If shall show button, add it to interface
		if(button) {
			ias += '<div id="ias-show"><img src="img/help.png"></div>';
		}

	  	document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeend', ias);
	}


	/* #### Messages #### */

	function saveMessage(e) {
		e.preventDefault();

		var text = e.srcElement.children[0].value

		if(text === '') {
			console.log('tried to send empty form. Rejected.');
			return false;
		}

		// printMessage(text);
		pushMessage(text);

		clearForm();
	}

	function printMessage(text, received) {

		var classes = 'ias_message';

		if(received === true) {
			classes += ' ias_message-received';
		} else {
			classes += ' ias_message-sent';
		}

	  	var message = document.createElement('div');
			message.className = classes;
			message.innerHTML = text;

		messages.appendChild(message)
	}

	function clearMessages() {

		while (messages.firstChild) {
			messages.removeChild(messages.firstChild);
		}
	}

	function clearForm() {
		form.children[0].value = '';
	}

	function pushMessage(text) {
		var msg = {
			uid: uid,
			text: text,
			timestamp: new Date().getTime(),
			reverseTimestamp: 0 - Number(new Date().getTime())
		};

		firebase.database().ref('messages/' + cid).push(msg);

		firebase.database().ref('users/' + cid).once('value').then(function(snapshot) {		
			if(!snapshot.val()) {
				// Add user
				firebase.database().ref('users/' + cid).set({
					name: name,
					isSupporter: false,
					supporter: -1,
					lastMessage: msg
				});
			} else {
				firebase.database().ref('users/' + cid).update({lastMessage: msg});
			}
		});
	}

	function receiveMessage(data) {
		var key = data.key;
		var message = data.val();

		if(message.uid == uid) {
			printMessage(message.text);
		} else {
			printMessage(message.text, true);
		}
	}

	/* #### Visivility #### */

	function showIAS(e) {
		e.preventDefault();

		if (ias.classList) {
			ias.classList.remove('hidden');
		} else {
			ias.className = ias.className.replace(new RegExp('(^|\\b)' + 'hidden'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
	}

	function hideIAS(e) {
		e.preventDefault();
		
		if (ias.classList) {
			ias.classList.add('hidden');
		} else {
			ias.className += ' ' + 'hidden';
		}
	}
}

