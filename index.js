var fs = require("fs");
var path = require("path");
var gulp = require("gulp");
var gutil = require("gulp-util");
var PluginError = gutil.PluginError

const PLUGIN_NAME = "gulp-bower-files";

var loadConfigJson = function(dependencyConfig) {
    jsonPath = firstExistingFile([path.join(dependencyConfig.basePath, "bower.json"), 
                                  path.join(dependencyConfig.basePath, "package.json")]);

    if(!jsonPath){
        throw new PluginError(PLUGIN_NAME, "The bower package " + dependencyConfig.name + " has no bower.json or package.json, use the overrides property in your bower.json");
    }
    var json = JSON.parse(fs.readFileSync(jsonPath))
    if(!json.main){
        throw new PluginError(PLUGIN_NAME, "The bower package " + dependencyConfig.name + " has no main file(s), use the overrides property in your bower.json");
    }
    return json;
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


var mainPaths = function(basePath, main){
    if(!Array.isArray(main)){
        main = [main];
    }
    return main.map(function(item) {
      return path.join(basePath, item);
    }); 
}


var gatherMainFiles = function(bowerDirectory, bowerJsonPath) {
    try {
        var bowerJson = JSON.parse(fs.readFileSync(bowerJsonPath));
    } catch (e) {
        throw new PluginError(PLUGIN_NAME, "The bower.json file at " + bowerJsonPath + " is not valid JSON. ");
    }

    if(!bowerJson.dependencies){
        throw new PluginError(PLUGIN_NAME, "The project bower.json has no dependencies listed. This plugin has nothing to do!");
    }
    
    var packageJson = bowerJson.overrides || {};
    var seenPackages = {};
    return processDependencies(bowerDirectory, packageJson, bowerJson, seenPackages);
}

var processDependencies = function(bowerDirectory, packageJson, jsonConfig, seenPackages) {
    var srcs = [];
    for(var dependency in jsonConfig.dependencies){

        var dependencyConfig = packageJson[dependency] || {};

        if(dependencyConfig.ignore === true || seenPackages[dependency]){
            continue;
        }

        dependencyConfig.name = dependency;
        seenPackages[dependency] = true;
      

        dependencyConfig.basePath = dependencyConfig.basePath || path.join(bowerDirectory, dependency);
              
        var configJson = loadConfigJson(dependencyConfig);

        dependencyConfig.main = dependencyConfig.main || configJson.main;

        
        var paths = mainPaths(dependencyConfig.basePath, dependencyConfig.main)
                      .concat(processDependencies(bowerDirectory, packageJson, configJson, seenPackages));
      
        srcs = srcs.concat(paths);
    }

    return srcs;
}





var gulpBowerFiles = function(opts){
    opts = opts || {};

    if(!opts.paths)
        opts.paths = {}

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

    var srcs = gatherMainFiles(bowerDirectory, bowerJsonPath);

    return gulp.src(srcs);
}



module.exports = gulpBowerFiles
