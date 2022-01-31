//===========================================================
// Requires
//===========================================================

const { series, src, dest, watch, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass")); // sass
const sourcemaps = require("gulp-sourcemaps"); // referencia a archivos originales
const rename = require("gulp-rename"); // renombrar archivos
const browserSync = require("browser-sync").create(); // browserSync
const connect = require("gulp-connect-php"); //browserSync PHP

//========================= Utilidades CSS
const postcss = require("gulp-postcss"); //procesamiento a css (autoprefixer,cssnano)
const autoprefixer = require("autoprefixer"); // autoprefixer al css
const cssnano = require("cssnano"); // version optimizada del css

//========================= Utilidades JS
const terser = require("gulp-terser-js"); // version optimizada del js

//===========================================================
// Paths
//===========================================================

// Directorios de origen
const paths = {
    scss: "src/scss/custom/**/*.scss",
    bootstrap: "src/scss/bootstrap/*.scss",
    js: "public/js/**/*js",
    html: "public/**/*.html",
    php: "./**/*.php",
};

// Directorios de destino
const pathsBuild = {
    css: "public/css/custom",
    bootstrap: "public/css/bootstrap",
    js: "public/js",
};

// Archivo de directorio de servidor
const localhost = "http://localhost/delivery/public"; // Se remplaza con el directorio del archivo en el localhost

//===========================================================
// Funciones
//===========================================================

function produccionCSS() {
    return src(paths.scss)
        .pipe(sass())
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(rename({ suffix: ".min" }))
        .pipe(dest(pathsBuild.css));
}

function produccionBootstrap() {
    return src(paths.bootstrap)
        .pipe(sass())
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(rename({ suffix: ".min" }))
        .pipe(dest(pathsBuild.bootstrap));
}

function produccionJS() {
    return src(paths.js)
        .pipe(terser())
        .pipe(rename({ suffix: ".min" }))
        .pipe(dest(pathsBuild.js));
}

function bootstrap() {
    return src(paths.bootstrap)
        .pipe(sass())
        .pipe(rename({ suffix: ".min" }))
        .pipe(dest(pathsBuild.bootstrap));
}

function css() {
    return src(paths.scss)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(rename({ suffix: ".min" }))
        .pipe(sourcemaps.write("."))
        .pipe(dest(pathsBuild.css))
        .pipe(browserSync.stream());
}

function watchArchivos() {
    watch(paths.html, recargar);
    watch(paths.js, recargar);
    watch(paths.scss, css);
}

function watchArchivosPHP() {
    watch(paths.php, recargar);
    watch(paths.scss, css);
    // watch(paths.js, javascript);
}

function syncDinamic() {
    connect.server({}, function () {
        browserSync.init({
            proxy: localhost,
        });
    });
}

function syncStatic() {
    browserSync.init({
        server: {
            baseDir: "./",
        },
    });
}

function recargar(cb) {
    browserSync.reload();
    cb();
}

exports.css = css;
exports.bootstrap = bootstrap;

// exports.produccion = series(produccionCSS, produccionBootstrap, produccionJS);
exports.produccion = series(produccionCSS, produccionBootstrap);
exports.estatico = parallel(css, syncStatic, watchArchivos);
exports.dinamico = parallel(css, syncDinamic, watchArchivos);

exports.default = series(css, watchArchivos);
