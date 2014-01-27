var gulpBowerFiles = require("../");
var es = require("event-stream");
var path = require("path");
var should = require("should");

describe('gulpBowerFiles()', function () {
    var opts = {
        paths: {
            bowerJson: __dirname + "/bower.json",
            bowerrc: __dirname + "/.bowerrc"
        }
    };

    it('should select the expected files', function (done) {
        var stream = gulpBowerFiles(opts);

        var expectedFiles = [
            path.join(__dirname, "/fixtures/simple/simple.js"),
            path.join(__dirname, "/fixtures/overwritten/another.js"),
            path.join(__dirname, "/fixtures/multi/multi.js"),
            path.join(__dirname, "/fixtures/multi/multi.css"),
            path.join(__dirname, "/fixtures/hasPackageNoBower/hasPackageNoBower.js")
        ];

        var srcFiles = [];

        stream.on("end", function(){
            srcFiles.should.be.eql(expectedFiles);
            done();
        });

        stream.pipe(es.map(function(file, callback){
            srcFiles.push(file.path);
            callback();
        }));
    });

    it("should throw an exception when bower.json, package.json or ./bower.json's override are not found", function(done) {
        try {
            gulpBowerFiles({paths: {
                  bowerJson: __dirname + "/requiresoverride_bower.json",
                  bowerrc: __dirname + "/.bowerrc"
            }});
            
            should.fail("due to lack of configuration.");
        } catch (e) {
            e.message.should.containEql("bower package noconfig has no bower.json or package.json"); 
            done();
        }
    });

});