
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
	var buttonIcon = config.buttonIcon || null;
	var inputBorderColor = config.inputBorderColor || mainColor;
	var defaultSupportName = config.defaultSupportName || 'Support chat';
	var defaultSupportPic = config.defaultSupportPic || 'https://s3.amazonaws.com/uifaces/faces/twitter/robertovivancos/128.jpg';
	var container = config.container || null;
	var hashSign = config.hashSign || '?';
	var uploadFiles = config.uploadFiles || true;
	var onlyPictures = config.onlyPictures || true;
	var onSend = config.onSend || null;
	var onMessage = config.onMessage || null;

	// Prepare interface
	printInterface(container);

	// Prepare listeners
	var show = document.getElementById('ias-show');
	var showNotifications = document.getElementById('ias-show-notifications');
	var ias = document.getElementById('ias');
	var topbar = document.getElementById('ias_topbar');
	var close = document.getElementById('ias_topbar-close');
	var form = document.getElementById('ias_write-form');
	var messages = document.getElementById('ias_messages');
	var uploadFile = document.getElementById("ias_write-attachment-uploadFile");
	var attach = document.getElementById("ias_attachment");
	var attatchmentClose = document.getElementById('ias_attachment-close');
	var attatchmentPreview = document.getElementById('ias_attachment-preview');

	customizeInterfaze();

	var messagesRef;
	var storageRef = firebase.storage().ref();

	var attatchment = null;

	var lastHash = '';
	var lastPage = '';

	var user = null;
	var lastMessage = {};


	// Listen event submit
	if(show) {
		show.addEventListener('click', showIAS.bind(this));
	} else if(button) {
		console.warn('Coud not initializate listener for the button to open chat.');
	}
	close.addEventListener('click', hideIAS.bind(this));
	form.addEventListener('submit', saveMessage.bind(this));
	uploadFile.addEventListener('change', previewImage);
	attatchmentClose.addEventListener('click', closeImage);

	// Detect height change, becouse of adding messages, or rendering images
	onElementHeightChange(messages, scrollDown);
	
	// Set user
	setUser(config);

	// Detect hash change to update IAS visibility
	hashChange();


	return {
		setUser: setUser,
		open: showIAS,
		uid: uid,
		cid: cid
	};

	/* ### Set chat properties ### */

	function setUser(config) {
		uid = config.uid;
		cid = config.cid || config.uid;
		name = config.name || '';
		pic = config.pic || '';

		// Get chat info
		userRef = firebase.database().ref('users/' + cid);
		userRef.on('value', function(data) {

			user = data.val();

			lastMessage = user.lastMessage;
			// console.log(lastMessage);
			
			setChatData();
			setNotifications();
		});


		clearMessages();

		if(typeof(messagesRef) !== 'undefined') {
			messagesRef.off();
		}
		messagesRef = firebase.database().ref('messages/' + cid);
		messagesRef.on('child_added', receiveMessage);
	}

	function setChatData() {

		if(user) {

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
		} else {
			setTimeout(setChatData, 100);
		}
	}


	/* ### Interface ### */

	function printInterface() {
		// Compressed version of html/chat.html turned to string
		var ias = '<div id=\"ias\" class=\"hidden\"><div id=\"ias_topbar\"><div id=\"ias_topbar-pic\"><img src=\"https://s3.amazonaws.com/uifaces/faces/twitter/brad_frost/128.jpg\"></div><div id=\"ias_topbar-text\">Support</div><div id=\"ias_topbar-close\"><svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\"><path d=\"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z\" /><path d=\"M0 0h24v24H0z\" fill=\"none\" /></svg></div></div><div id=\"ias_messages\"></div><div id=\"ias_attachment\" class=\"hidden\"><span id=\"ias_attachment-close\"><svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\"><path d=\"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z\"></path><path d=\"M0 0h24v24H0z\" fill=\"none\"></path></svg></span><span id=\"ias_attachment-preview\"></span></div><div id=\"ias_write\"><form id=\"ias_write-form\"><span id=\"ias_write-attachment\"><svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"#000000\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\"><path d=\"M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg><input type=\"file\" id=\"ias_write-attachment-uploadFile\" /></span><input type=\"text\" /><button type=\"submit\"><svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"#000000\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\"><path d=\"M2.01 21L23 12 2.01 3 2 10l15 2-15 2z\" /><path d=\"M0 0h24v24H0z\" fill=\"none\" /></svg></button></form></div></div>';

		// If shall show button, add it to interface (from html/show-button.html)
		if(button) {
			ias += '<div id=\"ias-show\"><svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\"><path d=\"M0 0h24v24H0z\" fill=\"none\" /><path d=\"M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 16h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 11.9 13 12.5 13 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z\" /></svg><span id=\"ias-show-notifications\" class=\"hidden\"></span></div>';
		}

		// Also add the styles from css/style.css
		ias += '<style>#ias {font-family: \'Roboto\',\'Helvetica\',\'Arial\',sans-serif!important;position: fixed;top: 0;left: 0;height: 100%;width: 100%;z-index: 999;}#ias.hidden {display: none;}#ias_topbar {background-color: #ff9800;color: #fff;fill: #fff;height: 56px;width: 100%;}#ias_topbar #ias_topbar-pic {padding: 8px 16px;width: 40px;height: 40px;float: left;}#ias_topbar #ias_topbar-pic img {height: 100%;border-radius: 50%;}#ias_topbar #ias_topbar-text {float: left;margin-left: 6px;margin-top: 14px;font-size: 24px;}#ias_topbar #ias_topbar-close {color: #fff;float: right;font-size: 24px;margin: 16px 16px 0 0;}#ias_messages {background: #f7f8fb;height: calc(100% - 117px);overflow: auto;padding-top: 12px;}.ias_message {margin: 4px 8px;padding: 4px 12px;}.ias_message-sent {text-align: right;}.ias_message span {background-color: #fff;padding: 4px 12px;border-radius: 5px 5px 0 5px;box-shadow: 1px 1px 5px rgba(0, 0, 0, .1);color: #333;display: inline-block;}.ias_message span img {margin: 8px 0 4px;max-width: 300px;max-height: 264px;}#ias_attachment {position: fixed;bottom: 48px;background: #fff;width: 100%;height: 220px;text-align: center;padding: 8px;box-sizing: border-box;border-top: 1px solid #efefef;}#ias_attachment.hidden {display: none;}#ias_attachment-close {position: absolute;top: 8px;right: 8px;}#ias_attachment #ias_attachment-preview img {max-height: 100%;max-width: 100%;}#ias_write {background-color: #fff;border-top: 1px solid #efefef;height: 48px;position: fixed;bottom: 0;left: 0;width: 100%;}#ias_write input {border: 0;border-bottom: 1px solid #ff9800;height: 31px;left: 0;margin: 0 48px;outline: none;padding: 8px 8px 0px 8px;position: absolute;top: 0;width: 70%;width: calc(100% - 122px);}#ias_write #ias_write-attachment svg {position: absolute;left: 12px;top: 13px;}#ias_write #ias_write-attachment input#ias_write-attachment-uploadFile {width: 24px;margin: 0px 4px;opacity: 0;position: absolute;top: 4px;left: 0px;}#ias_write button {background-color: #fff;border: none;position: fixed;right: 12px;bottom: 5px;border-radius: 50%;font-size: 24px;width: 34px;padding: 0;overflow: hidden;line-height: normal;}#ias-show {background-color: #ff9800;border-radius: 50%;bottom: 16px;box-shadow: 0 1px 1.5px 0 rgba(0, 0, 0, .12), 0 1px 1px 0 rgba(0, 0, 0, .24);box-sizing: border-box;color: #fff;fill: #fff;height: 56px;padding: 16px;position: fixed;right: 16px;width: 56px;}#ias-show-notifications {height: 16px;width: 16px;background: red;position: absolute;left: 1px;top: 1px;border-radius: 50%;}#ias-show-notifications.hidden {display: none;}@media screen and (min-width: 842px) {#ias{height: 600px;width: 368px;position: fixed;right: 0;bottom: 0;top: auto;overflow: hidden;left: auto;}#ias_message {height: 483px;}#ias_attachment, #ias_write {position: absolute;}}</style>';

		var printplace = null;

		if(typeof(container) !== 'undefined' && container !== null) {
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

	function customizeInterfaze() {
		// Topbar
		topbar.style.backgroundColor = topbarBg;
		topbar.style.color = topbarColor;
		topbar.style.fill = topbarColor;

		// Open chat button
		if(button) {
			show.style.backgroundColor = buttonBg;
			show.style.color = buttonColor;
			show.style.fill = buttonColor;
		}

		// Form colors
		form.children[0].style.borderColor = inputBorderColor;

		// Upload form buttons
		if(!uploadFiles) {
			form.children[0].style.display = 'none';
			form.children[1].style.margin = '0 16px';
			form.children[1].style.width = 'calc(100% - 88px)';
		}

		// If changed button icon
		if(buttonIcon) {
			var icon = document.createElement('img');
			icon.style.width = '24px';
			icon.style.height = '24px';
			icon.setAttribute('src', buttonIcon);
			document.getElementById('ias-show').removeChild(document.getElementById('ias-show').firstChild);
			document.getElementById('ias-show').appendChild(icon);
		}
	}


	function onElementHeightChange(elm, callback){
		var lastHeight = elm.scrollHeight, newHeight;
		(function run() {
			newHeight = elm.scrollHeight;
			if(lastHeight != newHeight) {
				callback();
			}
			lastHeight = newHeight;

			if(elm.onElementHeightChangeTimer) {
				clearTimeout(elm.onElementHeightChangeTimer);
			}

			elm.onElementHeightChangeTimer = setTimeout(run, 300);
		})();
	}


	/* #### Messages #### */

	function saveMessage(e) {
		if(typeof(e) !== 'undefined') {
			e.preventDefault();
		}

		var text = e.srcElement.children[1].value;

		if(text === '' && attatchment === null) {
			console.warn('tried to send empty form. Rejected.');
			return false;
		}

		if(attatchment !== null) {
			upload(text);
		} else {
			pushMessage(text);
			clearForm();
		}
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

		message.appendChild(span);
		messages.appendChild(message);

		scrollDown();
	}

	function clearMessages() {
		while (messages.firstChild) {
			messages.removeChild(messages.firstChild);
		}
	}

	function clearForm() {
		form.children[1].value = '';
	}

	function pushMessage(text, img) {

		var msg = {
			uid: uid,
			text: text,
			timestamp: new Date().getTime(),
			reverseTimestamp: 0 - Number(new Date().getTime())
		};

		if(typeof(img) !== 'undefined') {
			msg.img = img;
		}

		firebase.database().ref('messages/' + cid).push(msg);

		firebase.database().ref('users/' + cid).once('value').then(function(snapshot) {		
			
			var userLastMsg = msg;
			userLastMsg.read = false;

			if(!snapshot.val()) {
				// Add user
				firebase.database().ref('users/' + cid).set({
					name: name,
					pic: pic,
					isSupporter: false,
					supporter: -1,
					lastMessage: userLastMsg
				});
			} else {
				firebase.database().ref('users/' + cid).update({lastMessage: userLastMsg});
				if(!snapshot.val().profile) {
					generateUserData(cid);
				}
			}
		});
	}

	function receiveMessage(data) {
		var key = data.key;
		var message = data.val();
		var text = message.text;

		// Check if is a photo
		if(typeof(message.img) !== 'undefined') {
			text = '<a href="' + message.img + '" target="_blank"><img src="' + message.img + '" /></a>';
			// If there is text with the image, add it
			if(message.text !== '' || message.text !== ' ') {
				text += '<br>' + message.text;
			}
		}

		if(message.uid == uid) {
			printMessage(text);
			if(typeof onSend === 'function' && message.timestamp > lastMessage.timestamp) {
				onSend(message, key);
			}
		} else {
			printMessage(text, true);
			
			// If chat is open, set the message as read
			if(!isHidden()) {
				readLastMessage();
			}

			if(typeof onMessage === 'function' && message.timestamp > lastMessage.timestamp) {
				onMessage(message, key);
			}
		}
	}

	function readLastMessage() {
		firebase.database().ref('users/' + cid + '/lastMessage').update({read: true});
	}

	function setNotifications() {

		// Only set notifications if button are enabled
		if(button) {
			if(lastMessage.uid !== uid && !lastMessage.read) {
				if (showNotifications.classList) {
					showNotifications.classList.remove('hidden');
				} else {
					showNotifications.className = showNotifications.className.replace(new RegExp('(^|\\b)' + 'hidden'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
				}
			} else {
				if (showNotifications.classList) {
					showNotifications.classList.add('hidden');
				} else {
					showNotifications.className += ' ' + 'hidden';
				}
			}
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

		scrollDown();

		// Also set url hash to true;
		addUrlHash();

		// And read last message
		readLastMessage();
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

	function isHidden(e) {
		if(typeof(e) !== 'undefined') {
			e.preventDefault();
		}

		var className = 'hidden';

		if (ias.classList) {
			return ias.classList.contains(className);
		} else {
			return new RegExp('(^| )' + className + '( |$)', 'gi').test(ias.className);
		}
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
					window.location.hash +=  hashSign + 'ias=true'; 
				}
			} else {
				window.location.hash += '#ias=true'; 
			}

			lastPage = window.location.href.split('#')[0];

			setTimeout(hashChange, 300);
		}
	}

	function remUrlHash() {
		if(window.location.hash) {

			if(lastPage === window.location.href.split('#')[0] && (lastHash.indexOf( hashSign + 'ias=true') !== -1 || lastHash.indexOf('#ias=true') !== -1)) {
				window.history.back();
			} else {
				if(window.location.hash.indexOf( hashSign + 'ias=true') !== -1) {
					window.location.hash = window.location.hash.replace( hashSign + 'ias=true', ''); 
				} else if(window.location.hash.indexOf('#ias=true') !== -1) {
					window.location.hash = window.location.hash.replace('ias=true', ''); 
				}
			}
		}
	}

	function hashChange() {

		var isHash = visibilityUrlHash();

		if(window.location.hash !== lastHash) {

			lastHash = window.location.hash;

			if(isHash) {
				showIAS();
			} else {
				hideIAS();
			}

			setTimeout(hashChange, 300);

		} else {
			if(isHash) {
				setTimeout(hashChange, 300);
			}
		}
	}


	/* ###  ATTACH FILES ### */

	function previewImage() {
		var file = uploadFile.files[0];

		if(!file) {
			console.error('Empty file');
			return false;
		}

		attatchment = file;

		// Preview image
		var reader = new FileReader();

        reader.onload = function (e) {
            // $('#blah').attr('src', e.target.result);
        	attatchmentPreview.innerHTML = '<img src="' + e.target.result + '">';
        };

        reader.readAsDataURL(file);

        // Show attachment preview
        if (attach.classList) {
			attach.classList.remove('hidden');
		} else {
			attach.className = attach.className.replace(new RegExp('(^|\\b)' + 'hidden'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
	}

	function closeImage() {
		attatchment = null;
		attatchmentPreview.innerHTML = 'Loading preview...';

		if (attach.classList) {
			attach.classList.add('hidden');
		} else {
			attach.className += ' ' + 'hidden';
		}
	}


	/* ### UPLOAD FILES ### */

	function upload(text) {

		// File or Blob named mountains.jpg
		var file = attatchment; // uploadFile.files[0];
		var metadata;

		if(!file) {
			console.error('Empty file');
			return false;
		}

		if(onlyPictures) {

			var extension = validateExtension(file);

			if(extension === null) {
				console.error('Invalid file extension');
				return false;
			}

			var contentType = '';
			switch(extension) {
				case '.jpg':
				case '.jpeg':
					contentType = 'image/jpeg';
					break;

				case '.png':
					contentType = 'image/png';
					break;

				case '.bmp':
					contentType = 'image/bmp';
					break;

				case '.gif':
					contentType = 'image/gif';
					break;
			}

			// Create the file metadata
			metadata = {
				contentType: contentType
			};
			
		}

		// Upload file and metadata to the object 'images/mountains.jpg'
		var uploadTask = storageRef.child('images/' + uid + '/' + file.name).put(file, metadata);

		// Listen for state changes, errors, and completion of the upload.
		uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
			function(snapshot) {
				// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
				var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				console.log('Upload is ' + progress + '% done');
				switch (snapshot.state) {
					case firebase.storage.TaskState.PAUSED: // or 'paused'
						console.log('Upload is paused');
						break;
					case firebase.storage.TaskState.RUNNING: // or 'running'
						console.log('Upload is running');
						break;
				}
			}, function(error) {
				switch (error.code) {
					case 'storage/unauthorized':
						// User doesn't have permission to access the object
						console.error('User doesn\'t have permission to access the object');
						break;

					case 'storage/canceled':
						// User canceled the upload
						console.error('User cancelled upload');
						break;

					case 'storage/unknown':
						// Unknown error occurred, inspect error.serverResponse
						console.error('Unknown error ocured:');
						console.error(error.serverResponse);
						break;

					default:
						console.error('Unexpected and unhandeled error ocured:');
						console.error(error);
				}
			}, function() {
				// Upload completed successfully, now we can get the download URL
				var downloadURL = uploadTask.snapshot.downloadURL;

				console.log(text);

				if(typeof(text) === 'undefined') {
					text = '';
				}
				
				pushMessage(text, downloadURL);
				closeImage();
				clearForm();
			});
	}

	function validateExtension(file) {

		var _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png"];
		var fileName = file.name;

		var extension = null;

		if (fileName.length > 0) {
			
			for (var j = 0; j < _validFileExtensions.length; j++) {
				var thisExt = _validFileExtensions[j];

				// Check the extension is valid
				if (fileName.substr(fileName.length - thisExt.length, thisExt.length).toLowerCase() == thisExt.toLowerCase()) {
					extension = thisExt;
					break;
				}
			}

		}
		
		return extension;
	}


}
