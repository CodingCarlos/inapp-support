// (function(){ 

function IASChat() {

	var form = document.getElementById('ias_write-form');
	var messages = document.getElementById('ias_messages');

	form.addEventListener('submit', saveMessage.bind(this));

	function saveMessage(e) {
		e.preventDefault();

		var text = e.srcElement.children[0].value

		if(text === '') {
			console.log('tried to send empty form. Rejected.');
			return false;
		}

		printMessage(text);

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

	function recievedMessage(text) {
		printMessage(text, true);
	}
}


// })();


window.onload = function() {
  window.IASChat = new IASChat();
};
