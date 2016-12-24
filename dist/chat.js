

function IASChat(config) {

	// ALSO ADD CHAT SETTINGS TO CONFIG
	var cid;
	var uid;
	var name;
	var pic;
	var button = config.button || false;
	var mainColor = config.mainColor || '#ff9800';
	var textColor = config.textColor || '#ffffff';
	var topbarBg = config.topbarBg || mainColor;
	var topbarColor = config.topbarColor || textColor;
	var buttonBg = config.buttonBg || mainColor;
	var buttonColor = config.buttonColor || textColor;
	var inputBorderColor = config.inputBorderColor || mainColor;
	var defaultSupportName = config.defaultSupportName || 'Support chat';
	var defaultSupportPic = config.defaultSupportPic || 'https://s3.amazonaws.com/uifaces/faces/twitter/robertovivancos/128.jpg';

	// Prepare interface
	printInterface();

	// Prepare listeners
	var show = document.getElementById('ias-show');
	var ias = document.getElementById('ias');
	var topbar = document.getElementById('ias_topbar');
	var close = document.getElementById('ias_topbar-close');
	var form = document.getElementById('ias_write-form');
	var messages = document.getElementById('ias_messages');

	customizeInterfaze();

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
		pic = config.pic || '';

		setChatData();

		clearMessages();

		if(typeof(messagesRef) !== 'undefined') {
			messagesRef.off();
		}
		messagesRef = firebase.database().ref('messages/' + cid);
		messagesRef.on('child_added', receiveMessage);
	}

	function setChatData() {

		userRef = firebase.database().ref('users/' + cid);
		userRef.on('value', function(data) {
			var key = data.key;
			var user = data.val();

			var printData = {
				name: defaultSupportName,
				pic: defaultSupportPic
			};

			if(uid == cid) {
				if (user !== null && user.supporter != -1) {
					printData.name = user.supporter.name;
					printData.pic = user.supporter.pic;
				}
			} else {
				printData.name = user.name;
				printData.pic = user.pic;
			}
		
			document.getElementById('ias_topbar-text').innerHTML = printData.name;
			document.getElementById('ias_topbar-pic').firstChild.setAttribute('src', printData.pic);
		});

	}


	/* ### Interface ### */

	function printInterface() {
		// Compressed version of html/chat.html turned to string
		var ias = '<div id=\"ias\" class=\"hidden\">    <div id=\"ias_topbar\">        <div id=\"ias_topbar-pic\"><img src=\"https://s3.amazonaws.com/uifaces/faces/twitter/brad_frost/128.jpg\">        </div>        <div id=\"ias_topbar-text\">Support</div>        <div id=\"ias_topbar-close\">            <svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\">                <path d=\"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z\" />                <path d=\"M0 0h24v24H0z\" fill=\"none\" />            </svg>        </div>    </div>    <div id=\"ias_messages\"></div>    <div id=\"ias_write\">        <form id=\"ias_write-form\">            <input type=\"text\" />            <button type=\"submit\">                <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"#000000\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\">                    <path d=\"M2.01 21L23 12 2.01 3 2 10l15 2-15 2z\" />                    <path d=\"M0 0h24v24H0z\" fill=\"none\" />                </svg>            </button>        </form>    </div></div>'

		// If shall show button, add it to interface (from html/show-button.html)
		if(button) {
			ias += '<div id=\"ias-show\">    <svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\">        <path d=\"M0 0h24v24H0z\" fill=\"none\" />        <path d=\"M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 16h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 11.9 13 12.5 13 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z\" />    </svg></div>'
		}

		// Also add the styles from css/style.css
		ias += '<style>    #ias {        font-family: \'Roboto\',\'Helvetica\',\'Arial\',sans-serif!important;        position: fixed;        top: 0;        left: 0;        height: 100%;        width: 100%;        z-index: 999    }    #ias.hidden {        display: none    }    #ias_topbar {        background-color: #ff9800;        color: #fff;        fill: #fff;        height: 56px;        width: 100%    }    #ias_topbar #ias_topbar-pic {        padding: 8px 16px;        width: 40px;        height: 40px;        float: left    }    #ias_topbar #ias_topbar-pic img {        height: 100%;        border-radius: 50%    }    #ias_topbar #ias_topbar-text {        float: left;        margin-left: 6px;        margin-top: 14px;        font-size: 24px;    }    #ias_topbar #ias_topbar-close {        color: #fff;        float: right;        font-size: 24px;        margin: 16px 16px 0 0    }    #ias_messages {        background: #f7f8fb;        height: calc(100% - 117px);        overflow: auto;        padding-top: 12px    }    .ias_message {        margin: 4px 8px;        padding: 4px 12px    }    .ias_message-sent {        text-align: right    }    .ias_message span {        background-color: #fff;        padding: 4px 12px;        border-radius: 5px 5px 0 5px;        box-shadow: 1px 1px 5px rgba(0, 0, 0, .1);        color: #333    }    #ias_write {        background-color: #fff;        border-top: 1px solid #efefef;        height: 48px;        position: fixed;        bottom: 0;        left: 0;        width: 100%    }    #ias_write input {        border: 0;        border-bottom: 1px solid #ff9800;        height: 31px;        margin: 0 16px;        outline: none;        padding: 8px 8px 0px 8px;        width: 85%;        width: calc(100% - 96px)    }    #ias_write button {        background-color: #fff;        border: none;        position: fixed;        right: 12px;        bottom: 5px;        border-radius: 50%;        font-size: 24px;        width: 34px;        padding: 0;        overflow: hidden;        line-height: normal    }    #ias_write button img {        width: 70%    }    #ias-show {        background-color: #ff9800;        border-radius: 50%;        bottom: 16px;        box-shadow: 0 1px 1.5px 0 rgba(0, 0, 0, .12), 0 1px 1px 0 rgba(0, 0, 0, .24);        box-sizing: border-box;        color: #fff;        fill: #fff;        height: 56px;        padding: 16px;        position: fixed;        right: 16px;        width: 56px    }</style>';
		document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeend', ias);
	}

	function customizeInterfaze() {
		// Topbar
		topbar.style.backgroundColor = topbarBg;
		topbar.style.color = topbarColor;
		topbar.style.fill = topbarColor;

		// Open chat button
		show.style.backgroundColor = buttonBg;
		show.style.color = buttonColor;
		show.style.fill = buttonColor;

		// Form colors
		form.children[0].style.borderColor = inputBorderColor;
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
					pic: pic,
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

