'use strict';

function RouterEvent( path, data ) {
    this.path = path;
    this.currentPath = path;
    this.current = this.splitPath();
    this.segments = this.splitPath();
    this.data = this.getData( data );
}

RouterEvent.prototype = {
    splitPath: function () {
        return this.path.split( '/' );
    },
    getData: function ( args ) {
        return Array.call.apply( Array, args );
    },
    updatePath: function () {
        this.currentPath = this.current.join( '/' );
        return this.currentPath;
    }
};

module.exports = RouterEvent;