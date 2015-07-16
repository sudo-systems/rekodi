var Api = function(app) {
  var kodiWs = require('xbmc-ws');
  var retryIntervalObject = null;
  var loThis = this;
  this.link = null;

  this.connectPersistent = function(callback) {
    this.connect(callback);
    
    retryIntervalObject = setInterval(function() {
      if(this.link === null) {
        loThis.connect(callback);
      }
    }, app.config.api.retryInterval);
  };
  
  this.connect = function(callback) {
    kodiWs(app.config.api.url, app.config.api.port).then(function(connection) {
      loThis.link = connection;
      app.gui.setConnected(true, 'Kodi connection established');
      callback(loThis.link);
    },
    function(error) {
      loThis.link = null;
      app.gui.setConnected(false);
    });
  };
};

module.exports = Api;