

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
	var uploadFile = document.getElementById("ias_write-attachment-uploadFile");
	var attach = document.getElementById("ias_attachment");
	var attatchmentClose = document.getElementById('ias_attachment-close');
	var attatchmentPreview = document.getElementById('ias_attachment-preview');

	customizeInterfaze();

	var messagesRef;
	var storageRef = firebase.storage().ref();

	var attatchment = null;

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
		var ias = '<%- data.ias %>'

		// If shall show button, add it to interface (from html/show-button.html)
		if(button) {
			ias += '<%- data.iasSegment %>'
		}

		// Also add the styles from css/style.css
		ias += '<%- data.iasStyle %>';
		document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeend', ias);
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

		var text = e.srcElement.children[1].value

		if(text === '') {
			console.log('tried to send empty form. Rejected.');
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
		} else {
			printMessage(text, true);
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
        }

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

		if(!file) {
			console.error('Empty file');
			return false;
		}

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
		var metadata = {
			contentType: contentType
		};

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

