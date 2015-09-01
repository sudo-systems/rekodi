rekodiApp.factory('rkNowPlayingService', ['$rootScope', 'rkHelperService', 'rkRemoteControlService', '$localStorage', 'rkLogService', 'rkConfigService', 'rkEnumsService', 'rkNotificationService',
  function($rootScope, rkHelperService, rkRemoteControlService, $localStorage, rkLogService, rkConfigService, rkEnumsService, rkNotificationService) {
    var wallpaper = require('wallpaper');
    var fs = require('fs');
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
      if($localStorage.settings.nowPlaying.fanartWallpaper && playingItem && playingItem.fanart_path && fs.existsSync(playingItem.fanart_path)) {
        wallpaper.set(playingItem.fanart_path, function(error) {
          if(error) {
            rkLogService.error(error);
          }
        });
      }
      else {
        applyDefaultWallpaper();
      }
    };
    
    var applyDefaultWallpaper = function(callback) {
      callback = (callback)? callback : function(){};
      
      wallpaper.set(defaultWallpaper, function(error) {
        if(error) {
          rkLogService.error(error);
        }
        
        callback();
      });
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
              data.item = rkHelperService.addCustomFields(data.item, true);

              if(!angular.equals(playingItem, data.item)) {
                playingItem = data.item;

                if(!playingItem.thumbnail_path) {
                  rkNotificationService.notifyPlay(playingItem);
                }
                
                if($localStorage.settings.nowPlaying.fanartWallpaper && !playingItem.fanart_path) {
                  applyDefaultWallpaper();
                }
                
                $rootScope.$emit('rkNowPlayingDataUpdate', playingItem);
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
    
    var getNowPlayingFilePath = function() {
      return (playingItem && playingItem.file)? playingItem.file : null;
    };

    var init = function() {
      wallpaper.get(function(error, currentWallpaperPath) {
        if(error) {
          rkLogService.error(error);
          return;
        }
        
        defaultWallpaper = currentWallpaperPath;
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
      
      $rootScope.$on('rkFileCacheCompleted', function(event, filePath) {
        if(!playingItem) {
          return;
        }
        
        if($localStorage.settings.nowPlaying.fanartWallpaper && filePath === playingItem.fanart_path) {
          applyCurrentFanartWallpaper();
        }
        else if($localStorage.settings.nowPlaying.fanartWallpaper) {
          applyDefaultWallpaper();
        }
        
        if(filePath === playingItem.thumbnail_path || !filePath) {
          rkNotificationService.notifyPlay(playingItem);
        }
      });
    };

    init();
    
    return {
      applyCurrentFanartWallpaper: applyCurrentFanartWallpaper,
      applyDefaultWallpaper: applyDefaultWallpaper,
      getNowPlayingFilePath: getNowPlayingFilePath
    };
  }
]);