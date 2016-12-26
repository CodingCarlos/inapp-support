
var storageRef = firebase.storage().ref();
var uploadFile = document.getElementById("uploadFile");
var uid = 1234;

function upload() {

	// File or Blob named mountains.jpg
	var file = uploadFile.files[0];

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
			console.log('Fille successfully uploaded to:');
			console.log(downloadURL);
			console.log('Would be a good moment to add a message including the file url...');
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

