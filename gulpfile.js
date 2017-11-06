var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    maps = require('gulp-sourcemaps'),
    del = require('del');

gulp.task("concatScripts", function() {
    return gulp.src([
        'public/js/angularRoot.js',
        'public/js/siteClient.js',
        'public/js/controllers/homeController.js',
        'public/js/controllers/chatController.js',
        'public/js/controllers/loginController.js',
        'public/js/controllers/registerController.js',
        'public/js/controllers/messageController.js',
        'public/js/controllers/ranklistController.js',
        'public/js/controllers/statisticsController.js',
        'public/js/controllers/userController.js',
        'public/js/controllers/includes/formUploadController.js',
        'public/js/directives/validation.js',
        'public/js/directives/fileread.js'
    ])
        .pipe(maps.init())
        .pipe(concat('app.js'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('public/build/js'));
});

gulp.task("minifyScripts", ["concatScripts"], function() {
    return gulp.src("public/build/js/app.js")
        .pipe(uglify())
        .pipe(rename('app.min.js'))
        .pipe(gulp.dest('public/build/js'));
});

gulp.task('compileSass', function() {
    return gulp.src("public/scss/app.scss")
        .pipe(maps.init())
        .pipe(sass())
        .pipe(maps.write('./'))
        .pipe(gulp.dest('public/build/css'));
});

gulp.task("minifySass", ["compileSass"], function() {
    return gulp.src("public/build/css/app.scss")
        .pipe(uglify())
        .pipe(rename('app.min.scss'))
        .pipe(gulp.dest('public/build/css'));
});

gulp.task("concatGameScripts", function() {
    return gulp.src([
        'public/js/game/boot.js',
        'public/js/game/preload.js',
        'public/js/game/mainmenu.js',
        'public/js/game/tiledObjects.js',
        'public/js/game/map.js',
        'public/js/game/Sound.js',
        'public/js/game/skill.js',
        'public/js/game/player.js',
        'public/js/game/playerNinja.js',
        'public/js/game/playerCop.js',
        'public/js/game/game.js',
        'public/js/game/client.js',
        'public/js/game/main.js'

    ])
        .pipe(maps.init())
        .pipe(concat('gameApp.js'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('public/build/js'));
});


gulp.task('watch', function() {
    gulp.watch('public/scss/**/*.scss', ['minifySass']);
    gulp.watch('public/js/**/*.js', ['minifyScripts', 'concatGameScripts']);
});

gulp.task('clean', function() {
    del(['public/build']);
});

gulp.task("default", ['minifyScripts', 'minifySass', 'concatGameScripts', 'watch']);
