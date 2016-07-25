var gulp = require('gulp');
var gulpWatch = require('gulp-watch');
var del = require('del');
var runSequence = require('run-sequence')
var argv = process.argv;
var shell = require('gulp-shell');
var xpath = require('xpath');
var xmldom = require('xmldom').DOMParser;
var mkdirp = require('mkdirp');
var fs = require('fs');
var args = require('yargs').argv;
var rename = require('gulp-rename');
var ngConstant = require('gulp-ng-constant');
var gutil = require('gulp-util');
var jsonEditor = require('gulp-json-editor');
/******************************************************************************
 ********************************** Ionic *************************************
 ******************************************************************************/

gulp.task('serve:before', ['watch']);
gulp.task('emulate:before', ['build']);
gulp.task('deploy:before', ['build']);
gulp.task('build:before', ['build']);

// we want to 'watch' when livereloading
var shouldWatch = argv.indexOf('-l') > -1 || argv.indexOf('--livereload') > -1;
gulp.task('run:before', [shouldWatch ? 'watch' : 'build']);

var buildBrowserify = require('ionic-gulp-browserify-typescript');
var buildSass = require('ionic-gulp-sass-build');
var copyHTML = require('ionic-gulp-html-copy');
var copyFonts = require('ionic-gulp-fonts-copy');
var copyScripts = require('ionic-gulp-scripts-copy');

var isRelease = argv.indexOf('--release') > -1;

gulp.task('watch', ['clean'], function (done) {
    runSequence(
        ['sass', 'html', 'fonts', 'scripts'],
        function () {
            gulpWatch('app/**/*.scss', function () {
                gulp.start('sass');
            });
            gulpWatch('app/**/*.html', function () {
                gulp.start('html');
            });

            buildBrowserify(
                {
                    cache: {},
                    packageCache: {},
                    watch: true,
                    watchifyOptions: {
                        poll: true
                    },
                    onLog: function (log) {
                        gutil.log(log);
                        gulp.start('lint');
                    }
                })
                .on('end', done);
        }
    );
});


gulp.task('build', ['clean'], function (done) {
    runSequence(
        ['sass', 'html', 'fonts', 'scripts'], //, 'lint'],
        function () {

            buildBrowserify({
                minify: isRelease,
                browserifyOptions: {
                    debug: !isRelease
                },
                uglifyOptions: {
                    mangle: false
                }
            })
                .on('end', done);
        }
    );
});

gulp.task('sass', buildSass);
gulp.task('html', copyHTML);
gulp.task('fonts', copyFonts);

// Modified Ionic 2 gulp-copy-scripts --> add helpers here
// - Pets 20/5 16
gulp.task('scripts', function () {
    return copyScripts({
        src: [
            'node_modules/es6-shim/es6-shim.min.js',
            'node_modules/es6-shim/es6-shim.map',
            'node_modules/zone.js/dist/zone.js',
            'node_modules/reflect-metadata/Reflect.js',
            'node_modules/reflect-metadata/Reflect.js.map',
            'www/lib/exif-parser.0.9.1.js',
            'app/locale/no.json',
            'app/locale/sv.json',
            'app/proto/pokemon.proto'
        ]
    })
});

gulp.task('clean', function () {
    return del('www/build');
});


/******************************************************************************
 ********************************** Self *************************************
 ******************************************************************************/


function getAppVersion() {
    var doc = new xmldom().parseFromString(fs.readFileSync("config.xml", "utf8"));
    return xpath.select("/*/@version", doc)[0].value;
}

function getAppName() {
    var doc = new xmldom().parseFromString(fs.readFileSync("config.xml", "utf8"));
    var select = xpath.useNamespaces({"widgets": "http://www.w3.org/ns/widgets"});
    return select("//widgets:name/text()", doc)[0].nodeValue;
}

const customTsReport = function (output, file, options) {
    console.log();
    console.log('******************** TSLINT *******************');
    console.log();

    for (var i = 0; i < output.length; i++) {
        var item = output[i];
        console.log(item.name + "[" + (item.startPosition.line + 1) + ", " +
            (item.startPosition.character + 1) + "]: " + item.failure);
    }

    console.log();
    console.log('Please fix errors, before build');
    console.log();

    if (!args.l && !args.livereload)
        return process.exit("Error");
};

// run tslint against all typescript
gulp.task('lint', function () {
    if (args.nolint) {
        return;
    }

    var tslint = require('gulp-tslint');

    return res = gulp.src(['app/**/*.ts', '!*.spec.ts', '!**/*.spec.ts', '!**/*.e2e.ts','!**/*.es6.d.ts', '!**/typings/**'])
        .pipe(tslint({
            // contains rules in the tslint.json format
            configuration: "lint/tslint.json"
        }))
        .pipe(tslint.report(customTsReport))
});

gulp.task('configxml', function () {
    var env = args.env || 'dev';
    var locale = args.locale || 'no';

    return gulp.src("config." + locale + "." + env + ".xml")
        .pipe(rename("config.xml"))
        .pipe(gulp.dest("./"));
});

// gulp-task create new config
// attr 'env'    : dev, demo, prod
// attr 'locale' : no, sv
// example: 'gulp config --env dev --locale no'
gulp.task('config', ['configxml'], function () {
    var env = args.env || 'demo';
    var locale = args.locale || 'no';
    var filename = 'app/config/' + env + '.' + locale + '.ts';

    return gulp.src(filename)
        .pipe(rename("config.ts"))
        .pipe(gulp.dest('www/build/config'))
        .pipe(gulp.dest('app/config/'))
});
