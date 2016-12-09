

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
		.orderByChild('lastmessage/reverseTimestamp')
		.on('value', function(snapshot) {
			addChats(snapshot)
		});

	// On change
	firebase.database().ref('users')
		.orderByChild('lastmessage/reverseTimestamp')
		.on('child_changed', function(snapshot) {
			addChats();
		});


	/* ### Print functions ### */

	function addChats(snapshot) {
		snapshot.forEach(function(child) {

			var data = child.val();
				data.uid = child.key;
			
			addUserToList(data);

		}.bind(this));
	}

	function addUserToList(data) {
		var user = document.createElement('li');
			user.setAttribute("data-cid", data.uid);
			user.innerHTML = data.name;

		usersChat[0].appendChild(user);
		user.addEventListener('click', usersChatManagement, false);
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