rekodiApp.factory('rkKodiWsApiService', ['$rootScope', '$localStorage',
  function($rootScope, $localStorage) {
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

    function createConnection() {
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
        
        connectionStatus.connection.on('error', function(error) {
          alert(error);
        });
        
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

    var connect = function(immmediately) {
      immmediately = (immmediately === undefined)? true : immmediately;
      
      if(immmediately) {
        createConnection();
      }

      setInterval(function() {
        if(connectionStatus.connection === null) {
          createConnection();
        }
      }, retyInterval);
    };
    
    var isConfigured = function() {
      return (!$localStorage.settings || 
              $localStorage.settings.constructor !== Object || 
              $localStorage.settings.serverAddress === '' ||
              $localStorage.settings.jsonRpcPort === '')? false : true;
    };
    
    var isConnected = function() {
      return connectionStatus.connected;
    };
    
    var getConnection = function() {
      return connectionStatus.connection;
    };

    return {
      connect: connect,
      isConnected: isConnected,
      getConnection: getConnection,
      isConfigured: isConfigured
    };
  }
]);

