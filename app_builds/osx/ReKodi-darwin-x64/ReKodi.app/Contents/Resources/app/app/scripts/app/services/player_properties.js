rekodiApp.factory('rkPlayerPropertiesService', ['$rootScope', 'kodiApiService', 'rkHelperService', 'rkRemoteControlService',
  function($rootScope, kodiApiService, rkHelperService, rkRemoteControlService) {
    var kodiApi = null;
    var updatePropertiesInterval = null;
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

    var getProperties = function() {
      rkRemoteControlService.getActivePlayerId(function(playerId) {
        if(playerId !== null) {
          kodiApi.Player.GetProperties({
            playerid: playerId,
            properties: Object.keys(defaultProperties)
          }).then(function(data) {
            if(!angular.equals(currentProperties, data)) {
              currentProperties = data;
              $rootScope.$emit('rkPlayerPropertiesChange', data);
            }
          }, function(error) {
            rkHelperService.handleError(error);
            $rootScope.$emit('rkPlayerPropertiesChange', defaultProperties);
          });
        }
        else {
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
      $rootScope.$on('rkWsConnectionStatusChange', function(event, data) {
        kodiApi = kodiApiService.getConnection();
        
        if(kodiApi) {
          getProperties();
          
          kodiApi.Player.OnPropertyChanged(function(response) {
            getProperties();
          });
        }
        else {
          $rootScope.$emit('rkPlayerPropertiesChange', defaultProperties);
        }
      });
    }

    init();
    
    return {
      startUpdateInterval: startUpdateInterval,
      stopUpdateInterval: stopUpdateInterval
    };
  }
]);