rekodiApp.factory('rkNowPlayingService', ['$rootScope', 'rkHelperService', 'rkRemoteControlService', '$localStorage', 'rkLogService', 'rkConfigService', 'rkEnumsService',
  function($rootScope, rkHelperService, rkRemoteControlService, $localStorage, rkLogService, rkConfigService, rkEnumsService) { 
    var kodiApi = null;
    var playingItem = null;
    var defaultWallpaper = null;
    var requestProperties = rkConfigService.get('apiRequestProperties', 'nowPlaying');

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
          var properties = {};
          
          if(playerId === rkEnumsService.PlayerId.AUDIO) {
            properties = requestProperties.audio;
          }
          else if(playerId === rkEnumsService.PlayerId.VIDEO) {
            properties = requestProperties.video;
          }

          kodiApi.Player.GetItem({
            playerid: playerId,
            properties: properties
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