
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

	/* ### Set chat properties ### */

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
		var ias = '<div id="ias" class="hidden"><div id="ias_topbar"><div id="ias_topbar-pic"><img src="https://s3.amazonaws.com/uifaces/faces/twitter/brad_frost/128.jpg"></div><div id="ias_topbar-text">Support</div><div id="ias_topbar-close"><svg xmlns="http://www.w3.org/2000/svg" fill="#fff" height="24" viewBox="0 0 24 24" width="24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg></div></div><div id="ias_messages"></div><div id="ias_write"><form id="ias_write-form"><input type="text" /><button type="submit"><svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="24" viewBox="0 0 24 24" width="24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/><path d="M0 0h24v24H0z" fill="none"/></svg></button></form></div></div>';
		
		// If shall show button, add it to interface
		if(button) {
			ias += '<div id="ias-show"><svg xmlns="http://www.w3.org/2000/svg" fill="#fff" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 16h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 11.9 13 12.5 13 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg></div>';
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
		var span = document.createElement('span');
			span.innerHTML = text;

		message.appendChild(span)
		messages.appendChild(message);

		scrollDown();
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

	function scrollDown() {
		messages.scrollTop = messages.scrollHeight;
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

