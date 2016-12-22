var fs = require('fs');

require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

module.exports = {
    ias: require("./ias.html").replace(/(\r\n\t|\n|\r|\t)/gm,"").replace(/(\')/gm,"\\\'"),
    iasSegment: require("./ias_segment.html").replace(/(\r\n\t|\n|\r|\t)/gm,"").replace(/(\')/gm,"\\'"),
    iasStyle: require("./ias_style.html").replace(/(\r\n\t|\n|\r|\t)/gm,"").replace(/(\')/gm,"\\'"),
    iasProvider: require("./ias_provider.html").replace(/(\r\n\t|\n|\r|\t)/gm,"").replace(/(\')/gm,"\\'")
}