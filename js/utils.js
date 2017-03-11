function validateExtension(file) {
  const fileName = file.name;
  const fileExtension =fileName.substr(fileName.lastIndexOf('.')).toLowerCase();

  const _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png"];

  return _validFileExtensions.find((ext) => fileExtension === ext) || null;
}

module.exports = {validateExtension};