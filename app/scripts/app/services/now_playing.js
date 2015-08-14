rekodiApp.factory('rkNowPlayingService', ['$rootScope', '$timeout', 'rkKodiWsApiService', 'rkEnumsService', 'rkHelperService', 'rkRemoteControlService',
  function($rootScope, $timeout, rkKodiWsApiService, rkEnumsService, rkHelperService, rkRemoteControlService) {
    var kodiWsApiConnection = null;
    var currentData = {};
    var getInfoInterval = null;
    var itemProperties = [];
    itemProperties[rkEnumsService.PlayerId.AUDIO] = ['title', 'artist', 'albumartist', 'displayartist', 'album', 'track', 'year', 'genre', 'thumbnail', 'playcount', 'file', 'duration'];
    itemProperties[rkEnumsService.PlayerId.VIDEO] = ['title', 'file', 'thumbnail', 'plotoutline', 'year', 'season', 'episode', 'showtitle', 'plot', 'runtime'];
    
    var getInfo = function(playerId) {
      if(playerId) {
        clearInterval(getInfoInterval);
        getItem(playerId);

        getInfoInterval = setInterval(function() {
          getItem(playerId);
        }, 1000);
        
        return;
      }
      
      clearInterval(getInfoInterval);
      rkRemoteControlService.getActivePlayerId(function(playerId) {
        getItem(playerId);
      });

      getInfoInterval = setInterval(function() {
        rkRemoteControlService.getActivePlayerId(function(playerId) {
          getItem(playerId);
        });
      }, 1000);
    };
    
    var setNotPlaying = function() {
      $rootScope.$emit('rkNowPlayingDataUpdated', {
        isPlaying: false,
        playerType: null,
        item: null
      });
    };
    
    var setIsPlaying = function(playerId, data) {
      if(JSON.stringify(currentData) !== JSON.stringify(data.item)) {
        currentData = data.item;
        
        $rootScope.$emit('rkNowPlayingDataUpdated', {
          isPlaying: true,
          playerType: (rkEnumsService.PlaylistId.AUDIO === playerId)? 'audio' : 'video',
          item: data.item
        });
      }
    };
    
    var getItem = function(playerId) {
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
      if(kodiWsApiConnection && playerId !== null) {
        kodiWsApiConnection.Player.GetItem({
          playerid: playerId,
          properties: itemProperties[playerId]
        }).then(function(data) {
          if(data.item) {
            data.item = rkHelperService.addCustomFields(data.item);
            setIsPlaying(playerId, data);
          }
          else {
            setNotPlaying();
          }
        }, function(error) {
          setNotPlaying();
          rkHelperService.handleError(error);
        });
      }
      else {
        clearInterval(getInfoInterval);
        setNotPlaying();
      }
    };

    var init = function() {
      $rootScope.$on('rkWsConnectionStatusChange', function(event, data) {
        if(data.connected) {
          kodiWsApiConnection = rkKodiWsApiService.getConnection();

          kodiWsApiConnection.Player.OnPlay(function(response) {
            getInfo(response.data.player.playerid);
          });

          kodiWsApiConnection.Player.OnStop(function(response) {
            setNotPlaying();
          });
          
          getInfo();
        }
        else {
          setNotPlaying();
        }
      });
    };

    init();
    
    return {
      
    };
  }
]);