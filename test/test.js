var test = require( 'tape' );
var router = require( '../src/' );

test( 'a/b/c', function ( t ) {
    t.plan( 3 );
    var abc = {};
    router.addRoute( 'a/b/c', abc );
    t.equal( router.match( 'a/b/c' ).fn, abc, 'a/b/c should match a/b/c' );
    t.notOk( router.match( 'a/b/x' ), 'should not match a/b/x' );
    t.notOk( router.match( 'a/b' ), 'should not match a/b' );
} );

test( 'a/b/:id', function ( t ) {
    t.plan( 8 );
    router.reset();
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

test( 'a/b/*', function ( t ) {
    t.plan( 5 );
    router.reset();
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
    router.reset();
    var splat = {id: '*'};
    router.addRoute( '*', splat );
    t.equal( router.match( 'a/b/c' ).fn, splat, 'a/b/c should match default route' );
} );