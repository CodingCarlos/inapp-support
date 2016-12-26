var fs = require('fs');

require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

module.exports = {
    ias: clean(require("./ias.html")),
    iasSegment: clean(require("./ias_segment.html")),
    iasStyle: clean(require("./ias_style.html")),
    iasProvider: clean(require("./ias_provider.html"))
}

function clean(file) {

	// It was working, but keeps some tabs turned to spaces...
	// return file.replace(/(\r\n\t|\n|\r|\t)/gm,"").replace(/(\')/gm,"\\\'").replace(/(\")/gm,'\\\"');

	return file.replace(/\s{2,}/g,"").replace(/(\')/gm,"\\\'").replace(/(\")/gm,'\\\"');
}