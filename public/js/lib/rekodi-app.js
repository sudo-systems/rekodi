var RekodiApp = function() {
  var Enums = require('./enums');
  var Dom = require('./dom');
  var Config = require('./config');
  var Language = require('./language');
  var Tabs = require('./tabs');
  var Gui = require('./gui');
  var EventClient = require('./event-client');
  var Api = require('./api');
  var Controls = require('./controls');
  var Status = require('./status');
  
  this.enums = Enums;
  this.dom = new Dom();
  this.config = new Config();
  this.language = new Language(this);
  this.tabs = Tabs;
  this.gui = new Gui(this);
  this.eventClient = new EventClient(this);
  this.api = new Api(this);
  this.controls = new Controls(this);
  this.status = new Status(this);
};

module.exports = RekodiApp;

