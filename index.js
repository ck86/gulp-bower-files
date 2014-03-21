var fs              = require("fs");
var path            = require("path");
var gulp            = require("gulp");
var gutil           = require("gulp-util");
var PluginError     = gutil.PluginError
var PackageManager  = require("./lib/package_collection");

const PLUGIN_NAME = "gulp-bower-files";

module.exports = function(opts){
    opts = opts || {};

    if(!opts.paths)
        opts.paths = {}

    opts.paths.bowerJson        = opts.paths.bowerJson || "./bower.json";
    opts.paths.bowerrc          = opts.paths.bowerrc || "./.bowerrc";
    opts.paths.bowerDirectory   = opts.paths.bowerDirectory || "./bower_components";

    if(fs.existsSync(opts.paths.bowerrc)){
        opts.paths.bowerDirectory = path.dirname(opts.paths.bowerrc);
        opts.paths.bowerDirectory = path.join(opts.paths.bowerDirectory, "/", (JSON.parse(fs.readFileSync(opts.paths.bowerrc))).directory);
    }

    if(!opts.paths.bowerJson || !fs.existsSync(opts.paths.bowerJson)){
        throw new PluginError(PLUGIN_NAME, "bower.json file does not exist at " + opts.paths.bowerJson);
    }

    if(!opts.paths.bowerDirectory || !fs.existsSync(opts.paths.bowerDirectory)){
        throw new PluginError(PLUGIN_NAME, "Bower components directory does not exist at " + opts.paths.bowerDirectory);
    }

    if(!opts.base)
        opts.base = opts.paths.bowerDirectory;

    if(!opts.includeDev)
        opts.includeDev = false;

    try {
        var manager = new PackageManager(opts);
        manager.collectPackages();
        var files = manager.getFiles();
    } catch(e) {
        throw e;
        throw new PluginError(PLUGIN_NAME, e.message);
    }

    return gulp.src(files, opts);
}