/*global console, process, require*/
( function () {
        'use strict';
        let fs = require( 'fs' );
        let spawn = require( 'child_process' ).spawn;

        let numberOfRetrys = 5; //The number of times any service should be restarted before full termination.
        let retryInterval = 60000; //The interval between a crash and then a retry
        let config;
        let server, scanner, phantomjs; //THe processes.

        

        function initiateServer() {
            //if error -> timeout
        }

        function initiateProximityScanner() {

        }

        function initiatiePhantomJS() {
            phantomjs = spawn( 'phantomjs', [ '--web-security=no', '/scripts/phantom-pi-ws.js', JSON.stringify( config ) ] );

            phantomjs.stdout.on( 'data', function ( data ) {
                let msg = data.toString();
                console.log( msg );
            } );

            phantomjs.stderr.on( 'data', function ( data ) {
                let err = data.toString();
                console.log( err );
            } );

            phantomjs.on( 'error', function ( err ) {
                console.log( err );
            } );

            phantomjs.on( 'close', function ( code ) {
                console.log( "closed with code " + code );
            } );
        }

        function terminate() {
            //SEND KILL TO ALL THE PROCESSES.
            //LOG TO /boot/webstrate-pi-error.log
            //process.exit(1);
        }




    }

}() );
