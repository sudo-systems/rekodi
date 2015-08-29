rekodiApp.factory('rkLogService', ['rkConfigService',
  function(rkConfigService) {
    var winston = require('winston');
    var config = rkConfigService.get();
    var logger = null;
    
    function init() {
      logger = new (winston.Logger)({
        transports: [
          new (winston.transports.Console)(),
          new (winston.transports.File)({
            name: 'debug-log',
            filename: config.files.debugLog,
            level: 'info'
          }),
          new (winston.transports.File)({
            name: 'error-log',
            filename: config.files.errorLog,
            level: 'error'
          })
        ]
      });
    }
    
    var error = function(message) {
      if(message.constructor === Object || message.constructor === Array) {
        //logger.error(JSON.stringify(message));
        console.error(message);
        return;
      }

      logger.error(message);
    };
    
    var debug = function(message) {
      if(message.constructor === Object || message.constructor === Array) {
        //logger.info(JSON.stringify(message));
        console.dir(message);
        return;
      }

      logger.info(message);
    };
    
    init();
    
    return {
     error: error,
     debug: debug
    };
  }
]);