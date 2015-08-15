rekodiApp.factory('rkPlayerPropertiesService', ['$rootScope', 'kodiApiService', 'rkHelperService', 'rkRemoteControlService',
  function($rootScope, kodiApiService, rkHelperService, rkRemoteControlService) {
    var kodiApi = null;
    var currentProperties = {};
    var defaultProperties = {
      audiostreams: [],
      canchangespeed: false,
      canmove: false,
      canrepeat: false,
      canrotate: false,
      canseek: false,
      canshuffle: false,
      canzoom: false,
      currentaudiostream: {},
      currentsubtitle: {},
      live: false,
      partymode: false,
      percentage: 0,
      playlistid: -1,
      position: 0,
      repeat: 'off',
      shuffled: false,
      speed: 0,
      subtitleenabled: false,
      subtitles: [],
      time: {},
      totaltime: {},
      type: null
    };

    var get = function() {
      rkRemoteControlService.getActivePlayerId(function(playerId) {
        kodiApi = kodiApiService.getConnection();

        if(kodiApi && playerId !== null) {
          kodiApi.Player.GetProperties({
            playerid: playerId,
            properties: Object.keys(defaultProperties)
          }).then(function(data) {
            if(JSON.stringify(currentProperties) !== JSON.stringify(data)) {
              currentProperties = data;
              $rootScope.$emit('rkPlayerPropertiesChange', data);
            }
          }, function(error) {
            rkHelperService.handleError(error);
            setDefaults();
          });
        }
        else {
          setDefaults();
        }
      });
    };
    
    var setDefaults = function() {
      $rootScope.$emit('rkPlayerPropertiesChange', defaultProperties);
    };
    
    function init() {
      $rootScope.$on('rkWsConnectionStatusChange', function(event, data) {
        kodiApi = kodiApiService.getConnection();
        
        if(kodiApi) {
          kodiApi.Player.OnPropertyChanged(function(response) {
            if(response.data && response.data.property) {
              for(var key in response.data.property) {
                currentProperties[key] = response.data.property[key];
              }
            }

            $rootScope.$emit('rkPlayerPropertiesChange', currentProperties);
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