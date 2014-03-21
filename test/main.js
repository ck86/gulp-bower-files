var gulpBowerFiles = require("../");
var es = require("event-stream");
var path = require("path");
var should = require("should");

describe('gulpBowerFiles()', function () {
    
    function streamFromConfig(path, includeDev) { 
        if (!includeDev)
            includeDev = false;
        
        return gulpBowerFiles({
            paths: {
                bowerJson: __dirname + path,
                bowerrc: __dirname + "/.bowerrc"
            },
            includeDev: includeDev,
            debugging: true
        });
    }

    function expect(filenames) {
        var expectedFiles = [].concat(filenames).map(function(filename) {
            return path.join(__dirname, filename);
        });

        function run(path, includeDev, done) {
            var stream = streamFromConfig(path, includeDev);
            var srcFiles = [];

            stream.on("end", function(){
                expectedFiles.should.be.eql(srcFiles);
                done();
            });

            stream.pipe(es.map(function(file, callback){
                srcFiles.push(file.path);
                callback();
            }));
        }
            
        return {
            fromConfig: function(path, includeDev) {
                return {
                    when: function(done) { run(path, includeDev, done); }
                }
            }
        }
    }

    it('should select the expected files', function (done) {
        expect([
            "/fixtures/simple/simple.js",
            "/fixtures/overwritten/another.js",
            "/fixtures/multi/multi.js",
            "/fixtures/multi/multi.css",
            "/fixtures/hasPackageNoBower/hasPackageNoBower.js",
            "/fixtures/deepPaths/lib/deeppaths.js",
            "/fixtures/decoy/decoy.js"
        ]).fromConfig("/_bower.json").when(done);
    });

    it("should ignore packages without any json files", function(done) {
        expect([
            "/fixtures/simple/simple.js"
        ]).fromConfig("/_nojson_bower.json").when(done);
    });

    it("should recurse through dependencies pulling in their dependencies", function(done) {
        expect([
            "/fixtures/simple/simple.js",
            "/fixtures/recursive/recursive.js"
        ]).fromConfig("/_recursive_bower.json").when(done);
    });

    it("should not get hungup on cyclic dependencies", function(done) {
        expect([
            "/fixtures/cyclic-a/cyclic-a.js",
            "/fixtures/cyclic-b/cyclic-b.js",
        ]).fromConfig("/_cyclic_bower.json").when(done);    
    });

    it("should get devDependencies", function(done) {
        expect([
            "/fixtures/simple/simple.js",
            "/fixtures/includeDev/includeDev.js"
        ]).fromConfig("/_includedev_bower.json", true).when(done);    
    });

    it("should not load any deeper dependencies", function(done) {
        expect([
            "/fixtures/recursive/recursive.js"
        ]).fromConfig("/_dependencies_bower.json").when(done);
    });

    it("should load other dependencies than defined", function(done) {
        expect([
            "/fixtures/decoy/decoy.js",
            "/fixtures/recursive/recursive.js"
        ]).fromConfig("/_other_dependencies_bower.json").when(done);
    });
});