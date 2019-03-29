var thirdPartyJs = [
	'js/dependencies/jquery/jquery-2.1.1.min.js',
    'js/dependencies/angular/angular.min.js',
    'js/dependencies/inputmask/jquery.inputmask.bundle.js',
    'js/dependencies/highcharts/highstock.src.js',
    'js/dependencies/rxjs/rx.all.min.js',
    'js/dependencies/**/*.js'
]

var appJs = [
	 // Load utilities
    'js/common/directives/directives.js',
    'js/common/filters/filters.js',
    'js/common/models/models.js',
    'js/common/models-mock/models.js',
    'js/common/services/services.js',

    'js/common/directives/**/*.js',
    'js/common/filters/**/*.js',
    'js/common/models/**/*.js',
    'js/common/models-mock/**/*.js',
    'js/common/services/**/*.js',

    // All of the rest of your client-side js files
    // will be injected here in no particular order.
    'js/app/**/**.module.js',
    'js/app/**/*.js',
    'js/app.js'
]

var jsToInject = thirdPartyJs.concat(appJs);


var jsPaths = jsToInject.map(function (path) {
    return './assets/' + path;
});

var jsPublicPaths = jsToInject.map(function (path) {
    return './www/' + path;
});

var buildPaths = jsToInject.map(function (path) {
    return 'assets/' + path;
}).concat(['!assets/js/common/models-mock/**/*.js']);

var thirdPartyPaths = thirdPartyJs.map(function (path) {
    return 'assets/' + path;
})

var appPaths = appJs.map(function (path) {
    return 'assets/' + path;
}).concat(['!assets/js/common/models-mock/**/*.js']);


module.exports = {

    // JavaScript
    js: 'assets/js/**/*',
    jsPaths: jsPaths,
	buildPaths: buildPaths,
	thirdPartyPaths:thirdPartyPaths,
	appPaths:appPaths,

	json:'assets/js/**/*.json',

    // Less
    less: 'assets/styles/main.less',
    lesses: 'assets/styles/**/*',

    // HTML
    index: 'assets/index*.html',
    html: 'assets/templates/**/*.html',

    //sw
    sw: 'assets/sw.js',

    // Images
    images: 'assets/images/**/*',

    // Fonts
    fonts: 'assets/fonts/**/*',

    // SVG
    svg: 'svg/raw/*.svg',
    svgDest: 'assets/',

    //Help
    help: 'help/**/*',

    // Linker
    publicJSLinker: jsPublicPaths,
    publicCSSLinker: './www/styles/main.css',
    distJSLinker: './dist/js/*.js',
    distCSSLinker: './dist/styles/*.css',

    // public
    publicDir: './www/',
    publicHelpDir: './www/help',
    publicDirJS: './www/js',
    publicDirCSS: './www/styles',
    publicDirHTML: './www/templates',
    publicDirFonts: './www/fonts',
    publicDirImages: './www/images',

    //src
    srcDir: './assets/',

    //tmp
    tmpDir: './tmp/',
    tmpDirJS: './tmp/js',
    tmpDirCSS: './tmp/styles',

    // dist
    distDir: './dist/',
    distDirJS: './dist/js',
    distDirCSS: './dist/styles',
    distDirHTML: './dist/templates',
    distDirFonts: './dist/fonts',
    distDirImages: './dist/images'
}
