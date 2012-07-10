var cai = cai || {};  

var cDefaultURL = "http://localhost:3030/";

cai.HubClient = function(url) {
	var self = this;
    
	self.URL = url || cDefaultURL;
    self.io = require('socket.io-client');
    self.socket = null;
    
    self.start = function() {
    	console.log('Starting Hub Client');
    	self.socket = self.io.connect('localhost', {port: 3030});
        self.socket.on('connect', function() {
        
		    self.socket.on('set locations', function(data) {
		        console.log("Set Locations");
		        console.log(data);
				self.stop();
		    });
            
		    self.socket.on('set materials', function(data) {
		        console.log("Set Materials");
		        console.log(data);
				self.stop();
		    });
            
        });
    }    
    
    self.stop = function() {
    	console.log('Stopping Hub Client');
        self.socket.disconnect();
    }    
    
    self.getLocations = function() {
    	console.log('Get Locations');
        self.socket.emit('get locations');
    }
    
    self.getMaterials = function(location) {
    	console.log('Get Materials');
        self.socket.emit('get materials', location);
    }
    
};

// main entry point
(function() {
	try {
    	console.log('Creating Hub Client');
        var url = process.argv.length > 2 ? process.argv[2] : cDefaultURL;
    
		var hc = new cai.HubClient(url);
		hc.start();
        
        //hc.getLocations();
        hc.getMaterials(2);
        
        console.log("Bye!");
    } catch (ex) {
    	console.log('Error in creating Hub Client: ' + ex);
    }
})();
