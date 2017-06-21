module.exports = ( function () {
    'use strict';

    let mongoose = require( 'mongoose' );
	let device = require( './device.js' );
    let Schema = mongoose.Schema;
    let LocationSchema = new Schema( {
        mac: {
            type: String,
            required: true,
            unique: true
        },
        ip: String,
		location: String,
        seen: Date
    } );

    let Location = mongoose.model( 'Location', LocationSchema );
	
	let connections = [];
	
	function addWebSocketConnection(ws){
		connections.push(ws);
	}
	
	function removeWebSocketConnection(ws){
		connections.splice(connections.indexOf(ws), 1);
	}
	
	function webSocketSend(msg){
		connections.forEach((ws)=>{
			if(ws.readyState === 1){
				ws.send(JSON.stringify(msg));
			}
		});
	}
		

    function upsert( node ) {

		let devices = node.devices;

		Location.findOne({mac: node.mac}, (err, n)=>{
			if(err){
				console.log("Error in location.js upsert");
			}
			if(!n){
				
				let location= new Location({
					mac:node.mac,
					ip:node.ip,
					location:node.location,
					seen:Date.now()
				});
				
				location.save((err, n)=>{
					if(err){
						console.log(err.code);
						console.log("Error in location.js upsert save");
					}
					
					for(var i = 0; i < devices.length; i++){
						device.upsert(devices[i], n);
					}
				})
			} else {
				n.seen = Date.now();
				for(var i = 0; i < devices.length; i++){
					device.upsert(devices[i], n);
				}
				
				n.save((err, n)=>{
					if(err){
						console.log(err);
						console.log("Error in location.js upsert save");
					}
				})
			}
		});
    }
	
	function findAll(callback){
		Location.find({}, { '_id':0, '__v':0 }, (err, nodes) => {
			if(err){
				callback({"error": "Device.findAll()"});
			} else if (!nodes){
				callback({});
			} else {
				callback(nodes)
			}
		});
	}
	
	function findByMac(mac, callback){
		Location.findOne({mac:mac}, { '_id':0, '__v':0 }, (err, node) => {
			if(err){
				callback({"error": "Device.findByName()"});
			} else if (!node){
				callback({"location":"unknown"});
			} else {
				callback(node)
			}
		});
	}
	
	function findByName(name, callback){
		Location.find({location:name}, { '_id':0, '__v':0 }, (err, nodes) => {
			if(err){
				callback({"error": "Device.findByName()"});
			} else if (!nodes){
				callback({"location":"unknown"});
			} else {
				callback(nodes)
			}
		});
	}
	
	function clean(){

		let expire = Date.now() - 10000;
		Location.find({}, (err, locations) => {
			if(err){
				console.log("Error in device.js.clean()");
				console.log(err.code);
			}
			for(var i = 0; i < locations.length;i++){
				let location = locations[i];
				let last = new Date(location.seen).getTime();
				if(last < expire){					
					Location.remove({mac:location.mac}, (err, d)=>{
						if(err){console.log(err.code);}
					});
				} 
			}
			
		});
	}

    return Object.freeze( {
		clean,
		findAll,
        upsert,
		findByName,
		findByMac,
		addWebSocketConnection,
		removeWebSocketConnection
    } );

}() );
