

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

	// Check url hash visibility
	if(visibilityUrlHash() === true) {
		showIAS();
	} else {
		hideIAS();
	}


	return {
		setUser: setUser,
		open: showIAS,
		uid: uid,
		cid: cid
	}

	/* ### GENERATE DUMMY USER DATA ### */

	function generateUserData(cid){
		var dummyData = true
		if(dummyData){
	        var xmlHttp = new XMLHttpRequest();
	
	        xmlHttp.onreadystatechange = function() {
	
	            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
	            	var profileData = JSON.parse(xmlHttp.responseText)
			        firebase.database().ref('users/' + cid).update({profile: profileData.results[0]});
	            } else if (xmlHttp.readyState === 4 && xmlHttp.status === 404) {
	                console.error("ERROR! 404");
	                console.info(JSON.parse(xmlHttp.responseText));
	            }
	        };
	        xmlHttp.open("GET", "https://randomuser.me/api/", true);
	        xmlHttp.send();
			
		}
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
		// Compressed version of html/chat.html turned to string
		var ias = '<%- data.ias %>'

		// If shall show button, add it to interface (from html/show-button.html)
		if(button) {
			ias += '<%- data.iasSegment %>'
		}

		// Also add the styles from css/style.css
		ias += '<%- data.iasStyle %>';
		document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeend', ias);
	}


	/* #### Messages #### */

	function saveMessage(e) {
		if(typeof(e) !== 'undefined') {
			e.preventDefault();
		}

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
				if(!snapshot.val().profile) {
					generateUserData(cid)
				}
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
		if(typeof(e) !== 'undefined') {
			e.preventDefault();
		}

		if (ias.classList) {
			ias.classList.remove('hidden');
		} else {
			ias.className = ias.className.replace(new RegExp('(^|\\b)' + 'hidden'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}

		// Also set url hash to true;
		addUrlHash();
	}

	function hideIAS(e) {
		if(typeof(e) !== 'undefined') {
			e.preventDefault();
		}
		
		if (ias.classList) {
			ias.classList.add('hidden');
		} else {
			ias.className += ' ' + 'hidden';
		}

		// Also remove url hash to true;
		remUrlHash();
	}

	/* ### URL Hash ### */

	function visibilityUrlHash() {

		var ret = false;
		if(window.location.hash.indexOf('ias=true') !== -1) {
			ret = true;
		}

		return ret;
	}

	function addUrlHash() {
		if(!visibilityUrlHash()) {
			if(window.location.hash) {
				if(window.location.hash.indexOf('ias=true') === -1) {
					window.location.hash += '&ias=true'; 
				}
			} else {
				window.location.hash += '#ias=true'; 
			}
		}
	}

	function remUrlHash() {
		if(window.location.hash) {
			if(window.location.hash.indexOf('&ias=true') !== -1) {
				window.location.hash = window.location.hash.replace('&ias=true', ''); 
			} else if(window.location.hash.indexOf('#ias=true') !== -1) {
				window.location.hash = window.location.hash.replace('ias=true', ''); 
			}
		}
	}
}

