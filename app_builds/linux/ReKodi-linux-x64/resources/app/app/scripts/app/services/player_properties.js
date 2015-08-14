rekodiApp.factory('rkPlayerPropertiesService', ['$rootScope', 'rkKodiWsApiService', 'rkHelperService', 'rkRemoteControlService',
  function($rootScope, rkKodiWsApiService, rkHelperService, rkRemoteControlService) {
    var kodiWsApiConnection = null;
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
        kodiWsApiConnection = rkKodiWsApiService.getConnection();

        if(kodiWsApiConnection && playerId !== null) {
          kodiWsApiConnection.Player.GetProperties({
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
        if(data.connected) {
          kodiWsApiConnection = rkKodiWsApiService.getConnection();
          
          kodiWsApiConnection.Player.OnPropertyChanged(function(response) {
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