rekodiApp.factory('rkNowPlayingService', ['$rootScope', 'rkKodiWsApiService', '$sessionStorage', 'rkEnumsService', '$localStorage',
  function($rootScope, rkKodiWsApiService, $sessionStorage, rkEnumsService, $localStorage) {
    var kodiWsApiConnection = null;
    var itemProperties = [];
    itemProperties[rkEnumsService.PlayerId.AUDIO] = ['title', 'artist', 'albumartist', 'displayartist', 'album', 'track', 'year', 'genre', 'thumbnail', 'playcount', 'file', 'duration'];
    itemProperties[rkEnumsService.PlayerId.VIDEO] = ['title', 'file', 'thumbnail', 'plotoutline', 'year', 'season', 'episode', 'showtitle', 'plot'];
    
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
    
    var getInfo = function() {
      setInterval(function() {
        getActivePlayer(function(playerId) {
          if(playerId !== null) {
            getItem(playerId);
          }
        });
      }, 1000);
    };
    
    var getItem = function(playerId) {

      kodiWsApiConnection.Player.GetItem({
        playerid: playerId,
        properties: itemProperties[playerId]
      }).then(function(data) {
        if(data.item) {
          if(data.item.duration) {
            data.item.duration_readable = moment.duration(parseInt(data.item.duration), 'seconds');
          }
          
          if(data.item.thumbnail && data.item.thumbnail !== '') {
            var usernameAndPassword = ($localStorage.settings.password && $localStorage.settings.password !== '')? $localStorage.settings.username+':'+$localStorage.settings.password+'@' : '';
            data.item.thumbnail_url = 'http://'+usernameAndPassword+$localStorage.settings.serverAddress+':'+$localStorage.settings.httpPort+'/image/'+encodeURIComponent(data.item.thumbnail);
          }

          $sessionStorage.playStatus = {
            isPlaying: true,
            playerType: (rkEnumsService.PlaylistId.AUDIO === playerId)? 'audio' : 'video',
            item: data.item
          };
          
          $rootScope.$emit('rkNowPlayingDataUpdated', $sessionStorage.playStatus);
        }
        else {
          $sessionStorage.playStatus = {
            isPlaying: false,
            playerType: null,
            item: null
          };
          
          $rootScope.$emit('rkNowPlayingDataUpdated', $sessionStorage.playStatus);
        }
      }, function(error) {
        $sessionStorage.nowPlaying = {
          isPlaying: false,
          playerType: null,
          item: null
        };
        
        $rootScope.$emit('rkNowPlayingDataUpdated', $sessionStorage.playStatus);
        handleError(error);
      });
    };

    var handleError = function(error) {
      var errorDetails = (error.response.data)? ' ('+error.response.data.stack.message+': '+error.response.data.stack.name+')' : '';
      $rootScope.$emit('rkServerError', {
        message: error.response.message+errorDetails
      });
      
      console.dir(error);
    };
    
    var init = function() {
      $rootScope.$watchCollection(function() {
        return $sessionStorage.connectionStatus;
      }, function(newValue, oldValue) {
        if(newValue.connected) {
          kodiWsApiConnection = rkKodiWsApiService.getConnection();
          
          getInfo();
          
          kodiWsApiConnection.Player.OnPlay(function(response) {
            getInfo();
          });

          kodiWsApiConnection.Player.OnStop(function(response) {
            $sessionStorage.playStatus = {
              isPlaying: false,
              playerType: null,
              item: null
            };
            
            $rootScope.$emit('rkNowPlayingDataUpdated', $sessionStorage.playStatus);
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