function IASChatProvider(config) {

	var uid = config.uid;
	var name = config.name;
	var chat = new IASChat({
		uid: uid,
		name: name,
		button: false
	});

	setSupportUser();

	var usersChat = document.getElementsByClassName("users-chat");

	/* ### Load data ### */

	// First load
	firebase.database().ref('users')
		.orderByChild('lastMessage/reverseTimestamp')
		.on('value', function(snapshot) {
			addUserList(snapshot)
		});

	// On change
	firebase.database().ref('users')
		.orderByChild('lastMessage/reverseTimestamp')
		.on('child_changed', function(snapshot) {
			addUserList(snapshot);
		});


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
		// }.bind(this));
	}

	function addUserToList(data) {
		var user = document.createElement('li');
			user.setAttribute("data-cid", data.uid);
			user.innerHTML = data.name;

		usersChat[0].appendChild(user);
		user.addEventListener('click', usersChatManagement, false);
	}

	function clearUserList() {
		while (usersChat[0].firstChild) {
			usersChat[0].removeChild(usersChat[0].firstChild);
		}
	}


	/* ### Open chats ### */

	function usersChatManagement(event) {
	    var event = event || window.event;
	    var element = event.target || event.srcElement;

	    chat.setUser({
	        cid: element.getAttribute("data-cid"), 
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
}