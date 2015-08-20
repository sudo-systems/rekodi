rekodiApp.factory('kodiApiService', ['$rootScope', '$localStorage', 'rkNotificationService',
  function($rootScope, $localStorage, rkNotificationService) {
    var kodiWs = require('xbmc-ws');
    var connectingInProgress = false;
    var connection = null;
    var retyIntervalTime = 10000;
    var retryInterval;
    var pingIntervalTime = 5000;
    var pingInterval;
    var connectingMessage = 'connecting...';
    var connectedMessage = 'successfully connected to Kodi';
    var connectionErrorMessage = 'could not connect to Kodi';
    var connectionStatus = {
      connecting: false,
      connected: false,
      statusMessage: 'offline'
    };

    function bindEvents() {
      connection.System.OnQuit(function() {
        setDisconnected();
      });

      connection.System.OnRestart(function() {
        setDisconnected();
        connectionStatus.statusMessage = 'rebooting';
      });

      connection.System.OnSleep(function() {
        setDisconnected();
        connectionStatus.statusMessage = 'sleeping';
      });

      connection.System.OnWake(function() {
        setConnected();
        rkNotificationService.notifyConnection(true, 'Kodi woke up');
      });
    }

    function createConnection() {
      if(!isConfigured() || connectingInProgress) {
        var statusMessage = (connectingInProgress)? 'connecting' : 'offline';
                
        connectionStatus = {
          connecting: connectingInProgress,
          connected: false, 
          statusMessage: statusMessage
        };

        connection = null;
        return;
      }

      connectingInProgress = true;
      
      $rootScope.$emit('rkStartConnecting', {
        message: connectingMessage
      });

      kodiWs($localStorage.settings.serverAddress, $localStorage.settings.jsonRpcPort).then(function(link) {
        if(link) {
          setConnected(link);
          bindEvents();
        }
        else {
          setDisconnected();
          connection = false;
        }
      },
      function(error) {
        setDisconnected();
        connection = false;
      });
    };
    
    function setConnected(link) {
      connectingInProgress = false;
      connection = link;
      startPing();
      
  
      connectionStatus = {
        connecting: false,
        connected: true, 
        statusMessage: 'online'
      };
        
      $rootScope.$emit('rkStopConnecting', {message: connectedMessage});
      $rootScope.$emit('rkWsConnectionStatusChange', connectionStatus);
      rkNotificationService.notifyConnection(true, 'Connection with Kodi has been established');
    };
    
    function setDisconnected() {
      if(connection !== false) {
        connection = null;
        connectingInProgress = false;
        stopPing();
 
        connectionStatus = {
          connecting: false,
          connected: false, 
          statusMessage: 'offline'
        };

        $rootScope.$emit('rkStopConnecting', {message: connectionErrorMessage});
        $rootScope.$emit('rkWsConnectionStatusChange', connectionStatus);
        rkNotificationService.notifyConnection(false, 'Connection with Kodi has been lost');
      }
    };
    
    function ping() {
      if(connection === null) {
        setDisconnected();
        connection = false;
        return;
      }
      
      connection.JSONRPC.Ping().then(function(data) {
        if(data !== 'pong') {
          stopPing();
          setDisconnected();
          connection = false;
        }
      }, function(error) {
        setDisconnected();
        connection = false;
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
    
    var isConfigured = function() {
      return (!$localStorage.settings ||
        $localStorage.settings.constructor !== Object ||
        !$localStorage.settings.serverAddress || 
        !$localStorage.settings.jsonRpcPort || 
        $localStorage.settings.serverAddress === '' || 
        $localStorage.settings.jsonRpcPort === '')? false : true;
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
      getConnection: getConnection,
      isConfigured: isConfigured
    };
  }
]);

