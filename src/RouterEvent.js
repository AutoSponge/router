'use strict';

function RouterEvent( path ) {
    this.path = path;
    this.current = path.split( '/' );
    this.segments = path.split( '/' );
}

module.exports = RouterEvent;