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
        updatedAt: {
            type: Date,
            default: Date.now
        }
    } );

    let Location = mongoose.model( 'Location', proximagicNodeSchema );

    function upsert( node ) {
		
		let devices = node.devices;
		Location.findOne({mac: node.mac}, (err, n)=>{
			if(err){
				console.log("Error in Location.upsert");
			}
			if(!n){
				
				let location = new location({
					mac:node.mac,
					ip:node.ip,
					location:node.location
				});
				
				location.save((err)=>{
					if(err){
						console.log(err);
						console.log("Error in proximagicnode.js upsert save");
					}
					for(var i = 0; i < devices.length; i++){
						device.upsert(devices[i], node);
					}
				})
			} else {
				//TODO update node
				for(var i = 0; i < devices.length; i++){
					if(devices[i].ip !== '0.0.0.0'){
						device.upsert(devices[i], n);
					}
				}
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
	
	function findByName(name, callback){
		Location.findOne({location:name}, { '_id':0, '__v':0 }, (err, n) => {
			if(err){
				callback({"error": "Device.findByName()"});
			} else if (!n){
				callback({"node":"unknown"});
			} else {
				callback(n)
			}
		});
		
	}

    return Object.freeze( {
		findAll,
        upsert,
		findByName
    } );

}() );
