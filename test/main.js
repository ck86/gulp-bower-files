var gulpBowerFiles = require("../");
var es = require("event-stream");
var path = require("path");
var should = require("should");

describe('gulpBowerFiles()', function () {
    
    function streamFromConfig(path) { 
            return gulpBowerFiles({paths: {
                  bowerJson: __dirname + path,
                  bowerrc: __dirname + "/.bowerrc"
            }});
    }

    function expect(filenames) {
      var expectedFiles = [].concat(filenames).map(function(filename) {
          return path.join(__dirname, filename);
      });
      function run(path, done) {
          var stream = streamFromConfig(path);
          var srcFiles = [];

          stream.on("end", function(){
              srcFiles.should.be.eql(expectedFiles);
              done();
          });

          stream.pipe(es.map(function(file, callback){
              srcFiles.push(file.path);
              callback();
          }));
      }
        
      return {
        fromConfig: function(path) {
            return {
              when: function(done) { run(path, done); }
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
            "/fixtures/deepPathsAndRepeats/lib/deeppathsandrepeats.js"
        ]).fromConfig("/bower.json")
          .when(done);
    });

    it("should throw an exception when bower.json, package.json or ./bower.json's override are not found", function(done) {
        try {
            streamFromConfig("/requiresoverride_bower.json");
            
            should.fail("due to lack of configuration.");
        } catch (e) {
            e.message.should.containEql("bower package noconfig has no bower.json or package.json"); 
            done();
        }
    });

    it("should recurse through dependencies pulling in their dependencies", function(done) {
        expect([
            "/fixtures/recursive/recursive.js",
            "/fixtures/simple/simple.js"
        ]).fromConfig("/recursive_bower.json")
          .when(done);
    });

    it("should not get hungup on cyclic dependencies", function(done) {
        expect([
            "/fixtures/cyclic-a/cyclic-a.js",
            "/fixtures/cyclic-b/cyclic-b.js"
        ]).fromConfig("/cyclic_bower.json")
          .when(done);    
    });
});