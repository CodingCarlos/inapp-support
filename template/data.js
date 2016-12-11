var fs = require('fs');

require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

module.exports = {
    ias: require("./ias.html").replace(/(\r\n\t|\n|\r|\t)/gm,""),
    iasSegment: require("./ias_segment.html").replace(/(\r\n\t|\n|\r|\t)/gm,""),
    iasStyle: require("./ias_style.html").replace(/(\r\n\t|\n|\r|\t)/gm,"")
}