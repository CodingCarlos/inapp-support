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

module.exports = {validateExtension};