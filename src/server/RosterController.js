var log = require('./logging.js').getLogger('RosterController.js');
var renderModule = require('./renderService.js');
var auditLog = require('./logging.js').getLogger('AUDIT');
var async = require('async');


var RosterController = function(mongoDriver) {

	var renderService = new renderModule.RenderService();

	var that=this;
	this.mongoDriver=mongoDriver;

	this.search=function (req,res){
		console.log(req,res);
		var page=renderService.render(renderModule.templates.SEARCH,{});
		res.send(200,page);
	}

	
	this.roster=function (req,res){

		var page=renderService.render(renderModule.templates.ROSTER,{});
		res.send(200,page);
	}

}

module.exports = {
	RosterController: RosterController
}
