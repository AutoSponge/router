[![Build Status](https://travis-ci.org/AutoSponge/router.png?branch=master)](https://travis-ci.org/AutoSponge/router)

[![browser support](https://ci.testling.com/AutoSponge/router.png)](https://ci.testling.com/AutoSponge/router)

router
======

A generic application router with specificity-based handler searching

## Getting Started

1.  Clone the repo
1.  Run `npm install`
1.  Run the build `sh build.sh`
1.  Run the unit tests: `npm test`

To view the unit test output in a browser, load the test/test.html file, look in the console.

## Usage

Get the default instance of Router:

`var router = require( 'router' ).instance;`

Create a new router

```js
var Router = require( 'router' );
var router = new Router();

//or
var router = require( 'router' ).create();

//or
var routerFactory = require( 'router' ).create;
var router = routerFactory.create();

```

Add a new route and handler

```js
router.addRoute( 'a/b/c', myHandler );
```

Add several routes to the same handler

```js
['a/b/c', 'a/b/:id'].forEach( router.addHandler( myHandler ) );
```

