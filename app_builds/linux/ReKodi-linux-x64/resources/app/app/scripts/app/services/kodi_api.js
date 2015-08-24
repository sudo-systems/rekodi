rekodiApp.factory('kodiApiService', ['$rootScope', 'rkHelperService', 'rkSettingsService',
  function($rootScope, rkHelperService, rkSettingsService) {
    var kodiWs = require('xbmc-ws');
    var connectingInProgress = false;
    var connection = null;
    var retyIntervalTime = 10000;
    var retryInterval;
    var pingIntervalTime = 5000;
    var pingInterval;
    var settings = rkSettingsService.get({category: 'connection'});
    
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
      if(!rkSettingsService.isConnectionConfigured() || connectingInProgress) {
        connection = null;
        return;
      }

      connectingInProgress = true;

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
        rkHelperService.handleError(error);
      });
    };
    
    function setConnected(link) {
      connectingInProgress = false;
      connection = link;
      startPing();
      $rootScope.$emit('rkWsConnectionStatusChange', connection);
    };
    
    function setDisconnected() {
      if(connection) {
        connection = null;
        connectingInProgress = false;
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

