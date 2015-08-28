rekodiApp.factory('kodiApiService', ['$rootScope', '$timeout', 'rkLogService', 'rkSettingsService', 'rkDialogService', 'rkNotificationService',
  function($rootScope, $timeout, rkLogService, rkSettingsService, rkDialogService, rkNotificationService) {
    var kodiWs = require('xbmc-ws');
    var isConnecting = false;
    var connection = null;
    var retyIntervalTime = 10000;
    var pingIntervalTime = 5000;
    var pingInterval, retryInterval;
    
    function bindEvents(link) {
      link.System.OnQuit(function() {
        setIsDisconnected();
      });

      link.System.OnRestart(function() {
        setIsDisconnected();
      });

      link.System.OnSleep(function() {
        setIsDisconnected();
      });

      link.System.OnWake(function() {
        setIsConnected();
      });
    }

    function createConnection() {
      var settings = rkSettingsService.get({category: 'connection'});
      var isConfigured = rkSettingsService.isConnectionConfigured();
      
      if(!isConfigured || !settings || isConnecting) {
        if(!isConfigured && !isConnecting) {
          rkDialogService.showNotConfigured();
        }

        connection = null;
        return;
      }

      setIsConnecting();

      kodiWs(settings.serverAddress, settings.jsonRpcPort).then(function(link) {
        if(link) {
          setIsConnected(link);
          bindEvents(link);
        }
        else {
          connection = null;
          setIsDisconnected();
        }
      },
      function(error) {
        connection = null;
        rkLogService.error(error);
        setIsDisconnected();
      });
    };
    
    function setIsConnecting() {
      isConnecting = true;
      //rkDialogService.showConnecting();
      stopPing();
    }
    
    function setIsConnected(link) {
      isConnecting = false;
      connection = link;
      startPing();
      $rootScope.$emit('rkWsConnectionStatusChange', connection);
      rkNotificationService.notifyConnection(true, 'Connection with Kodi has been established');
      rkDialogService.closeAll();
    };
    
    function setIsDisconnected() {
      if(connection) {
        connection = null;
        isConnecting = false;
        stopPing();
        $rootScope.$emit('rkWsConnectionStatusChange', connection);
        rkDialogService.showNotConnected();
        rkNotificationService.notifyConnection(false, 'Could not connect with Kodi');
      }
    };
    
    function ping() {
      if(connection === null) {
        setIsDisconnected();
        connection = null;
        return;
      }
      
      connection.JSONRPC.Ping().then(function(data) {
        if(data !== 'pong') {
          stopPing();
          setIsDisconnected();
          connection = null;
        }
      }, function(error) {
        setIsDisconnected();
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

