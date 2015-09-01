rekodiApp.factory('rkLogService', [
  function() {
    var error = function(message) {
      console.dir(message);
    };
    
    var debug = function(message) {
      console.dir(message);
    };

    return {
     error: error,
     debug: debug
    };
  }
]);