rekodiApp.factory('rkKodiPropertiesService', ['$rootScope', 'kodiApiService', 'rkLogService', 'rkConfigService',
  function($rootScope, kodiApiService, rkLogService, rkConfigService) {
    var kodiApi = null;
    var currentProperties = {};
    var requestProperties = rkConfigService.get('apiRequestProperties', 'kodi');

    var get = function() {
      if(kodiApi) {
        kodiApi.Application.GetProperties({
          properties: Object.keys(requestProperties)
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
      $rootScope.$emit('rkKodiPropertiesChange', requestProperties);
    };
    
    function init() {
      kodiApi = kodiApiService.getConnection();
      get();
      
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
    
    return {};
  }
]);