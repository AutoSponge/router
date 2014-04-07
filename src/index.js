'use strict';

function RouteParam( name, position ) {
    this.position = position;
    this.name = name;
}

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

function RouterResponse( event, route ) {
    this.event = event;
    this.params = this.getParams( route );
    this.splat = this.getSplat();
    this.route = route.path;
    this.fn = route.fn;
}

RouterResponse.prototype = {
    getParams: function ( route ) {
        return route.params.reduce( this.assignParam(), {} );
    },
    getSplat: function () {
        var lastIdx = this.event.current.length - 1;
        return this.event.current[lastIdx] === '*' ?
               this.event.segments.slice( lastIdx ).join( '/' ) :
               '';
    },
    assignParam: function () {
        var response = this;
        return function ( params, param ) {
            params[param.name] = response.event.segments[param.position];
            return params;
        };
    }
};

function RouterEvent( path ) {
    this.path = path;
    this.current = path.split( '/' );
    this.segments = path.split( '/' );
}

module.exports = (function () {
    var routes = {};

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

    return {
        reset: function () {
            routes = {};
        },
        addRoute: function ( path, fn ) {
            var route = new Route( path, fn );
            routes[route.eventPath] = route;
        },
        handleEvent: function ( event ) {
            var route;
            event.path = event.current.join( '/' );
            route = routes[event.path];
            return route && new RouterResponse( event, route );
        },
        match: function ( path ) {
            var event = path.split ? new RouterEvent( path ) : path;
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
        }
    };
}());

//browserify -t coverify test/*.js --bare | node | coverify
//browserify -t coverify test/*.js | testling | coverify
