var path = require("path");

var Package = function(opts, manager) {
    this.manager = manager;
    this.name           = opts.name || null;
    this.path           = opts.path || null;
    this.main           = opts.main || null;
    this.dependencies   = opts.dependencies;
    this.ignore         = opts.ignore || false;

    if(this.ignore) return;

    this.collectData();
    this.addDependencies();
}

Package.prototype = {
    collectData: function() {
        var paths = [
            path.join(this.path, ".bower.json"),
            path.join(this.path, "bower.json"),
            path.join(this.path, "package.json"),
            path.join(this.path, "component.json")
        ];
        
        var data = paths.reduce(function(prev, curr) {
            if(prev !== null) return prev;

            try {
                return require(curr);
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

    addDependencies: function() {
        for(var name in this.dependencies) {
            this.manager.add(name, path.join(this.path, "..", name));
        }
    },

    getSrcs: function(force) {
        if(this.ignore) return [];
        if(this.main === null) return [];
        
        var main = Array.isArray(this.main) ? this.main : [this.main];
        var srcs = [];

        if(force !== true) {
            for(var name in this.dependencies) {
                if(this.manager._processed[name] !== true) {
                    return false;
                }
            }
        }

        main.forEach(function(file) {
            srcs.push(path.join(this.path, file));
        }.bind(this));

        return srcs;
    }
};

module.exports = Package;