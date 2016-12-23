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
	return file.replace(/(\r\n\t|\n|\r|\t)/gm,"").replace(/(\')/gm,"\\\'").replace(/(\")/gm,'\\\"');
}