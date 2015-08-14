rekodiApp.factory('rkKodiPropertiesService', ['$rootScope', 'rkKodiWsApiService', 'rkHelperService',
  function($rootScope, rkKodiWsApiService, rkHelperService) {
    var kodiWsApiConnection = null;
    var currentProperties = {};
    var defaultProperties = {
      volume: 0, 
      muted: false, 
      name: 'Kodi', 
      version: ''
    };

    var get = function() {
      kodiWsApiConnection = rkKodiWsApiService.getConnection();

      if(kodiWsApiConnection) {
        kodiWsApiConnection.Application.GetProperties({
          properties: Object.keys(defaultProperties)
        }).then(function(data) {
          if(JSON.stringify(currentProperties) !== JSON.stringify(data)) {
            currentProperties = data;
            $rootScope.$emit('rkKodiPropertiesChange', data);
          }
        }, function(error) {
          rkHelperService.handleError(error);
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
      $rootScope.$on('rkWsConnectionStatusChange', function(event, data) {
        if(data.connected) {
          kodiWsApiConnection = rkKodiWsApiService.getConnection();
          
          kodiWsApiConnection.Application.OnVolumeChanged(function(response) {
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