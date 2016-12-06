
function IASChat(config) {

	// ALSO ADD CHAT SETTINGS TO CONFIG

	var uid = config.uid;
	var cid = config.cid || config.uid;
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

	var messagesRef = firebase.database().ref('messages/' + cid);

	// Listen event submit
	show.addEventListener('click', showIAS.bind(this));
	close.addEventListener('click', hideIAS.bind(this));
	form.addEventListener('submit', saveMessage.bind(this));

	// Listen message changes
	messagesRef.on('child_added', receiveMessage);


	/* ### Interface ### */

	function printInterface(text, received) {
		// Compressed version of chat.html turned to string
		var ias = '<div id="ias"><div id="ias_topbar"><div id="ias_topbar-pic"><img src="https://s3.amazonaws.com/uifaces/faces/twitter/brad_frost/128.jpg"></div><div id="ias_topbar-text">Support</div><div id="ias_topbar-close">X</div></div><div id="ias_messages"></div><div id="ias_write"><form id="ias_write-form"><input type="text" /><button type="submit">SEND</button></form></div></div>';
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

	function clearForm() {
		form.children[0].value = '';
	}

	function pushMessage(text) {
		firebase.database().ref('messages/' + cid).push({
			uid: uid,
			text: text,
			timestamp: new Date().getTime()
		});
	}

	function receiveMessage(data) {
		var key = data.key;
		var message = data.val();

		if(message.uid === uid) {
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

