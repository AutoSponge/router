'use strict';

var Route = require( './Route' );
var RouterResponse = require( './RouterResponse' );
var RouterEvent = require( './RouterEvent' );

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

    this.addRoute = function ( path, fn, force ) {
        var route = new Route( path, fn );
        routes[route.eventPath] = force ? route : routes[route.eventPath] || route;
    };

    this.removeRoute = function ( path ) {
        var route = new Route( path, null );
        delete routes[route.eventPath];
    };

    this.handleEvent = function ( event ) {
        var router = this;
        var route;
        route = routes[event.updatePath()];
        return route && new RouterResponse( event, route, this.reduceSpecificity.bind( this, event ) );
    };
}

Router.create = function () {
    return new Router();
};

Router.prototype = {

    match: function ( path ) {
        var event = path.split ? new RouterEvent( path, arguments ) : path;
        return this.handleEvent( event ) || this.reduceSpecificity( event );
    },

    reduceSpecificity: function ( event ) {
        return [
            reduceExact,
            reduceWildCard,
            reduceParam,
            reduceParamWildCard
        ].some( processSpecificity( event, event.current.slice( -2 ) ) ) &&
            this.match( event );
    },

    addHandler: function ( fn, force ) {
        var self = this;
        return function ( route ) {
            return self.addRoute( route, fn, force );
        };
    }

};

Router.instance = new Router();

module.exports = Router;
