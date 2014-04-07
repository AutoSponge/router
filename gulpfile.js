var gulp = require( 'gulp' ),
    jshint = require( 'gulp-jshint' ),
    complexity = require( 'gulp-complexity' );

gulp.task( 'lint', function () {
    return gulp.src( 'src/*.js' )
        .pipe( jshint() )
        .pipe( jshint.reporter( require( 'jshint-stylish' ) ) );
} );

gulp.task( 'complexity', function () {
    return gulp.src( 'src/*.js' )
        .pipe( complexity() );
} );

gulp.task( 'default', ['lint', 'complexity'] );