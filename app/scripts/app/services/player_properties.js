rekodiApp.factory('rkPlayerPropertiesService', ['$rootScope', '$timeout', 'rkKodiWsApiService', 'rkHelperService',
  function($rootScope, $timeout, rkKodiWsApiService, rkHelperService) {
    var kodiWsApiConnection = null;
    var getPropertiesInterval = null;
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
      speed: 1,
      subtitleenabled: false,
      subtitles: [],
      time: {},
      totaltime: {},
      type: null
    };
    
    var getActivePlayer = function(callback) {
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
      if(kodiWsApiConnection) {
        kodiWsApiConnection.Player.GetActivePlayers().then(function(data) {
          var playerId = (data[0])? data[0].playerid : null;
          callback(playerId);
        }, function(error) {
          rkHelperService.handleError(error);
          callback(null);
        });
      }
      else {
        clearInterval(getPropertiesInterval);
        setDefaults();
      }
    };
    
    var get = function() {
      getActivePlayer(function(playerId) {
        kodiWsApiConnection = rkKodiWsApiService.getConnection();

        if(kodiWsApiConnection && playerId !== null) {
          kodiWsApiConnection.Player.GetProperties({
            playerid: playerId,
            properties: ['canrepeat', 'canmove', 'canshuffle', 'speed', 'percentage', 'playlistid', 'audiostreams', 'position', 'repeat', 'currentsubtitle', 'canrotate', 'canzoom', 'canchangespeed', 'type', 'partymode', 'subtitles', 'canseek', 'time', 'totaltime', 'shuffled', 'currentaudiostream', 'live', 'subtitleenabled']
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
          clearInterval(getPropertiesInterval);
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
          getPropertiesInterval = setInterval(function() {
            get();
          }, 1000);
          
          get();
        }
        else {
          clearInterval(getPropertiesInterval);
          setDefaults();
        }
      });
    }
    
    $timeout(function() {
      init();
    });
    
    return {
      
    };
  }
]);