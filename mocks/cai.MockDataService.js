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
        
    	console.log('Creating POST routes...');
		server.post('/Demand/Location/:id/Material/:code/StartTime/:time', self.postDemand);
		server.post('/Inventory/Location/:id', self.postInventoryLocation);
		server.post('/Inventory/Location/:id/Material/:code', self.postInventoryLocationMaterial);
        
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
        	var content = self.readFile("cai.MockLocations.js");
            console.log("content = " + content);
            if (!content) {
            	res.writeHead(404);            
                res.end();        
            }
            else if (content.error !== undefined) {
            	res.writeHead(content.error);            
                res.end();        
            }
            else {
            	res.writeHead(200, { 'Content-Type': 'application/json' });                    
                res.end(content, 'utf-8');                
            }
	    } catch (ex) {
	    	console.log('Error in processing get location request: ' + ex);
	    }
	}
        
    self.getMaterialsLocation = function(req, res, next) {
    	try {
        	var content = self.readFile("cai.MockMaterials.js");
            console.log("content = " + content);
            if (!content) {
            	res.writeHead(404);            
                res.end();        
            }
            else if (content.error !== undefined) {
            	res.writeHead(content.error);            
                res.end();        
            }
            else {
        		var location = req.params.id;
            	var materials = [];
            
            	console.log("Filter materials for location: " + location);
                var json = JSON.parse(content);
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
            }
        
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
        
    self.postDemand = function(req, res, next) {
    	try {
	    } catch (ex) {
	    	console.log('Error in processing post demand request: ' + ex);
	    }
	}
    
    self.postInventoryLocation = function(req, res, next) {
    	try {
	    } catch (ex) {
	    	console.log('Error in processing post inventory for location request: ' + ex);
	    }
	}
    
    self.postInventoryLocationMaterial = function(req, res, next) {
    	try {
	    } catch (ex) {
	    	console.log('Error in processing post inventory for location and material request: ' + ex);
	    }
	}
    
    self.readFile = function(filename) {
	    var filePath = self.Folder + "/mocks/" + filename;
        console.log("Reading file from [" + filePath + "]");
        var fs = require('fs');
        var path = require('path'); 
        
        if (path.existsSync(filePath)) {             
            return fs.readFileSync(filePath);
		}        
        else {            
        	return null;
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
