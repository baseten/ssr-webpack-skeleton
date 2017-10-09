const express = require( 'express' );
const path = require( 'path' );
const nunjucks = require( 'nunjucks' );

const app = express();
const PROJECT_ROOT = path.resolve( __dirname, '..' );
const BUILD_PATH = path.join( PROJECT_ROOT, 'build' );
const SERVER_PATH = __dirname;
const DATA_PATH = path.join( SERVER_PATH, 'data' );
const TEMPLATE_PATH = path.join( SERVER_PATH, 'templates' );

nunjucks.configure( TEMPLATE_PATH, { autoescape: true } );

app.get( '/', function ( req, res ) {
    const html = nunjucks.render( 'index.njk' );

    res.send( html );
} );

app.use( express.static( BUILD_PATH ) );

if ( require.main === module ) {
    const server = app.listen( 8000, function () {
        console.log( 'Dev server running on port 8000' );
    } );

    // allow PM2 to gracefully reload
    process.on( 'SIGINT', function () {
        server.close();
    } );
}

module.exports = app;
