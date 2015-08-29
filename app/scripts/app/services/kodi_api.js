rekodiApp.factory('kodiApiService', ['$rootScope', 'rkLogService', 'rkSettingsService', 'rkDialogService', 'rkNotificationService', 'rkTabsService',
  function($rootScope, rkLogService, rkSettingsService, rkDialogService, rkNotificationService, rkTabsService) {
    var kodiWs = require('node-kodi-ws');
    var wol = require('wake_on_lan');
    var isConnecting = false;
    var retryConnectingTimeout;
    var connection = null;
    
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

    var connect = function() {
      clearTimeout(retryConnectingTimeout);
      var isConfigured = rkSettingsService.isConnectionConfigured();

      if(!isConfigured || isConnecting) {
        if(!isConfigured && rkTabsService.getActiveTab() !== 'settings') {
          rkDialogService.showNotConfigured();
        }

        connection = null;
        return;
      }

      var settings = rkSettingsService.get({category: 'connection'});
      setIsConnecting();
      wakeHost();

      kodiWs(settings.serverAddress, settings.jsonRpcPort).then(function(link) {
        if(link) {
          setIsConnected(link);
          bindEvents(link);
        }
      },
      function(error) {
        setIsDisconnected(error);
      });
    };
    
    function setIsConnecting() {
      isConnecting = true;
      //rkDialogService.showConnecting();
    }
    
    function setIsConnected(link) {
      isConnecting = false;
      connection = link;
      bindEvents(link);
      $rootScope.$emit('rkWsConnectionStatusChange', connection);
      rkNotificationService.notifyConnection(true, 'The connection with Kodi has been established');
      rkDialogService.closeAll();
    };
    
    function setIsDisconnected(error) {
      connection = null;
      isConnecting = false;
      $rootScope.$emit('rkWsConnectionStatusChange', connection);
      
      if(rkSettingsService.isConnectionConfigured()) {
        if(rkTabsService.getActiveTab() !== 'settings') {
          rkDialogService.showNotConnected();
        }
        
        retryConnectingTimeout = setTimeout(function() {
          connect();
        }, 2000);
      }

      if(error) {
        rkLogService.error(error);
      }
    };
    
    var wakeHost = function() {
      var macAddress = rkSettingsService.get({category: 'connection', key: 'macAddress'});
      
      if(macAddress && macAddress.length === 17) {
        wol.wake(macAddress, function(error) { 
          if(error) {
            rkLogService.error(error);
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

    return {
      connect: connect,
      isConnected: isConnected,
      getConnection: getConnection,
      wakeHost: wakeHost
    };
  }
]);

