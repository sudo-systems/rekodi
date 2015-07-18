rekodiApp.factory('rkKodiWsApiService', ['$rootScope', 
  function($rootScope) {
    var retyInterval = 2000;
    var connectionStatus = {
      connected: false, 
      statusMessage: 'offline',
      connection: null
    };

    function bindEvents(connection) {
      /* SYSTEM EVENTS */
      connection.System.OnQuit(function() {
        connectionStatus = {
          connected: false, 
          statusMessage: 'offline',
          connection: null
        };
 
        $rootScope.$emit('rkWsConnectionStatusChange', connectionStatus);
      });

      connection.System.OnRestart(function() {
        connectionStatus = {
          connected: false, 
          statusMessage: 'rebooting',
          connection: null
        };
        
        $rootScope.$emit('rkWsConnectionStatusChange', connectionStatus);
      });

      connection.System.OnSleep(function() {
        connectionStatus = {
          connected: false, 
          statusMessage: 'sleeping',
          connection: null
        };
        
        $rootScope.$emit('rkWsConnectionStatusChange', connectionStatus);
      });

      connection.System.OnWake(function() {
        connectionStatus = {
          connected: false, 
          statusMessage: 'online'
        };
        
        $rootScope.$emit('rkWsConnectionStatusChange', connectionStatus);
      });
    }

    var connect = function() {
      var kodiWs = require('xbmc-ws');
      var config = {
        url: 'donda.nl',
        port: 9090
      };
      
      kodiWs(config.url, config.port).then(function(link) {
        connectionStatus = {
          connected: true, 
          statusMessage: 'online',
          connection: link
        };
        
        bindEvents(connectionStatus.connection);
        $rootScope.$emit('rkWsConnectionStatusChange', connectionStatus);
      },
      function(error) {
        connectionStatus = {
          connected: false, 
          statusMessage: 'offline',
          connection: null
        };
        
        $rootScope.$emit('rkWsConnectionStatusChange', connectionStatus);
      });
    };

    var connectPersistent = function(immmediately) {
      immmediately = (immmediately === undefined)? true : immmediately;
      
      if(immmediately) {
        connect();
      }

      setInterval(function() {
        if(connectionStatus.connection === null) {
          console.log('retry');
          connect();
        }
      }, retyInterval);
    };

    return {
      connect: connect,
      connectPersistent: connectPersistent
    };
  }
]);

