rekodiApp.factory('kodiApiService', ['$rootScope', '$localStorage', 'rkLogService', 'rkSettingsService', 'rkDialogService', 'rkNotificationService', 'rkTabsService',
  function($rootScope, $localStorage, rkLogService, rkSettingsService, rkDialogService, rkNotificationService, rkTabsService) {
    var kodiWs = require('node-kodi-ws');
    var wol = require('node-wol');
    var net = require('net');
    var retryConnectingTimeout;
    var connection = null;
    
    function bindEvents(link) {
      link.on('close', function() {
        setDisconnected();
      });
      
      link.System.OnQuit(function() {
        setDisconnected();
      });

      link.System.OnRestart(function() {
        setDisconnected();
      });

      link.System.OnSleep(function() {
        setDisconnected();
      });

      link.System.OnWake(function() {
        setConnected();
      });
    }

    var connect = function() {
      clearTimeout(retryConnectingTimeout);
      var isConfigured = rkSettingsService.isConnectionConfigured();

      if(!isConfigured) {
        connection = null;
        return;
      }

      wakeHost();

      kodiWs($localStorage.settings.connection.serverAddress, $localStorage.settings.connection.jsonRpcPort).then(function(link) {
        if(link) {
          setConnected(link);
          return;
        }
        
        setDisconnected();
      },
      function(error) {
        setDisconnected(error);
      });
    };

    function setConnected(link) {
      connection = link;
      bindEvents(link);
      $rootScope.$emit('rkWsConnectionStatusChange', connection);
      rkNotificationService.notifyConnection(true, 'The connection with Kodi has been established');
      rkDialogService.closeAll();
    };
    
    function setDisconnected(error) {
      connection = null;
      
      if(rkSettingsService.isConnectionConfigured()) {
        if(rkTabsService.getActiveTab() !== 'settings') {
          rkDialogService.showNotConnected();
        }
        
        retryConnectingTimeout = setTimeout(function() {
          connect();
        }, 1000);
      }

      if(error) {
        rkLogService.debug(error);
      }
      
      $rootScope.$emit('rkWsConnectionStatusChange', connection);
    };
    
    var wakeHost = function() {
      if($localStorage.settings.connection.macAddress && $localStorage.settings.connection.macAddress.length >= 12) {
        wol.wake($localStorage.settings.connection.macAddress, {
          address: $localStorage.settings.connection.serverAddress,
          port: 7
        }, function(error) {
          if(error) {
            setDisconnected(error);
            return;
          }
        });
      }
    };

    var isConnected = function() {
      return (connection);
    };
    
    var getConnection = function() {
      return connection;
    };
    
    function init() {
      $rootScope.$watch(function() {
        return $localStorage.settings.connection;
      }, function(newData, oldData) {
        clearTimeout(retryConnectingTimeout);
        
        if(!angular.equals(newData, oldData)) {
          retryConnectingTimeout = setTimeout(function() {
            connect();
          }, 500);
        }
      }, true);
    }
    
    init();

    return {
      connect: connect,
      isConnected: isConnected,
      getConnection: getConnection,
      setDisconnected: setDisconnected,
      wakeHost: wakeHost
    };
  }
]);

