rekodiApp.factory('rkLogService', [
  function() {
    var error = function(message) {
      if(message.constructor === Object || message.constructor === Array) {
        console.dir(message);
        return;
      }

      console.log('ERROR: '+message);
    };
    
    var debug = function(message) {
      if(message.constructor === Object || message.constructor === Array) {
        console.dir(message);
        return;
      }
      
      console.log('DEBUG: '+message);
    };

    return {
     error: error,
     debug: debug
    };
  }
]);