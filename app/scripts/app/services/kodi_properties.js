rekodiApp.factory('rkKodiPropertiesService', ['$rootScope', 'kodiApiService', 'rkLogService', 'rkConfigService',
  function($rootScope, kodiApiService, rkLogService, rkConfigService) {
    var kodiApi = null;
    var currentProperties = {};
    var defaultProperties = rkConfigService.get('apiRequestProperties', 'kodi');

    var get = function() {
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
      currentProperties = defaultProperties;
      $rootScope.$emit('rkKodiPropertiesChange', defaultProperties);
    };
    
    function initConnectionChange() {
      if(kodiApi) {
        kodiApi.Application.OnVolumeChanged(function(response) {
          if(response.data) {
            if(!angular.equals(response.data, currentProperties)) {
              currentProperties = response.data;
              $rootScope.$emit('rkKodiPropertiesChange', currentProperties);
            }
          }
          else {
            setDefaults();
          }
        });

        get();
      }
      else {
        setDefaults();
      }
    }
    
    function init() {
      kodiApi = kodiApiService.getConnection();
      initConnectionChange();

      $rootScope.$on('rkWsConnectionStatusChange', function(event, connection) {
        kodiApi = connection;
        initConnectionChange();
      });
    }

    init();
    
    return {};
  }
]);