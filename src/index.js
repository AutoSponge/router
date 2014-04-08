'use strict';

var Route = require( './Route' );
var RouterResponse = require( './RouterResponse' );
var RouterEvent = require( './RouterEvent' );

function some( arr, fn ) {
    var i, len;
    for ( i = 0, len = arr.length; i < len; i += 1 ) {
        if ( fn( arr[i] ) ) {
            return true;
        }
    }
    return false;
}

function reduceExact( event, slice ) {
    return slice[1] &&
        slice[1] !== '_' &&
        slice[1] !== '*' &&
        event.current.splice( -1, 1, '_' );
}

function rightPadParam( event ) {
    while ( event.segments.length > event.current.length ) {
        event.current.push( '_' );
    }
    return true;
}

function reduceWildCard( event, slice ) {
    return slice[0] !== '_' &&
        slice[1] === '*' &&
        event.current.splice( -2, 2, '_', '_' ) &&
        rightPadParam( event );
}

function reduceParam( event, slice ) {
    return slice[1] === '_' &&
        event.current.splice( -1, 1, '*' );
}

function reduceParamWildCard( event, slice ) {
    return slice[0] === '_' &&
        slice[1] === '*' &&
        event.current.splice( -2, 2, '*' );
}

function processSpecificity( event, slice ) {
    return function ( fn ) {
        return fn( event, slice );
    };
}

function Router() {
    var routes = {};

    this.addRoute = function ( path, fn ) {
        var route = new Route( path, fn );
        routes[route.eventPath] = route;
    };

    this.handleEvent = function ( event ) {
        var route;
        event.path = event.current.join( '/' );
        route = routes[event.path];
        return route && new RouterResponse( event, route );
    };
}

Router.create = function () {
    return new Router();
};

Router.instance = new Router();

Router.prototype = {

    match: function ( path ) {
        var event = path.split ? new RouterEvent( path ) : path;
        return this.handleEvent( event ) || this.reduceSpecificity( event );
    },

    reduceSpecificity: function ( event ) {
        return some( [
            reduceExact,
            reduceWildCard,
            reduceParam,
            reduceParamWildCard
        ], processSpecificity( event, event.current.slice( -2 ) ) ) &&
            this.match( event );
    },

    addHandler: function ( fn ) {
        var self = this;
        return function ( route ) {
            return self.addRoute( route, fn );
        };
    }

};

module.exports = Router;
