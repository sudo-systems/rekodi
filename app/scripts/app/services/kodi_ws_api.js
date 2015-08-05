rekodiApp.factory('rkKodiWsApiService', ['$rootScope', '$localStorage', '$sessionStorage',
  function($rootScope, $localStorage, $sessionStorage) {
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

    function bindEvents() {
      connection.System.OnQuit(function() {
        setDisconnected();
      });

      connection.System.OnRestart(function() {
        setDisconnected();
        $sessionStorage.connectionStatus.statusMessage = 'rebooting';
      });

      connection.System.OnSleep(function() {
       setDisconnected();
        $sessionStorage.connectionStatus.statusMessage = 'sleeping';
      });

      connection.System.OnWake(function() {
        setConnected();
      });
    }

    function createConnection() {
      if(!$localStorage.settings || 
          !$localStorage.settings.serverAddress || 
          !$localStorage.settings.jsonRpcPort || 
          $localStorage.settings.serverAddress === '' || 
          $localStorage.settings.jsonRpcPort === '' || 
          connectingInProgress) {
        $sessionStorage.connectionStatus = {
          connecting: true,
          connected: false, 
          statusMessage: 'offline'
        };

        connection = null;

        return;
      }
      
      connectingInProgress = true;
      
      $rootScope.$emit('rkStartConnecting', {
        message: connectingMessage
      });

      kodiWs($localStorage.settings.serverAddress, $localStorage.settings.jsonRpcPort).then(function(link) {
        setConnected(link);
        bindEvents();
      },
      function(error) {
        setDisconnected();
      });
    };
    
    function setConnected(link) {
      startPing();
      connectingInProgress = false;
        
      $sessionStorage.connectionStatus = {
        connecting: false,
        connected: true, 
        statusMessage: 'online'
      };

      if(link) {
        connection = link;
      }

      $rootScope.$emit('rkStopConnecting', {
        message: connectedMessage
      });

      $rootScope.$emit('rkWsConnectionStatusChange', $sessionStorage.connectionStatus);
    };
    
    function setDisconnected() {
      stopPing();
      connectingInProgress = false;
        
      $sessionStorage.connectionStatus = {
        connecting: false,
        connected: false, 
        statusMessage: 'offline'
      };

      connection = null;

      $rootScope.$emit('rkStopConnecting', {
        message: connectionErrorMessage
      });

      $rootScope.$emit('rkWsConnectionStatusChange', $sessionStorage.connectionStatus);
    };
    
    function ping() {
      if(connection === null) {
        setDisconnected();
        return;
      }
      
      connection.JSONRPC.Ping().then(function(data) {
        if(data !== 'pong') {
          stopPing();
          setDisconnected();
        }
      }, function(error) {
        setDisconnected();
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
      return $sessionStorage.connectionStatus.connected;
    };
    
    var getConnection = function() {
      return connection;
    };
    
    var init = function() {
      $sessionStorage.connectionStatus = {
        connecting: false,
        connected: false,
        statusMessage: 'offline'
      };
    };
    
    init();

    return {
      connect: connect,
      isConnected: isConnected,
      getConnection: getConnection,
      isConfigured: isConfigured
    };
  }
]);

