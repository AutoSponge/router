[![NPM version](https://badge.fury.io/js/accu-router.png)](http://badge.fury.io/js/accu-router)

[![Build Status](https://travis-ci.org/AutoSponge/router.png?branch=master)](https://travis-ci.org/AutoSponge/router)

[![browser support](https://ci.testling.com/AutoSponge/router.png)](https://ci.testling.com/AutoSponge/router)

accu-router
======

## Overview

A router with specificity-based handler searching.  What does that even mean?  Well, most routers put your routes
into an array.  When attempting to match a route, the router simply iterates over all known routes to find the
first match.  If your application contains hundreds or thousands of routes, this approach will result in poor
performance.  Other routers try to disambiguate routes using trees and optimistic search algorithms.  Any performance
gained by using a tree data structure risks getting lost due to exhaustive searching.

`accu-router` works differently--think 'event bubbling on the DOM' or 'CSS specificity matching'.
When you add a route, the internal representation gets stored as a property on
an object.  You can't get faster look-ups.  This also removes the possibility that more than one handler will be
registered for a route at any given time.  By default, attempts to overwrite a route fail silently.  To force a route
change, pass a truthy value for the `force` parameter (`router.addRoute( 'a/b/c', myHandler, true )`).

## Non-opinionated

`accu-router` will not execute your route handlers for you.  It merely returns a `RouterResponse` object which
holds a reference to your handler (among other things).  Use this information however you see fit for your
application.

You can store anything as a route handler, not just functions.  For instance, you may start your application with
a route to an ajax function.  When the function completes, the resulting Promise object can replace the route handler
to prevent extra server requests.

## RouterResponse Objects

This json schema describes the RouterResponse object:

```json
{
    "$schema": "http://json-schema.org/draft-03/schema",
    "title": "RouterResponse",
    "description": "response wrapper object",
    "type": "object",
    "required": true,
    "properties": {
        "event": {
            "title": "RouterEvent",
            "description": "describes match request and fulfillment",
            "type": "object",
            "required": false,
            "properties": {
                "currentPath": {
                    "description": "the matched path's internal representation",
                    "type": "string",
                    "required": true
                },
                "current": {
                    "description": "the currentPath's segments",
                    "type": "array",
                    "required": true
                },
                "data": {
                    "description": "the match request's additional arguments",
                    "type": "array",
                    "required": true
                },
                "path": {
                    "description": "the match request path",
                    "type": "string",
                    "required": true
                },
                "segments": {
                    "description": "match request path's segments",
                    "type": "array",
                    "required": true
                }
            }
        },
        "fn": {
            "description": "route's registered value",
            "type": "object",
            "required": false
        },
        "next": {
            "description": "function which returns the next route in specificity order, may return false",
            "type": "function",
            "required": true
        },
        "params": {
            "description": "named tokens found in a path using /:<name> segments",
            "type": "object",
            "required": true
        },
        "route": {
            "description": "the matched route's registered path",
            "type": "string",
            "required": true
        },
        "splat": {
            "description": "the portion of the path matching a /* segment",
            "type": "string",
            "required": true
        }
    }
}
```

## Getting Started

`npm install --save-dev accu-router`

If you want to build the project:

1.  Clone the repo
1.  Run `npm install`
1.  Run the build `sh build.sh`

To view the unit test output in a browser, load the test/test.html file, look in the console.

## API

Get the default instance of Router:

```html
<!-- browser example -->
<script src='router.min.js'></script>
<script>
  var router = Router.instance;
</script>
```

```js
//node or browserify example
var router = require( 'accu-router' ).instance;
```

Create a new router

```html
<!-- browser example -->
<script src='router.min.js'></script>
<script>
  var router = new Router();

  //or

  var router = Router.create();
</script>
```

```js
//node or browserify example
var Router = require( 'accu-router' );
var router = new Router();

//or
var router = require( 'accu-router' ).create();

//or
var routerFactory = require( 'accu-router' ).create;
var router = routerFactory.create();

```

### Router.addRoute( path \[, fn\]\[, force\] )

-  `path` (string) forward slash (`/`) separates path segments (example: `'a/b/c'`)
    -  segments may be any string
    -  segments of `:<name>` denote a named parameter that will match any string in that segment and return the
    matched string as a `response.param.<name>` value (example: `'app/:controller/:action/:id'`)
    -  segments of `'*'` are a wildcard and will match any string in that segment and any further segments then return
    the matched segments as a `response.splat` value (example: `'app/*'`)
-   `fn` (any) \[optional\] value returned as `response.fn` value
-   `force` if truthy, will override any existing route

### Router.match( path \[, arg1 \[, arg2...\]\] )

-   `path` (string) forward slash (`/`) separates path segments (example: `'a/b/c'`)
-   `arg` any data arguments will be returned in the `response.event.data` array

## Update

2014-05-08: RouterResponse can be continued by calling `response.next()` which can return a less specific match or `false`