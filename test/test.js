var test = require( 'tape' );
var Router = require( '../src/' );
var shim = require( './shim/object-create' );

test( 'Router.create, new Router, Router.instance', function ( t ) {
    t.plan( 3 );
    t.ok( Router.create() instanceof Router, 'router.create returns an instance of router' );
    t.notEqual( Router.create(), new Router(), 'instances should be unique' );
    //we can't test if Router.instance is an instanceof Router
    //because it was constructed before this execution context evaluated Router
    t.equal( Router.instance.constructor, Router, 'Router.instance should be constructed by Router' );
} );

test( 'a/b/c', function ( t ) {
    t.plan( 3 );
    var router = new Router();
    var abc = {};
    router.addRoute( 'a/b/c', abc );
    t.equal( router.match( 'a/b/c' ).fn, abc, 'a/b/c should match a/b/c' );
    t.notOk( router.match( 'a/b/x' ), 'should not match a/b/x' );
    t.notOk( router.match( 'a/b' ), 'should not match a/b' );
} );

test( 'a/b/:id', function ( t ) {
    t.plan( 8 );
    var router = new Router();
    var abc = {id: 'abc'};
    var abi = {id: 'abi'};
    var result;
    router.addRoute( 'a/b/c', abc );
    router.addRoute( 'a/b/:id', abi );
    result = router.match( 'a/b/c' );
    t.equal( result.fn, abc, 'a/b/c should match a/b/c' );
    t.equal( result.route, 'a/b/c', 'a/b/c should match a/b/c' );
    t.equal( Object.keys( result.params ).length, 0, 'should not have params' );
    t.equal( result.splat, '', 'a/b/c should not have a splat' );

    result = router.match( 'a/b/d' );
    t.equal( result.fn, abi, 'a/b/:id should match a/b/d' );
    t.equal( result.route, 'a/b/:id', 'a/b/:id should have the right route' );
    t.equal( Object.keys( result.params ).length, 1, 'should have 1 param' );
    t.equal( result.params.id, 'd', 'd should be the id');
} );

test( 'a/b/:id as addHandler', function ( t ) {
    t.plan( 6 );
    var router = new Router();
    var result;
    var abi = {id: 'abi' };
    ['a/b/c', 'a/b/:id'].forEach( router.addHandler( abi ) );
    result = router.match( 'a/b/c' );
    t.equal( result.fn, abi, 'a/b/c should match a/b/c' );
    t.notOk( result.params.id, 'a/b/c should not have params' );

    result = router.match( 'a/b/d' );
    t.equal( result.fn, abi, 'a/b/c should match a/b/c' );
    t.equal( result.params.id, 'd', 'a/b/d should have id: d' );
    t.notOk( router.match( 'a/b/c/d' ), 'should not match a/b/c/d' );
    t.notOk( router.match( 'a/b' ), 'should not match a/b' );
} );

test( 'a/b/*', function ( t ) {
    t.plan( 5 );
    var router = new Router();
    var abc = {id: 'abc'};
    var abx = {id: 'ab*'};
    var result;
    router.addRoute( 'a/b/c', abc );
    router.addRoute( 'a/b/*', abx );

    t.equal( router.match( 'a/b/c' ).fn, abc, 'a/b/c should match a/b/c' );

    result = router.match( 'a/b/d' );
    t.equal( result.fn, abx, 'a/b/* should match a/b/d' );
    t.equal( result.splat, 'd', 'd should be the splat' );

    result = router.match( 'a/b/c/d' );
    t.equal( result.fn, abx, 'a/b/* should match a/b/c/d' );
    t.equal( result.splat, 'c/d', 'c/d should be the splat' );
} );

test( 'a/b/c -> *', function ( t ) {
    t.plan( 1 );
    var router = new Router();
    var splat = {id: '*'};
    router.addRoute( '*', splat );
    t.equal( router.match( 'a/b/c' ).fn, splat, 'a/b/c should match default route' );
} );