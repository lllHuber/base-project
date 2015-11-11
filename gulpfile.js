// LSTV TEMPLATE GULPFILE
// ------------------------------

// 1. Gulp Plugins
// 2. Paths
// 3. Variables
// 4. Environment
// 5. Tasks
// 6. Watches
// 7. Builds


// 1. GULP PLUGINS
// ------------------------------

var gulp = require("gulp");
var sequence = require("run-sequence");
var rimraf = require("rimraf");
var plugins = require('gulp-load-plugins')({
	rename: {
		"gulp-autoprefixer": "autoprefixer",
		"gulp-compass": "compass",
		"gulp-concat": "concat",
		"gulp-connect": "connect",
		"gulp-if": "gulpif",
		"gulp-minify-html" : "minifyHTML",
		"gulp-open": "open",
		"gulp-sass": "sass",
		"gulp-uglify": "uglify"
	}
});



// 2. PATHS
// ------------------------------
	
//external libraries (add paths to all files to include in the build process)
var bowerJS = [
		"bower_components/jquery/dist/jquery.js"
	],
	bowerCSS = [
		""
	];

//project files
var projectJS = ["components/js/functions.js"];
var projectSCSS = ["components/scss/*.scss"];
var projectHTML = ["builds/development/*.html"];

//combined arrays of source files
var sourcesJS = bowerJS.concat(projectJS);
var sourcesSCSS = bowerCSS.concat(projectSCSS);
var sourcesHTML = projectHTML;



// 3. VARIABLES
// ------------------------------

var projectName = "project-name",
	outputDir = "",
	sassStyle = ""
	env = "";



// 5. TASKS
// ------------------------------

// set environment to development
gulp.task("development", function() {
    process.env.NODE_ENV = "development";
    env = process.env.NODE_ENV;
	outputDir = "builds/development";
	sassStyle = "expanded";
});

// set environment to production
gulp.task("production", function() {
    process.env.NODE_ENV = "production";
    env = process.env.NODE_ENV;
    outputDir = "builds/production";
	sassStyle = "compressed";
});

// clean production directory before deployment
gulp.task("clean", function (cb) {
	rimraf("builds/production/*", cb);
});

// concatinate and minify styles
gulp.task("sass", function () {
	gulp.src(projectSCSS)
		.pipe(plugins.compass({
			sass: "components/scss",
			css: outputDir + "/css",
			style: sassStyle
		}))
		.pipe(gulp.dest(outputDir + "/css"))
		.pipe(plugins.connect.reload())
	;
});

// concatinate and minify scripts
gulp.task("js", function () {
	gulp.src(sourcesJS)
		.pipe(plugins.concat("scripts.js"))
		.pipe(plugins.gulpif(env === "production", plugins.uglify()))
		.pipe(gulp.dest(outputDir + "/js"))
		.pipe(plugins.connect.reload())
	;
});

// minify html
gulp.task("html", function () {
	gulp.src(sourcesHTML)
		.pipe(plugins.gulpif(env === "production", plugins.minifyHTML()))
		.pipe(gulp.dest(outputDir))
		.pipe(plugins.connect.reload())
	;
} );

// set up a server with automatic reload
gulp.task("server", function () {
	plugins.connect.server({
		root: outputDir,
		port: 7777,
		livereload: true
	});	
	gulp.src(outputDir + "/")
  		.pipe(plugins.open({
  			uri: "http://localhost:7777"
  		}))
  	;
})



// 6. WATCHES
// ------------------------------

gulp.task("watch", function () {
	gulp.watch(projectJS, ["js"]);
	gulp.watch(projectSCSS, ["sass"]);
	gulp.watch(projectHTML, ["html"]);
});



// 7. BUILDS
// ------------------------------

// build development files
gulp.task("develop", function (cb) {
	sequence("development", ["sass", "js", "html"], "server", "watch", cb);
});

// build production files
gulp.task("deploy", function (cb) {
	sequence("clean", "production", ["sass", "js", "html"], "server", cb);	
}); 