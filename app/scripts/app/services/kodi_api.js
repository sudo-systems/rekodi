rekodiApp.factory('kodiApiService', ['$rootScope', 'rkLogService', 'rkSettingsService',
  function($rootScope, rkLogService, rkSettingsService) {
    var kodiWs = require('xbmc-ws');
    var isConnecting = false;
    var connection = null;
    var retyIntervalTime = 10000;
    var pingIntervalTime = 5000;
    var pingInterval, retryInterval;
    
    function bindEvents() {
      connection.System.OnQuit(function() {
        setDisconnected();
      });

      connection.System.OnRestart(function() {
        setDisconnected();
      });

      connection.System.OnSleep(function() {
        setDisconnected();
      });

      connection.System.OnWake(function() {
        setConnected();
      });
    }

    function createConnection() {
      var settings = rkSettingsService.get({category: 'connection'});
      
      if(!rkSettingsService.isConnectionConfigured() || !settings || isConnecting) {
        if(!rkSettingsService.isConnectionConfigured()) {
          $rootScope.$emit('rkNotConfigured');
        }
        
        if(!settings) {
          rkLogService.error('Settings object not available. System fault.');
        }
        
        connection = null;
        return;
      }

      isConnecting = true;

      kodiWs(settings.serverAddress, settings.jsonRpcPort).then(function(link) {
        if(link) {
          setConnected(link);
          bindEvents();
        }
        else {
          setDisconnected();
          connection = null;
        }
      },
      function(error) {
        setDisconnected();
        connection = null;
        rkLogService.error(error);
      });
    };
    
    function setConnected(link) {
      isConnecting = false;
      connection = link;
      startPing();
      $rootScope.$emit('rkWsConnectionStatusChange', connection);
    };
    
    function setDisconnected() {
      if(connection) {
        connection = null;
        isConnecting = false;
        stopPing();
        $rootScope.$emit('rkWsConnectionStatusChange', connection);
      }
    };
    
    function ping() {
      if(connection === null) {
        setDisconnected();
        connection = null;
        return;
      }
      
      connection.JSONRPC.Ping().then(function(data) {
        if(data !== 'pong') {
          stopPing();
          setDisconnected();
          connection = null;
        }
      }, function(error) {
        setDisconnected();
        connection = null;
      });
    };
    
    function startPing() {
      stopPing();
      
      pingInterval = setInterval(function() {
        ping();
      }, pingIntervalTime);
    };
    
    function stopPing() {
      clearInterval(pingInterval);
    };

    var connect = function(immmediately) {
      immmediately = (immmediately === undefined)? true : immmediately;
      
      if(immmediately) {
        createConnection();
      }
      
      clearInterval(retryInterval);
      retryInterval = setInterval(function() {
        if(connection === null) {
          createConnection();
        }
      }, retyIntervalTime);
    };
    
    var isConnected = function() {
      return (connection);
    };
    
    var getConnection = function() {
      return connection;
    };
    
    return {
      connect: connect,
      isConnected: isConnected,
      getConnection: getConnection
    };
  }
]);

