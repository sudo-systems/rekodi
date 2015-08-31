rekodiApp.factory('rkPlayerPropertiesService', ['$rootScope', 'rkLogService', 'rkRemoteControlService', 'rkConfigService',
  function($rootScope, rkLogService, rkRemoteControlService, rkConfigService) {
    var kodiApi = null;
    var updatePropertiesInterval = null;
    var currentProperties = {};
    var defaultProperties = rkConfigService.get('apiRequestProperties', 'player');

    var getProperties = function() {
      rkRemoteControlService.getActivePlayerId(function(playerId) {
        if(kodiApi && playerId !== null) {
          kodiApi.Player.GetProperties({
            playerid: playerId,
            properties: Object.keys(defaultProperties)
          }).then(function(data) {
            if(!angular.equals(currentProperties, data)) {
              currentProperties = data;
              $rootScope.$emit('rkPlayerPropertiesChange', data);
            }
          }, function(error) {
            rkLogService.error(error);
            currentProperties = defaultProperties;
            $rootScope.$emit('rkPlayerPropertiesChange', defaultProperties);
          });
        }
        else {
          currentProperties = defaultProperties;
          $rootScope.$emit('rkPlayerPropertiesChange', defaultProperties);
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
            currentProperties = angular.extend({}, currentProperties, response.property);
            $rootScope.$emit('rkPlayerPropertiesChange', currentProperties);
          });

          kodiApi.Player.OnStop(function(data) {
            currentProperties = defaultProperties;
            $rootScope.$emit('rkPlayerPropertiesChange', defaultProperties);
          });
        }
        else {
          currentProperties = defaultProperties;
          $rootScope.$emit('rkPlayerPropertiesChange', defaultProperties);
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