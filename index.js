var fs = require("fs");
var path = require("path");
var gulp = require("gulp");
var gutil = require("gulp-util");
var PluginError = gutil.PluginError

const PLUGIN_NAME = "gulp-bower-files";

var readMainFilesFromDependency = function(dependencyConfig) {
    jsonPath = firstExistingFile([path.join(dependencyConfig.basePath, "bower.json"), 
                                  path.join(dependencyConfig.basePath, "package.json")]);

    if(!jsonPath){
        throw new PluginError(PLUGIN_NAME, "The bower package " + dependencyConfig.name + " has no bower.json or package.json, use the overrides property in your bower.json");
    }
    var json = JSON.parse(fs.readFileSync(jsonPath))
    if(!json.main){
        throw new PluginError(PLUGIN_NAME, "The bower package " + dependencyConfig.name + " has no main file(s), use the overrides property in your bower.json");
    }
    return json.main;
}

/**
 * Given a list of paths, return the first path that exists.
 * @param paths {array[string]} ordered array of paths to check.
 * @return {string} First path that exists or null if none exist.
 */
var firstExistingFile = function(paths) {
    return paths.reduce(function(prev, curr) {
        if (prev) return prev;
        return fs.existsSync(curr)? curr : null;
    }, null);
}

/**
 * Adding glob path to the srcs array
 * @param {Array}           srcs        The srcs array
 * @param {String}          basePath    Base path to the bower component
 * @param {Array|String}    main        Path to the main file(s)
 */
var addToSrcs = function(srcs, basePath, main){
    if(Array.isArray(main)){
        return main.forEach(function(item){
            addToSrcs(srcs, basePath, item);
        });
    }

    var basename = path.basename(main);

    srcs.push(path.join(basePath, "**", basename));
}

var gulpBowerFiles = function(opts){
    opts = opts || {};

    if(!opts.paths)
        opts.paths = {}

    var srcs = [];
    var bowerJsonPath = opts.paths.bowerJson || "./bower.json";
    var bowerrcPath = opts.paths.bowerrc || "./.bowerrc";
    var bowerDirectory = "./bower_components";

    if(fs.existsSync(bowerrcPath)){
        bowerDirectory = path.dirname(bowerrcPath);
        bowerDirectory = path.join(bowerDirectory, "/", (JSON.parse(fs.readFileSync(bowerrcPath))).directory);
    }

    if(!bowerJsonPath || !fs.existsSync(bowerJsonPath)){
        throw new PluginError(PLUGIN_NAME, "bower.json file does not exist at "+bowerJsonPath);
    }

    if(!bowerDirectory || !fs.existsSync(bowerDirectory)){
        throw new PluginError(PLUGIN_NAME, "Bower components directory does not exist at "+bowerDirectory);
    }

    if(!opts.base)
        opts.base = bowerDirectory;

    try {
        var bowerJson = JSON.parse(fs.readFileSync(bowerJsonPath));
    } catch (e) {
        throw new PluginError(PLUGIN_NAME, "The bower.json file at " + bowerJsonPath + " is not valid JSON. ");
    }

    if(!bowerJson.dependencies){
        throw new PluginError(PLUGIN_NAME, "The project bower.json has no dependencies listed. This plugin has nothing to do!");
    }

    var packageJson = bowerJson.overrides || {};

    for(var dependency in bowerJson.dependencies){
        var dependencyConfig = packageJson[dependency] || {};

        if(dependencyConfig.ignore === true){
            continue;
        }

        dependencyConfig.name = dependency;

        dependencyConfig.basePath = dependencyConfig.basePath || path.join(bowerDirectory, dependency);
              
        dependencyConfig.main = dependencyConfig.main || readMainFilesFromDependency(dependencyConfig);
        
        addToSrcs(srcs, dependencyConfig.basePath, dependencyConfig.main);
    }

    return gulp.src(srcs, opts);
}



module.exports = gulpBowerFiles
