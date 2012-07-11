var cai = cai || {};  

var cDefaultIOPort = 3030;
var cDefaultRESTPort = 7070;
var cDefaultDataServiceURL = "http://localhost:8080/RTG";

cai.DataServiceClient = function(urlbase) {
	var self = this;
    
    self.URL = urlbase || cDefaultDataServiceURL;
    
    self.rest = require('restler');
    
    self.getLocations = function(callback) {
    	try {
        	console.log("Get Locations");
        	var url = self.URL + 'Locations';
            self.get(url, callback);
	    } catch (ex) {
	    	console.log('Error in retrieving locations: ' + ex);
	    }
	}
        
    self.getMaterialsLocation = function(location, callback) {
    	try {
        	console.log("Get Materials for Location " + location);
        	var url = self.URL + 'Materials/Location/' + location;
            self.get(url, callback);
	    } catch (ex) {
	    	console.log('Error in retrieving materials for location: ' + ex);
	    }
	}
        
    self.getDemand = function(location, material, starttime, buckets, callback) {
    	try {
        	console.log("Get Demand for Location " + location + ", Material " + material + ", Start " + starttime + ", Buckets " + buckets);
        
        	var url = self.URL + 'Demand/Location/' + location + '/Material/' + material + '/StartTime/' + starttime + '/NumBuckets/' + buckets;
            self.get(url, callback);
	    } catch (ex) {
	    	console.log('Error in retrieving demand: ' + ex);
	    }
	}
        
    self.getInventoryLocation = function(location, callback) {
    	try {			   1
        	console.log("Get Inventory for Location " + location);
        
        	var url = self.URL + 'Inventory/Location/' + location;
            self.get(url, callback);
	    } catch (ex) {
	    	console.log('Error in retrieving inventory for location: ' + ex);
	    }
	}
        
    self.getInventoryLocationMaterial = function(location, material, callback) {
    	try {
        	console.log("Get Inventory for Location " + location + ", Material " + material);
        
        	var url = self.URL + 'Inventory/Location/' + location + '/Material/' + material;
            self.get(url, callback);
	    } catch (ex) {
	    	console.log('Error in retrieving inventory for location and material: ' + ex);
	    }
	}
    
    self.get = function(url, callback) {
    	console.log("Calling REST URL: " + url);
        self.rest.get(url).on('complete', function(result) {
        	if (result instanceof Error) {
            	callback({error: result.message});
			} else {
            	callback(result);
			}
		});
    }
    
    self.init = function() {
    	console.log("URL: " + self.URL);
        if (self.URL.charAt(self.URL.length-1) !== '/') {
        	self.URL +=  '/';
		}           
    }
    self.init();
};

cai.IoServer = function(port, dataservice) {
	var self = this;
    self.Port = port || cDefaultIOPort;
    self.DataService = dataservice;
    self.io = null;
    
    self.start = function(port) {
    	if (!port) port = self.Port;
        self.Port = port;
    
    	console.log('Starting Hub IO Server @ ' + self.Port);
    
        self.io = require('socket.io').listen(self.Port);
        
		self.io.sockets.on('connection', function (socket) {
        	console.log("Client connected");
        	//socket.broadcast.emit('user connected');
            socket.on('get locations', function() {
		    	try {
		        	self.DataService.getLocations(function(data) {
                    	socket.emit('set locations', data);
                    });
			    } catch (ex) {
			    	console.log('Error in retrieving locations: ' + ex);
			    }
            });
            
            socket.on('get materials', function(location) {
		    	try {
		        	self.DataService.getMaterialsLocation(location, function(data) {
                    	socket.emit('set materials', data);
                    });
			    } catch (ex) {
			    	console.log('Error in retrieving materials: ' + ex);
			    }
            });
            
            socket.on('get demand', function(location, material, starttime, buckets) {
		    	try {
		        	self.DataService.getDemand(location, material, starttime, buckets, function(data) {
                    	socket.emit('set demand', data);
                    });
			    } catch (ex) {
			    	console.log('Error in retrieving demand: ' + ex);
			    }
            });
            
            socket.on('get inventory', function(location) {
		    	try {
		        	self.DataService.getInventoryLocation(location, function(data) {
                    	socket.emit('set inventory', data);
                    });
			    } catch (ex) {
			    	console.log('Error in retrieving on hand inventory: ' + ex);
			    }
            });
            
		});
        
        console.log('Hub IO Server running at http://127.0.0.1:' + self.Port + '/');
	}
    
    self.broadcastDemand = function(demand) {
    	try {
        	console.log("Broadcasting demand update");
        	self.io.sockets.emit('demand change', demand);
	    } catch (ex) {
	    	console.log('Error in sending demand update: ' + ex);
	    }
    }
    
    self.broadcastInventory = function(inventory) {
    	try {
        	console.log("Broadcasting inventory update");
        	self.io.sockets.emit('inventory change', inventory);
	    } catch (ex) {
	    	console.log('Error in sending inventory update: ' + ex);
	    }
    }
};

