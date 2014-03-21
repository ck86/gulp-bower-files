var path    = require("path");
var fs      = require("fs");
var Package = require("./package");

var PackageCollection = function(opts) {
    this.opts               = opts;
    this.overrides          = {};
    this._queue             = [];
    this._lastQueueLength   = 0;
    this._packages          = {};
    this._processed         = {};
}

PackageCollection.prototype = {
    add: function(name, path) {
        if(typeof this._packages[name] !== "undefined")
            return;

        this._packages[name] = true;

        var opts = this.overrides[name] || {}
        opts.name = name;
        opts.path = path;

        this._packages[name] = new Package(opts, this);
    },

    collectPackages: function(opts) {
        try {
            var bowerJson = require(opts.paths.bowerJson);

            this.overrides = bowerJson.overrides || {};

            if(opts.includeDev === true && bowerJson.devDependencies) {
                for(var name in bowerJson.devDependencies) {
                    bowerJson.dependencies[name] = bowerJson.devDependencies[name]
                }
            }

            for(var name in bowerJson.dependencies) {
                this.add(name, path.join(opts.paths.bowerDirectory, "/", name));
            }
        } catch(e) {
            throw e;
        }
    },

    getSrcs: function() {
        for(var name in this._packages) {
            this._queue.push(this._packages[name]);
        }

        return this.process();
    },

    process: function() {
        var queue = this._queue;
        var srcs = [];
        var force = false;

        if(this._lastQueueLength === queue.length) {
            force = true;
        }

        this._lastQueueLength = queue.length;

        this._queue = [];

        queue.forEach(function(package) {
            var packageSrcs = package.getSrcs(force);

            if(packageSrcs === false) {
                return this._queue.push(package);
            }

            srcs.push.apply(srcs, packageSrcs);
            this._processed[package.name] = true;
        }.bind(this));

        if(this._queue.length) {
            srcs.push.apply(srcs, this.process());
        }

        return srcs;
    }
};

module.exports = PackageCollection;