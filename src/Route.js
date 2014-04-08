'use strict';

var RouteParam = require( './RouteParam' );

function Route( path, fn ) {
    this.path = path;
    this.fn = fn;
    this.segments = path.split( '/' );
    this.params = [];
    this.eventPath = this.getEventPath();
}

Route.prototype = {
    getEventPath: function () {
        return this.segments.map( this.formatSegment() ).join( '/' );
    },
    formatSegment: function () {
        var route = this;
        return function ( segment, position ) {
            if ( segment.charAt( 0 ) === ':' ) {
                route.params.push( new RouteParam( segment.substring( 1 ), position ) );
                return '_';
            }
            return segment === '*' ? '*' : segment;
        };
    }
};

module.exports = Route;