// (function(){ 

function IASChat() {

	var show = document.getElementById('ias-show');
	var ias = document.getElementById('ias');
	var close = document.getElementById('ias_topbar-close');
	var form = document.getElementById('ias_write-form');
	var messages = document.getElementById('ias_messages');
	var messagesRef = firebase.database().ref('messages');

	// Listen event submit
	show.addEventListener('click', showIAS.bind(this));
	close.addEventListener('click', hideIAS.bind(this));
	form.addEventListener('submit', saveMessage.bind(this));

	// Listen message changes
	messagesRef.on('child_added', receiveMessage);


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
		firebase.database().ref('messages').push({
			username: 'paco',
			text: text
		});
	}

	function receiveMessage(data) {
		var key = data.key;
		var message = data.val();

		if(message.username == 'paco') {
			printMessage(message.text);
		} else {
			printMessage(message.text, true);
		}
	}


	/* #### Visivility #### */

	function showIAS(e) {
		e.preventDefault();

		console.log('show');

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


// })();


window.onload = function() {
  window.IASChat = new IASChat();
};
