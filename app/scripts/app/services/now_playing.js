rekodiApp.factory('rkNowPlayingService', ['$rootScope', 'rkEnumsService', 'rkHelperService', 'rkRemoteControlService', '$localStorage', 'rkLogService',
  function($rootScope, rkEnumsService, rkHelperService, rkRemoteControlService, $localStorage, rkLogService) {
    var kodiApi = null;
    var playingItem = null;
    var defaultWallpaper = null;
    var itemProperties = [];
    itemProperties[rkEnumsService.PlayerId.AUDIO] = ['title', 'displayartist', 'album', 'track', 'year', 'genre', 'thumbnail', 'file', 'duration', 'fanart'];
    itemProperties[rkEnumsService.PlayerId.VIDEO] = ['title', 'file', 'thumbnail', 'plotoutline', 'year', 'season', 'episode', 'showtitle', 'plot', 'runtime', 'fanart'];
    
    var setNotPlaying = function() {
      playingItem = null;
      applyDefaultWallpaper();
      $rootScope.$emit('rkNowPlayingDataUpdate', playingItem);
    };
    
    var applyCurrentFanartWallpaper = function() {
      if($localStorage.settings.fanartWallpaper && playingItem && playingItem.fanart_src) {
        rkHelperService.setDesktopWallpaper(playingItem.fanart_src);
      }
      else {
        applyDefaultWallpaper();
      }
    };
    
    var applyDefaultWallpaper = function(callback) {
      rkHelperService.setDesktopWallpaper(defaultWallpaper, callback);
    };
    
    var getItem = function() {
      rkRemoteControlService.getActivePlayerId(function(playerId) {
        if(playerId !== null) {
          kodiApi.Player.GetItem({
            playerid: playerId,
            properties: itemProperties[playerId]
          }).then(function(data) {
            if(data.item) {
              data.item = rkHelperService.addCustomFields(data.item);

              if(!angular.equals(playingItem, data.item)) {
                playingItem = data.item;
                $rootScope.$emit('rkNowPlayingDataUpdate', playingItem);
                applyCurrentFanartWallpaper();
              }
            }
            else {
              setNotPlaying();
            }
          }, function(error) {
            setNotPlaying();
            rkLogService.error(error);
          });
        }
        else {
          setNotPlaying();
        }
      });
    };

    var init = function() {
      rkHelperService.getDesktopWallpaper(function(imagePath) {
        defaultWallpaper = imagePath;
      });
      
      $rootScope.$on('rkWsConnectionStatusChange', function(event, connection) {
        kodiApi = connection;
        
        if(kodiApi) {
          kodiApi.Player.OnPlay(function(response) {
            getItem();
          });

          kodiApi.Player.OnStop(function(response) {
            setNotPlaying();
          });

          getItem();
        }
        else {
          setNotPlaying();
        }
      });
    };

    init();
    
    return {
      applyCurrentFanartWallpaper: applyCurrentFanartWallpaper,
      applyDefaultWallpaper: applyDefaultWallpaper
    };
  }
]);