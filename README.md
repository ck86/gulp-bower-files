![status](https://secure.travis-ci.org/ck86/gulp-bower-files.png?branch=master)

## Information

<table>
<tr>
<td>Package</td>
<td>gulp-bower-files</td>
</tr>
<tr>
<td>Description</td>
<td>Build gulp.src() of your bower package's main files.</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.10</td>
</tr>
</table>

## Usage

```javascript
var gulpBowerFiles = require('gulp-bower-files');

gulp.task("bower-files", function(){
    gulpBowerFiles().pipe(gulp.dest("./lib"));
});
```

This will read your `bower.json`, iterate through your dependencies and build a `gulp.src()` with all files defined in the main property of the packages `bower.json`.
You can override the behavior if you add an `overrides` property to your own `bower.json`. E.g.:

## Options

### Overrides Options

These options can be set directly in your `bower.json` file, e.g.:

```json
{
    "name": "your-package-name",
    "dependencies": {
        "BOWER-PACKAGE": "*"
    },
    "overrides": {
        "BOWER-PACKAGE": {
            // Here you can override the main files or ignoring this package, for more info see options
        }
    }
}
```

#### main

Type: `String`or `Array` or `Object`

You can specify which files should be selected. You can `gulp-bower-files` select files based on the `process.env.NODE_ENV` if you provide an `Object` with `keys` as the environment, e.g.:

```json
{
    "overrides": {
        "BOWER-PACKAGE": {
            "main": {
                "development": "file.js",
                "production": "file.min.js",
            }
        }
    }
}
```

#### ignore

Type: `Boolean` Default: `false`

Set to `true` if you want to ignore this package.

#### dependencies

Type: `Object`

You can override the dependencies of a package. Set to `null` to ignore the dependencies.

### Common Options

These options can be passed to this plugin, e.g: `bowerFiles(/* options*/)`

#### debugging

Type: `boolean` Default: `false`

Set to `true` to enable debugging output.

#### main

Type: `String` or `Array` or `Object` Default: `null`

You can specify for all packages a default main property which will be used if the package does not provide a main property.

#### env

Type: `String` Default: `process.env.NODE_ENV`

If `process.env.NODE_ENV` is not set you can use this option.

## LICENSE

(MIT License)

Copyright (c) 2013 Christopher Knötschke <cknoetschke@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
