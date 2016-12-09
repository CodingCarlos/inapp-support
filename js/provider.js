

function IASChatProvider(config) {

	var uid = config.uid;
	var name = config.name;
	var chat = new IASChat({
		uid: uid,
		name: name,
		button: false
	});

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
			
			addUserToList(data);
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
}