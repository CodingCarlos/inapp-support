
function IASChatProvider(config) {

	var uid = config.uid;
	var name = config.name;
	var pic = config.pic
	var container = config.container;
	var mainColor = config.mainColor || '#ff9800'
	var textColor = config.textColor || '#fff'
	var chat = new IASChat({
		uid: uid,
		name: name,
		button: config.button || false,
		mainColor: mainColor,
		textColor: textColor,
		topbarBg: config.topbarBg || mainColor,
		topbarColor: config.topbarColor || textColor,
		buttonBg: config.buttonBg || mainColor,
		buttonColor: config.buttonColor || textColor,
		inputBorderColor: config.inputBorderColor || mainColor,
		defaultSupportName: config.defaultSupportName || 'Support chat',
		defaultSupportPic: config.defaultSupportPic || 'https://s3.amazonaws.com/uifaces/faces/twitter/robertovivancos/128.jpg',
		container: config.chatContainer,
		hashSign: config.hashSign
	});
	var cid;

	var setSupporterBind = setSupporter.bind(this);

	printInterface(container);

	setSupportUser();

	var usersChat = document.getElementsByClassName("iasProvider_users-chat");
	var unassignedChat = document.getElementById("iasProvider_unassigned-chat");
	var form = document.getElementById('ias_write-form');

	/* ### Load data ### */

	// First load
	firebase.database().ref('users')
		.orderByChild('lastMessage/reverseTimestamp')
		.on('value', function(snapshot) {
			addUserList(snapshot)
		});


	/* ### Interface ### */

	function printInterface(container) {
		// Compressed version of html/chat.html turned to string
		var ias = '<div id=\"iasProvider\"><div id=\"iasProvider_unassigned-chat\"><h3>Unassigned Users:</h3><ul class=\"iasProvider_users-chat\"></ul></div><div id=\"iasProvider_assigned-chat\"><h3>Your Users:</h3><ul class=\"iasProvider_users-chat\"></ul></div></div><style>#iasProvider {font-family: \"Roboto\",\"Helvetica\",\"Arial\",sans-serif!important;}.iasProvider_users-chat {list-style: none;margin: 0;padding: 0;}.iasProvider_users-chat li div {display: inline-block;vertical-align: middle;}.iasProvider_users-chat li div.iasProvider_users-chat-pic {box-sizing: border-box;padding: 8px 16px;width: 72px;}.iasProvider_users-chat li div.iasProvider_users-chat-pic img {border-radius: 50%;height: 40px;width: 40px;}.iasProvider_users-chat li div.iasProvider_users-chat-name {font-size: 16px;}</style>'

		// Also add the provider styles from css/provider-style.css
		// ias += '';

		var printplace = null;

		if(typeof(container) !== 'undefined') {
			if(container.indexOf('#') !== -1) {
				container = container.slice(1);
				printplace = document.getElementById(container);
			} else if(container.indexOf('.') !== -1) {
				container = container.slice(1);
				printplace = document.getElementsByClassName(container)[0];
			}
		}

		if(printplace === null) {
			printplace = document.getElementsByTagName('body')[0];
		} 
		
		printplace.insertAdjacentHTML('beforeend', ias);

	}


	/* ### Print functions ### */

	function addUserList(snapshot) {
		clearUserList();
		snapshot.forEach(function(child) {

			var data = child.val();
				data.uid = child.key;
			
			if(data.isSupporter == false) {
				addUserToList(data);
			}
		});

		if(usersChat[0].childElementCount == 0) {
			unassignedChat.style.display = 'none';
		} else {
			unassignedChat.style.display = 'block';
		}
		// }.bind(this));
	}

	function addUserToList(data) {

		var supporter = data.supporter.uid || data.supporter;

		var user = document.createElement('li');
			user.setAttribute("data-cid", data.uid);
			user.setAttribute("data-supporter", supporter);
			user.innerHTML = '<div class="iasProvider_users-chat-pic"><img src="' + data.pic + '"></div><div class="iasProvider_users-chat-name">' + data.name + '</div>';

		user.addEventListener('click', usersChatManagement, false);

		if(supporter == '-1') {
			usersChat[0].appendChild(user);
		} else if(supporter == uid) {
			usersChat[1].appendChild(user);
		}

	}

	function clearUserList() {
		while (usersChat[0].firstChild) {
			usersChat[0].removeChild(usersChat[0].firstChild);
		}
		while (usersChat[1].firstChild) {
			usersChat[1].removeChild(usersChat[1].firstChild);
		}
	}


	/* ### Open chats ### */

	function usersChatManagement(event) {
	    var event = event || window.event;
	    var element = event.target || event.srcElement;

	    // If the element clicked is not the main element, but a child
	    if(element.getAttribute('data-cid') === null) {
	    	// Go up through the path
	    	for (var i = 0; i < event.path.length; i++) {
	    		// Until finding the main element
	    		if(event.path[i].getAttribute('data-cid') !== null) {
	    			element = event.path[i];
	    			break;
	    		}
	    	}
	    }

		form.removeEventListener('submit', setSupporterBind);

	    if(element.getAttribute("data-supporter") == '-1') {
			form.addEventListener('submit', setSupporterBind);
	    }

	    cid = element.getAttribute("data-cid");

	    chat.setUser({
	        cid: cid, 
	        uid: uid
	    }); 
	    chat.open(event);
	};


	/* ### Set functions ### */

	function setSupportUser() {
		firebase.database().ref('users/' + uid).once('value').then(function(snapshot) {		
			if(!snapshot.val()) {
				// Add user
				firebase.database().ref('users/' + uid).set({
					name: name,
					pic: pic,
					isSupporter: true,
					supporter: -1,
					lastMessage: {
						timestamp: new Date().getTime(),
						reverseTimestamp: 0 - Number(new Date().getTime())
					}
				});
			} else {
				firebase.database().ref('users/' + uid).update({
					lastMessage: {
						timestamp: new Date().getTime(),
						reverseTimestamp: 0 - Number(new Date().getTime())
					}
				});
			}
		});
	}

	function setSupporter() {		
		form.removeEventListener('submit', setSupporterBind);
		firebase.database().ref('users/' + cid).update({
			supporter: {
				uid: uid,
				name: name,
				pic: pic
			}
		});
	}
}