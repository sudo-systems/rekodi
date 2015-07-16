var EventClient = function(app) {
  var fs = require('fs');
  var path = require('path');
  var xec = require('xbmc-event-client');
  this.link = null;
  
  this.connect = function(callback) {
    this.link = new xec.XBMCEventClient('ReKodi', {
      log: false,
      icontype: xec.ICON_PNG,
      host: app.config.eventClient.url,
      port: app.config.eventClient.port
    });

    this.link.connect(function(errors, bytes) {
      if (errors.length) {
        new Notification(app.language.get('CONNECTION_ERROR')+' (' +errors+ ')');
        return;
      }
      
      callback(this.link);
    });
  };
};

module.exports = EventClient;