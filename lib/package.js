var path    = require("path");
var fs      = require("fs");
var logger  = require("./logger");

/**
 * Holds information of the bower package
 *
 * @class Package
 */

/**
 * @constructor
 * @param {Object}              opts
 * @param {PackageCollection}   collection
 */
var Package = function(opts, collection) {
    this.collection        = collection;
    this.name           = opts.name || null;
    this.path           = opts.path || null;
    this.main           = opts.main || null;
    this.dependencies   = opts.dependencies;
    this.ignore         = opts.ignore || false;
    this.debugging      = collection.debugging || false;

    if(this.ignore) return;

    this.collectData();
    this.addDependencies();
}

Package.prototype = {
    /**
     * Collects data from first found config file
     */
    collectData: function() {
        var paths = [
            path.join(this.path, "bower.json"),
            path.join(this.path, "package.json"),
            path.join(this.path, "component.json"),
            path.join(this.path, ".bower.json")
        ];

        var data = paths.reduce(function(prev, curr) {
            if(prev !== null) return prev;

            if(!fs.existsSync(curr)) return prev;

            try {
                return JSON.parse(fs.readFileSync(curr, "utf8"));;
            } catch(e) {
                return null;
            }
        }, null);

        if(data === null)
            return;

        if(!this.main && data.main)
            this.main = data.main;

        if(this.dependencies === undefined && data.dependencies && data.dependencies) 
            this.dependencies = data.dependencies;
    },

    /**
     * Adds package dependencies to the collection
     */
    addDependencies: function() {
        for(var name in this.dependencies) {
            this.collection.add(name, path.join(this.path, "..", name));
        }
    },

    /**
     * Gets main files of the package
     *
     * @param  {Boolean}    force  If true it will not wait for the dependencies
     * @return {Mixed}      Returns false if the package has dependencies which were not processed yet otherwise an array of file paths
     */
    getFiles: function(force) {
        if(this.ignore) return [];
        if(this.main === null && (this.main = this.collection.opts.main) === null) return [];

        var main = this.main;
        var files = [];

        if(typeof main === "object" && !Array.isArray(main)) {
            if(!(main = main[this.collection.opts.env])) return [];
        }

        main = Array.isArray(main) ? main : [main];

        if(force !== true) {
            for(var name in this.dependencies) {
                if(this.collection._processed[name] !== true) {
                    return false;
                }
            }
        }

        main.forEach(function(file) {
            files.push(path.join(this.path, file));
        }.bind(this));

        if(this.debugging) {
            files.forEach(function(file) {
                logger("Package\t\t", "select file\t", this.name, file);
            }.bind(this));
        }

        if(this.collection.opts.checkExistence === true) {
            files.forEach(function(file) {
                if(!fs.existsSync(file)) {
                    throw new Error("File on path '" + file + "' does not exist.");
                }
            });
        }

        return files;
    }
};

module.exports = Package;