rekodiApp.factory('rkKodiPropertiesService', ['$rootScope', 'kodiApiService', 'rkLogService',
  function($rootScope, kodiApiService, rkLogService) {
    var kodiApi = null;
    var currentProperties = {};
    var defaultProperties = {
      volume: 0, 
      muted: false, 
      name: 'Kodi', 
      version: ''
    };

    var get = function() {
      kodiApi = kodiApiService.getConnection();

      if(kodiApi) {
        kodiApi.Application.GetProperties({
          properties: Object.keys(defaultProperties)
        }).then(function(data) {
          if(!angular.equals(currentProperties, data)) {
            currentProperties = data;
            $rootScope.$emit('rkKodiPropertiesChange', data);
          }
        }, function(error) {
          rkLogService.error(error);
          setDefaults();
        });
      }
      else {
        setDefaults();
      }
    };
    
    var setDefaults = function() {
      $rootScope.$emit('rkKodiPropertiesChange', defaultProperties);
    };
    
    function init() {
      $rootScope.$on('rkWsConnectionStatusChange', function(event, connection) {
        kodiApi = connection;
        
        if(kodiApi) {
          kodiApi.Application.OnVolumeChanged(function(response) {
            if(response.data) {
              for(var key in response.data) {
                currentProperties[key] = response.data[key];
              }
            }

            $rootScope.$emit('rkKodiPropertiesChange', currentProperties);
          });
          
          get();
        }
        else {
          setDefaults();
        }
      });
    }

    init();
    
    return {
      
    };
  }
]);