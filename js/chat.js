
function IASChat(config) {

	// ALSO ADD CHAT SETTINGS TO CONFIG
	var mainColor = config.mainColor || '#ff9800';
	var textColor = config.textColor || '#ffffff';

	var settings = {
		cid: null,
		uid: null,
		name: null,
		pic: null,
		user: null,
		lastMessage: null,
		button: config.button || false,
		mainColor: config.mainColor || '#ff9800',
		textColor: config.textColor || '#ffffff',
		topbarBg: config.topbarBg || mainColor,
		topbarColor: config.topbarColor || textColor,
		buttonBg: config.buttonBg || mainColor,
		buttonColor: config.buttonColor || textColor,
		buttonIcon: config.buttonIcon || null,
		inputBorderColor: config.inputBorderColor || mainColor,
		defaultSupportName: config.defaultSupportName || 'Support chat',
		defaultSupportPic: config.defaultSupportPic || 'https://s3.amazonaws.com/uifaces/faces/twitter/robertovivancos/128.jpg',
		container: config.container || null,
		hashSign: config.hashSign || '?',
		uploadFiles: config.uploadFiles || true,
		onlyPictures: config.onlyPictures || true,
		onSend: config.onSend || null,
		onMessage: config.onMessage || null,
		storageType: config.storageType || 'firebase'
	};

	settings.storage = Storage(settings);

	// Prepare interface
	printInterface(settings.container);

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

	var attatchment = null;

	var lastHash = '';
	var lastPage = '';

	var user = null;
	var lastMessage = {};


	// Listen event submit
	if(show) {
		show.addEventListener('click', showIAS.bind(this));
	} else if(settings.button) {
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
		uid: settings.uid,
		cid: settings.cid
	};

	/* ### Set chat properties ### */

	function setUser(config) {
		settings.uid = config.uid;
		settings.cid = config.cid || config.uid;
		settings.name = config.name || '';
		settings.pic = config.pic || '';

		// Get chat info
		settings.storage.getUser(function(data) {
			settings.user = data;

			settings.lastMessage = settings.user.lastMessage;
			// console.log(lastMessage);
			
			setChatData();
			setNotifications();
		});


		clearMessages();

		settings.storage.onMessage(receiveMessage);
	}

	function setChatData() {

		if(settings.user) {

			var printData = {
				name: settings.defaultSupportName,
				pic: settings.defaultSupportPic
			};

			if(settings.uid == settings.cid) {
				if (settings.user !== null && settings.user.supporter != -1) {
					printData.name = settings.user.supporter.name;
					printData.pic = settings.user.supporter.pic;
				}
			} else {
				printData.name = settings.user.name;
				printData.pic = settings.user.pic;
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
		var ias = '<%- data.ias %>';

		// If shall show button, add it to interface (from html/show-button.html)
		if(settings.button) {
			ias += '<%- data.iasSegment %>';
		}

		// Also add the styles from css/style.css
		ias += '<%- data.iasStyle %>';

		var printplace = null;

		if(typeof(settings.container) !== 'undefined' && settings.container !== null) {
			if(settings.container.indexOf('#') !== -1) {
				settings.container = settings.container.slice(1);
				printplace = document.getElementById(settings.container);
			} else if(settings.container.indexOf('.') !== -1) {
				settings.container = settings.container.slice(1);
				printplace = document.getElementsByClassName(settings.container)[0];
			}
		}

		if(printplace === null) {
			printplace = document.getElementsByTagName('body')[0];
		} 
		
		printplace.insertAdjacentHTML('beforeend', ias);
	}

	function customizeInterfaze() {
		// Topbar
		topbar.style.backgroundColor = settings.topbarBg;
		topbar.style.color = settings.topbarColor;
		topbar.style.fill = settings.topbarColor;

		// Open chat button
		if(settings.button) {
			show.style.backgroundColor = settings.buttonBg;
			show.style.color = settings.buttonColor;
			show.style.fill = settings.buttonColor;
		}

		// Form colors
		form.children[0].style.borderColor = settings.inputBorderColor;

		// Upload form buttons
		if(!settings.uploadFiles) {
			form.children[0].style.display = 'none';
			form.children[1].style.margin = '0 16px';
			form.children[1].style.width = 'calc(100% - 88px)';
		}

		// If changed button icon
		if(settings.buttonIcon) {
			var icon = document.createElement('img');
			icon.style.width = '24px';
			icon.style.height = '24px';
			icon.setAttribute('src', settings.buttonIcon);
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
			uid: settings.uid,
			text: text,
			timestamp: new Date().getTime(),
			reverseTimestamp: 0 - Number(new Date().getTime())
		};

		if(typeof(img) !== 'undefined') {
			msg.img = img;
		}

		settings.storage.sendMessage(msg);
	}

	function receiveMessage(message, key) {

		var text = message.text;

		// Check if is a photo
		if(typeof(message.img) !== 'undefined') {
			text = '<a href="' + message.img + '" target="_blank"><img src="' + message.img + '" /></a>';
			// If there is text with the image, add it
			if(message.text !== '' || message.text !== ' ') {
				text += '<br>' + message.text;
			}
		}

		if(message.uid == settings.uid) {
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
		settings.storage.readLastMessage();
	}

	function setNotifications() {

		// Only set notifications if button are enabled
		if(settings.button) {
			if(settings.lastMessage.uid !== settings.uid && !settings.lastMessage.read) {
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
					window.location.hash +=  settings.hashSign + 'ias=true'; 
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

			if(lastPage === window.location.href.split('#')[0] && (lastHash.indexOf( settings.hashSign + 'ias=true') !== -1 || lastHash.indexOf('#ias=true') !== -1)) {
				window.history.back();
			} else {
				if(window.location.hash.indexOf( settings.hashSign + 'ias=true') !== -1) {
					window.location.hash = window.location.hash.replace( settings.hashSign + 'ias=true', ''); 
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

		if(settings.onlyPictures) {

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

		// Upload file and metadata 
		settings.storage.upload(file, metadata, function(downloadURL) {

				// console.log(text);

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
