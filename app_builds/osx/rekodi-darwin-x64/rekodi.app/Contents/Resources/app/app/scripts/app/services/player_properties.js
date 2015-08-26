rekodiApp.factory('rkPlayerPropertiesService', ['$rootScope', 'rkLogService', 'rkRemoteControlService', 'rkConfigService',
  function($rootScope, rkLogService, rkRemoteControlService, rkConfigService) {
    var kodiApi = null;
    var updatePropertiesInterval = null;
    var currentProperties = {};
    var requestProperties = rkConfigService.get('apiRequestProperties', 'player');

    var getProperties = function() {
      rkRemoteControlService.getActivePlayerId(function(playerId) {
        if(playerId !== null) {
          kodiApi.Player.GetProperties({
            playerid: playerId,
            properties: Object.keys(requestProperties)
          }).then(function(data) {
            if(!angular.equals(currentProperties, data)) {
              currentProperties = data;
              $rootScope.$emit('rkPlayerPropertiesChange', data);
            }
          }, function(error) {
            rkLogService.error(error);
            currentProperties = requestProperties;
            $rootScope.$emit('rkPlayerPropertiesChange', requestProperties);
          });
        }
        else {
          currentProperties = requestProperties;
          $rootScope.$emit('rkPlayerPropertiesChange', requestProperties);
        }
      });
    };

    var startUpdateInterval = function() {
      getProperties();
      clearInterval(updatePropertiesInterval);
      
      updatePropertiesInterval = setInterval(function() {
        getProperties();
      }, 1000);
    };
    
    var stopUpdateInterval = function() {
      clearInterval(updatePropertiesInterval);
    };

    function init() {
      $rootScope.$on('rkWsConnectionStatusChange', function(event, connection) {
        kodiApi = connection;
        
        if(kodiApi) {
          getProperties();
          
          kodiApi.Player.OnPropertyChanged(function(response) {
            getProperties();
          });
          
          kodiApi.Player.OnStop(function(data) {
            currentProperties = requestProperties;
            $rootScope.$emit('rkPlayerPropertiesChange', requestProperties);
          });
        }
        else {
          currentProperties = requestProperties;
          $rootScope.$emit('rkPlayerPropertiesChange', requestProperties);
        }
      });
    }

    init();
    
    return {
      getProperties: getProperties,
      startUpdateInterval: startUpdateInterval,
      stopUpdateInterval: stopUpdateInterval
    };
  }
]);