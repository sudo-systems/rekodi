rekodiApp.factory('rkKodiWsApiService', ['$rootScope', '$localStorage', '$sessionStorage',
  function($rootScope, $localStorage, $sessionStorage) {
    var kodiWs = require('xbmc-ws');
    var connectingInProgress = false;
    var retyIntervalTime = 10000;
    var retryInterval;
    var connectingMessage = 'connecting...';
    var connectedMessage = 'successfully connected to Kodi';
    var connectionErrorMessage = 'could not connect to Kodi';
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

    function createConnection(callback) {
      if(!$localStorage.settings || 
          !$localStorage.settings.serverAddress || 
          !$localStorage.settings.jsonRpcPort || 
          $localStorage.settings.serverAddress === '' || 
          $localStorage.settings.jsonRpcPort === '' || 
          connectingInProgress) {
        connectionStatus = {
          connected: false, 
          statusMessage: 'offline',
          connection: null
        };
        
        callback(connectionStatus);
        
        return;
      }
      
      connectingInProgress = true;
      $rootScope.$emit('rkStartConnecting', {
        message: connectingMessage
      });
      
      callback = (callback && callback.constructor === Function)? callback : function() {};

      kodiWs($localStorage.settings.serverAddress, $localStorage.settings.jsonRpcPort).then(function(link) {
        connectingInProgress = false;
        
        connectionStatus = {
          connected: true, 
          statusMessage: 'online',
          connection: link
        };

        $rootScope.$emit('rkStopConnecting', {
          message: connectedMessage
        });
        
        callback(connectionStatus);
        bindEvents(connectionStatus.connection);
        $rootScope.$emit('rkWsConnectionStatusChange', connectionStatus);
      },
      function(error) {
        connectingInProgress = false;
        
        connectionStatus = {
          connected: false, 
          statusMessage: 'offline',
          connection: null
        };
        
        $rootScope.$emit('rkStopConnecting', {
          message: connectionErrorMessage
        });
        
        callback(connectionStatus);
        $rootScope.$emit('rkWsConnectionStatusChange', connectionStatus);
      });
    };

    var connect = function(immmediately, retry, callback) {
      callback = (callback && callback.constructor === Function)? callback : function() {};
      retry = (retry === undefined)? true : retry; 
      immmediately = (immmediately === undefined)? true : immmediately;
      clearInterval(retryInterval);
      
      if(immmediately) {
        createConnection(callback);
      }
      
      if(retry) {
        retryInterval = setInterval(function() {
          if(connectionStatus.connection === null) {
            createConnection(callback);
          }
        }, retyIntervalTime);
      }
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

