var cai = cai || {};

cai.DataService = function(port, folder) {
	var self = this;
    
	self.Port = port || 8181;
    self.Folder = folder || process.cwd();
    
    self.start = function(port, folder) {
    	if (!port) port = self.Port;
        self.Port = port;
        
        if (!folder) folder = self.Folder;
        self.Folder = folder;
    
    	console.log('Starting Mock REST Server');
    	console.log('Referencing resources from [' + self.Folder + ']');
    
		var restify = require('restify');
		var server = restify.createServer();
        
    	console.log('Creating GET routes...');
		server.get('/Locations', self.getLocations);
		server.get('/Materials/Location/:id', self.getMaterialsLocation);
		server.get('/Demand/Location/:id/Material/:code/StartTime/:time', self.getDemand);
		server.get('/Inventory/Location/:id', self.getInventoryLocation);
		server.get('/Inventory/Location/:id/Material/:code', self.getInventoryLocationMaterial);
        
    	console.log('Listening...');
        
		server.listen(self.Port, function() {
        	console.log('%s listening at %s', server.name, server.url);
		});
        
        console.log('Hub REST Server running at http://127.0.0.1:' + self.Port + '/');
	}
    
    self.getLocations = function(req, res, next) {
    	try {
        	console.log("Get Locations");
        
        	var locations = require(self.Folder + "/mocks/cai.MockLocations.json");
            console.log("locations = " + locations);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });                    
            res.end(JSON.stringify(locations), 'utf-8');
	    } catch (ex) {
	    	console.log('Error in processing get location request: ' + ex);
	    }
	}
        
    self.getMaterialsLocation = function(req, res, next) {
    	try {
    		var location = req.params.id;
        	console.log("Get Materials for Location " + location);
        	var json = require(self.Folder + "/mocks/cai.MockMaterials.json");
            console.log("materials = " + json);
        	var materials = [];
        
        	console.log("Filter materials for location: " + location);
            for (var i=0; i<json.length; i++) {
            	var material = json[i];
            	if (!location || location.length < 1 || location == material.locationCode) {
                	materials.push(material);
                }
            }
            console.log("Filtered materials:");
            console.log(materials);
            
        	res.writeHead(200, { 'Content-Type': 'application/json' });                    
            res.end(JSON.stringify(materials), 'utf-8');                
	    } catch (ex) {
	    	console.log('Error in processing get materials for location request: ' + ex);
	    }
	}
        
    self.getDemand = function(req, res, next) {
    	try {
	    } catch (ex) {
	    	console.log('Error in processing get demand request: ' + ex);
	    }
	}
        
    self.getInventoryLocation = function(req, res, next) {
    	try {
	    } catch (ex) {
	    	console.log('Error in processing get inventory for location request: ' + ex);
	    }
	}
        
    self.getInventoryLocationMaterial = function(req, res, next) {
    	try {
	    } catch (ex) {
	    	console.log('Error in processing get inventory for location and material request: ' + ex);
	    }
	}
};

// main entry point
(function() {
	try {
    	console.log('Creating Mock Data Service');
        var port = process.argv.length > 2 ? process.argv[2] : 8181;
        var folder = process.argv.length > 3 ? process.argv[3] : process.cwd();
    
		var ds = new cai.DataService(port, folder);
		ds.start();
    } catch (ex) {
    	console.log('Error in creating Mock Data Service: ' + ex);
    }
})();
