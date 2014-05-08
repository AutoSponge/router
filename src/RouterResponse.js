'use strict';

function RouterResponse( event, route, next ) {
    this.event = event;
    this.params = this.getParams( route );
    this.splat = this.getSplat();
    this.route = route.path;
    this.fn = route.fn;
    this.next = next;
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