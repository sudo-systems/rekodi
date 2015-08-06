rekodiApp.factory('rkNowPlayingService', ['$rootScope', 'rkKodiWsApiService', '$sessionStorage', 'rkEnumsService',
  function($rootScope, rkKodiWsApiService, $sessionStorage, rkEnumsService) {
    var kodiWsApiConnection = null;
    $sessionStorage.playStatus = {
      isPlaying: false,
      playerType: null,
      item: null
    };
    
    var getActivePlayer = function(callback) {
      kodiWsApiConnection.Player.GetActivePlayers().then(function(data) {
        var playerId = (data[0])? data[0].playerid : null;
        callback(playerId);
      }, function(error) {
        handleError(error);
        callback(null);
      });
    };
    
    var getInfo = function(playerId) {
      if(playerId !== null && playerId !== undefined) {
        getItem(playerId);
      }
      else {
        getActivePlayer(function(playerId) {
          if(playerId !== null) {
            getItem(playerId);
          }
        });
      }
    };
    
    var getItem = function(playerId) {
      kodiWsApiConnection.Player.GetItem({
        playerid: playerId,
        properties: ['title', 'artist', 'albumartist', 'displayartist', 'album', 'track', 'year', 'genre', 'thumbnail', 'playcount', 'file', 'duration']
      }).then(function(data) {
        if(data.item) {
          if(data.item.duration) {
            var duration = moment.duration(parseInt(data.item.duration), 'seconds');
            data.item.duration_readable = duration.format('HH:mm:ss');
          }
          
          $sessionStorage.playStatus = {
            isPlaying: true,
            playerType: (rkEnumsService.PlaylistId.AUDIO === playerId)? 'audio' : 'video',
            item: data.item
          };
        }
        else {
          $sessionStorage.playStatus = {
            isPlaying: false,
            playerType: null,
            item: null
          };
        }
      }, function(error) {
        $sessionStorage.nowPlaying = {};
        handleError(error);
      });
    };
    
    var handleError = function(error) {
      var errorDetails = (error.response.data)? ' ('+error.response.data.stack.message+': '+error.response.data.stack.name+')' : '';
      $rootScope.$emit('rkServerError', {
        message: error.response.message+errorDetails
      });
    };
    
    var init = function() {
      $rootScope.$watchCollection(function() {
        return $sessionStorage.connectionStatus;
      }, function(newValue, oldValue) {
        if(newValue.connected) {
          kodiWsApiConnection = rkKodiWsApiService.getConnection();
          
          getInfo();
          
          kodiWsApiConnection.Player.OnPlay(function(response) {
            var playerId = (response.data)? response.data.player.playerid : null;
            getInfo(playerId);
          });

          kodiWsApiConnection.Player.OnStop(function(response) {
            $sessionStorage.playStatus = {
              isPlaying: false,
              playerType: null,
              item: null
            };
          });
        }
        else {
          kodiWsApiConnection = null;
        }
      });
    };
    
    init();
    
    return {
      
    };
  }
]);