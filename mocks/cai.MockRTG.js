var cai = cai || {};  

var cDefaultURL = "http://localhost:7070/";

cai.RTGClient = function(urlbase) {
	var self = this;
    
	self.URL = urlbase || cDefaultURL;
    
	var self = this;
    
    self.URL = urlbase || cDefaultDataServiceURL;
    self.rest = require('restler');
    
    self.start = function() {
    }
    
    self.postDemand = function(location, material, time, demands) {
    	try {
        	console.log("Publish Demands");
        
        	var url = self.URL + 'Demand/Location/' + location + '/Material/' + material + '/StartTime/' + time;
            self.post(url, demands, function(data, response) {
            	console.log("post completed");
		        //console.log(data);
		        //console.log(response);
            });
	    } catch (ex) {
	    	console.log('Error in publishing demands: ' + ex);
	    }
	}
        
    self.post = function(url, json, callback) {
        self.rest.postJson(url, json).on('complete', function(data, response) {
        	callback(data, response);
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

cai.now = Date.now || function() { 
  return +new Date; 
}; 


// main entry point
(function() {
	try {
    	console.log('Creating RTG Client');
        var url = process.argv.length > 2 ? process.argv[2] : cDefaultURL;
    
		var rtg = new cai.RTGClient(url);
		rtg.start();
        
        var demands = require('./cai.MockDemand');
        rtg.postDemand("1", "Sand", cai.now(), demands);
        
    } catch (ex) {
    	console.log('Error in creating RTG Client: ' + ex);
    }
})();
