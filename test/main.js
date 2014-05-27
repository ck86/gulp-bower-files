var gulpBowerFiles = require("../");
var es = require("event-stream");
var path = require("path");
var should = require("should");

describe('gulpBowerFiles()', function () {
    function streamFromConfig(path, options) {
        options = options || {};

        if(!options.paths)
            options.paths = {};

        if(!options.paths.bowerJson)
            options.paths.bowerJson = __dirname + path;

        if(!options.paths.bowerrc)
            options.paths.bowerrc = __dirname + "/.bowerrc"

        return gulpBowerFiles(options);
    }

    function expect(filenames) {
        var expectedFiles = [].concat(filenames).map(function(filename) {
            return path.join(__dirname, filename);
        });

        function run(path, options, done) {
            var stream = streamFromConfig(path, options);
            var srcFiles = [];

            stream.on("end", function(){
                expectedFiles.should.be.eql(srcFiles);
                if(done) {
                    done();
                }
            });

            stream.pipe(es.map(function(file, callback){
                srcFiles.push(file.path);
                callback();
            }));
        }

        return {
            fromConfig: function(path, options) {
                return {
                    when: function(done) { run(path, options, done); }
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

    it('should select the expected files with relative path', function (done) {
        expect([
            "/fixtures/simple/simple.js",
            "/fixtures/overwritten/another.js",
            "/fixtures/multi/multi.js",
            "/fixtures/multi/multi.css",
            "/fixtures/hasPackageNoBower/hasPackageNoBower.js",
            "/fixtures/deepPaths/lib/deeppaths.js",
            "/fixtures/decoy/decoy.js"
        ]).fromConfig("/_bower.json", {
            paths: {
                bowerJson: "./test/_bower.json",
                bowerDirectory: "./test/fixtures",
            }
        }).when(done);
    });

    it("should ignore packages without any json files", function(done) {
        expect([
            "/fixtures/simple/simple.js"
        ]).fromConfig("/_nojson_bower.json").when(done);
    });

    it("should select files via default option", function(done) {
        expect([
            "/fixtures/noconfig/noconfig.js",
            "/fixtures/simple/simple.js"
        ]).fromConfig("/_nojson_bower.json", { main: "./**/*.js" }).when(done);
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
        ]).fromConfig("/_includedev_bower.json", { includeDev: true }).when(done);
    });

    it("should get devDependencies from a bower.json with no 'dependencies' section", function(done) {
        expect([
            "/fixtures/includeDev/includeDev.js"
        ]).fromConfig("/_includedev_devdepsonly_bower.json", { includeDev: true }).when(done);
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

    it("should select prod.js on prod environment", function(done) {
        process.env.NODE_ENV = "prod";
        expect([
            "/fixtures/envBased/prod.js"
        ]).fromConfig("/_env_based_bower.json").when(done);
    });

    it("should select dev.js on dev environment", function(done) {
        process.env.NODE_ENV = "dev";
        expect([
            "/fixtures/envBased/dev.js"
        ]).fromConfig("/_env_based_bower.json").when(done);
    });

    it("should not throw an exception if main file does not exists and checkExistence option is false", function() {
        var when = expect([]).fromConfig("/_not_existing_file.json").when;

        when.should.not.throw();
    });

    it("should throw an exception if main file does not exists and checkExistence option is true", function() {
        var when = expect([]).fromConfig("/_not_existing_file.json", { checkExistence: true }).when;

        when.should.throw();
    });

    it("should not throw an exception if there are no packages", function() {
        var when = expect([]).fromConfig("/_empty.json").when;

        when.should.not.throw();
    });
});