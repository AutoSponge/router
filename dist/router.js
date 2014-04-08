!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Router=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var RouteParam = _dereq_( './RouteParam' );

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
},{"./RouteParam":2}],2:[function(_dereq_,module,exports){
'use strict';

function RouteParam( name, position ) {
    this.position = position;
    this.name = name;
}

module.exports = RouteParam;
},{}],3:[function(_dereq_,module,exports){
'use strict';

function RouterEvent( path ) {
    this.path = path;
    this.current = path.split( '/' );
    this.segments = path.split( '/' );
}

module.exports = RouterEvent;
},{}],4:[function(_dereq_,module,exports){
'use strict';

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

module.exports = RouterResponse;
},{}],5:[function(_dereq_,module,exports){
'use strict';

var Route = _dereq_( './Route' );
var RouterResponse = _dereq_( './RouterResponse' );
var RouterEvent = _dereq_( './RouterEvent' );

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
        return [
            reduceExact,
            reduceWildCard,
            reduceParam,
            reduceParamWildCard
        ].some( processSpecificity( event, event.current.slice( -2 ) ) ) &&
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

},{"./Route":1,"./RouterEvent":3,"./RouterResponse":4}]},{},[5])
(5)
});