cai.RestServer = function(port, ioserver) {
	var self = this;
    self.Port = port || cDefaultRESTPort;
	self.IOServer = ioserver;
    
    self.start = function(port) {
    	if (!port) port = self.Port;
        self.Port = port;
    
    	console.log('Starting Hub REST Server');
    
		var restify = require('restify');
		var server = restify.createServer();
        server.use(restify.bodyParser({ mapParams: false })); 
        
    	console.log('Creating POST routes...');
		server.post('/Demand/Location/:id/Material/:code/StartTime/:time', self.postDemand);
		server.post('/Inventory/Location/:id', self.postInventoryLocation);
		server.post('/Inventory/Location/:id/Material/:code', self.postInventoryLocationMaterial);
        
    	console.log('Listening...');
        
		server.listen(self.Port, function() {
        	console.log('%s listening at %s', server.name, server.url);
		});
        
        console.log('Hub REST Server running at http://127.0.0.1:' + self.Port + '/');
	}
    
    self.postDemand = function(req, res, next) {
    	try {
        	console.log("Received Post Demand: " + req.url);
            //console.log(req);
	    	//req.params.id
            //req.params.code
            //req.params.time
            self.IOServer.broadcastDemand(req.body);
            res.send();	//???
	    } catch (ex) {
	    	console.log('Error in processing post demand request: ' + ex);
	    }
	}
    
    self.postInventoryLocation = function(req, res, next) {
    	try {
        	console.log("Received Post Inventory: " + req.url);
            //console.log(req);
	    	//req.params.id
            self.IOServer.broadcastInventory(req.body);
            res.send();	//???
	    } catch (ex) {
	    	console.log('Error in processing post inventory for location request: ' + ex);
	    }
	}
    
    self.postInventoryLocationMaterial = function(req, res, next) {
    	try {
        	console.log("Received Post Inventory: " + req.url);
	    	//req.params.id
	    	//req.params.code
            self.IOServer.broadcastInventory(req.body);
            res.send();	//???
	    } catch (ex) {
	    	console.log('Error in processing post inventory for location and material request: ' + ex);
	    }
	}
};

cai.HubServer = function(ioport, restport, dsurl) {
	var self = this;
    
	self.IOPort = ioport || cDefaultIOPort;
	self.RESTPort = restport || cDefaultRESTPort;
	self.DataServiceURL = dsurl || cDefaultDataServiceURL;
    
    self.dataService = new cai.DataServiceClient(self.DataServiceURL);
    self.ioServer = new cai.IoServer(self.IOPort, self.dataService);
    self.restServer = new cai.RestServer(self.RESTPort, self.ioServer);
    
    self.start = function(ioport, restport) {
    	if (!ioport) ioport = self.IOPort;
        self.IOPort = ioport;
        
    	if (!restport) restport = self.RESTPort;
        self.RESTPort = restport;
        
    	console.log('Starting Hub Server');
        
        self.ioServer.start();
        self.restServer.start();
        
        console.log('Hub Server running');
    }    
};

// main entry point
(function() {
	try {
    	console.log('Creating Hub Server');
        var ioport = process.argv.length > 2 ? parseInt(process.argv[2]) : cDefaultIOPort;
        var restport = process.argv.length > 3 ? parseInt(process.argv[3]) : cDefaultRESTPort;
        var dsurl = process.argv.length > 4 ? process.argv[4] : cDefaultDataServiceURL;
    
		var hs = new cai.HubServer(ioport, restport, dsurl);
		hs.start();
    } catch (ex) {
    	console.log('Error in creating Hub Server: ' + ex);
    }
})();
