var fs = require("fs");
var path = require("path");
var gulp = require("gulp");
var gutil = require("gulp-util");
var PluginError = gutil.PluginError

const PLUGIN_NAME = "gulp-bower-files";

var addToSrcs = function(srcs, basePath, main){
    if(Array.isArray(main)){
        return main.forEach(function(item){
            addToSrcs(srcs, basePath, item);
        });
    }

    var basename = path.basename(main);

    srcs.push(path.join(basePath, "/../", "**", basename));
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
        throw new PluginError(PLUGIN_NAME, "bower.json file does not exists in.");
    }

    if(!bowerDirectory || !fs.existsSync(bowerDirectory)){
        throw new PluginError(PLUGIN_NAME, "Bower components directory does not exists.");
    }

    var bowerJson = JSON.parse(fs.readFileSync(bowerJsonPath));

    if(!bowerJson.dependencies){
        throw new PluginError(PLUGIN_NAME, "The bower.json has no dependencies.");
    }

    var packageJson = bowerJson.overrides || {};

    for(var dependency in bowerJson.dependencies){
        if(!packageJson[dependency]){
            packageJson[dependency] = {}
        }

        if(!packageJson[dependency].basePath){
            packageJson[dependency].basePath = path.join(bowerDirectory, "/", dependency)
        }

        if(!packageJson[dependency].main){
            bowerJsonPath = path.join(packageJson[dependency].basePath, "/", "bower.json");
            if(!fs.existsSync(bowerJsonPath)){
                bowerJsonPath = path.join(packageJson[dependency].basePath, "/", ".bower.json");
                if(!fs.existsSync(bowerJsonPath)){
                    throw new PluginError(PLUGIN_NAME, "The bower package " + dependency + " has no bower.json, use the overrides property in your bower.json");
                }
            }
            var json = JSON.parse(fs.readFileSync(bowerJsonPath))
            if(!json.main){
                throw new PluginError(PLUGIN_NAME, "The bower package " + dependency + " has no main file(s), use the overrides property in your bower.json");
            }
            packageJson[dependency].main = json.main
        }

        addToSrcs(srcs, packageJson[dependency].basePath, packageJson[dependency].main);
    }

    return gulp.src(srcs);
}

module.exports = gulpBowerFiles