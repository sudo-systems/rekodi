rekodiApp.factory('kodiApiService', ['$rootScope', 'rkLogService', 'rkSettingsService', 'rkDialogService', 'rkNotificationService', 'rkConfigService',
  function($rootScope, rkLogService, rkSettingsService, rkDialogService, rkNotificationService, rkConfigService) {
    var kodiWs = require('xbmc-ws');
    var isConnecting = false;
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
      var isConfigured = rkSettingsService.isConnectionConfigured();
      
      if(!isConfigured || isConnecting) {
        if(!isConfigured && !isConnecting) {
          rkDialogService.showNotConfigured();
        }

        connection = null;
        return;
      }

      var settings = rkSettingsService.get({category: 'connection'});
      setIsConnecting();

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
      rkNotificationService.notifyConnection(true, 'Connection with Kodi has been established');
      rkDialogService.closeAll();
    };
    
    function setIsDisconnected(error) {
      connection = null;
      isConnecting = false;
      connect();
      $rootScope.$emit('rkWsConnectionStatusChange', connection);
      rkDialogService.showNotConnected();
      rkNotificationService.notifyConnection(false, 'Could not connect with Kodi');
      connect();
      
      if(error) {
        rkLogService.error(error);
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
      getConnection: getConnection
    };
  }
]);

