rekodiApp.factory('rkRemoteControlService', ['$rootScope', 'rkLogService', 'rkEnumsService', 'rkLogService',
  function($rootScope, rkLogService, rkEnumsService, rkLogService) {
    var kodiApi = null;
    var playerProperties = {};
    var currentSpeed = 0;
    
    var getActivePlayerId = function(callback) {
      if(kodiApi) {
        kodiApi.Player.GetActivePlayers().then(function(data) {
          var playerId = (data[0])? data[0].playerid : null;
          callback(playerId);
        }, function(error) {
          rkLogService.error(error);
          callback(null);
        });
      }
      else {
        callback(null);
      }
    };
    
    var goTo = function(direction) {
      getActivePlayerId(function(playerId) {
        if(playerId !== null) {
          kodiApi.Player.GoTo({
            playerid: playerId,
            to: direction
          }).then(function(data) {
            if(data !== 'OK') {
              //some error
            }
          }, function(error) {
            rkLogService.error(error);
          });
        }
      });
    };
    
    var skipPrevious = function() {
      goTo('previous');
    };
    
    var skipNext = function() {
      goTo('next');
    };

    var playPause = function() {
      getActivePlayerId(function(playerId) {
        if(playerId !== null) {
          kodiApi.Player.PlayPause({
            playerid: playerId,
            play: 'toggle'
          }).then(function(data) {
              currentSpeed = data.speed;
          }, function(error) {
            rkLogService.error(error);
          });
        }
      });
    };
    
    var play = function(options) {
      if(kodiApi) {
        if(playerProperties.partymode) {
          togglePartymode();
        }
        
        kodiApi.Player.Open(options).then(function(data) {
        }, function(error) {
          rkLogService.error(error);
        });
      }
    };
    
    var playPlaylistItem = function(options) {
      if(kodiApi) {
        kodiApi.Player.GoTo(options).then(function(data) {
        }, function(error) {
          rkLogService.error(error);
        });
      }
    };
    
    var removePlaylistItem = function(options) {
      if(kodiApi) {
        kodiApi.Playlist.Remove(options).then(function(data) {
        }, function(error) {
          rkLogService.error(error);
        });
      }
    };
    
    var clearPlaylist = function(playlistId, callback) {
      callback = (callback)? callback : function(){};
      
      if(kodiApi) {
        kodiApi.Playlist.Clear({
          playlistid: playlistId
        }).then(function(data) {
          callback((data === 'OK'));
        }, function(error) {
          callback(false);
          rkLogService.error(error);
        });
      }
      else {
        callback(false);
      }
    };
    
    var swapPlaylistItems = function(playlistId, position1, position2) {
      if(kodiApi) {
        kodiApi.Playlist.Swap({
          playlistid: playlistId,
          position1: position1,
          position2: position2
        }).then(function(data) {
        }, function(error) {
          rkLogService.error(error);
        });
      }
    };
    
    var addToPlaylist = function(playlistId, item) {
      kodiApi.Playlist.Add({
        playlistid: playlistId,
        item: item
      });
    };
    
    var insertIntoPlaylist = function(playlistId, position, item) {
      kodiApi.Playlist.Insert({
        playlistid: playlistId,
        position: parseInt(position),
        item: item
      });
    };
    
    var setSpeed = function(speed) {
      currentSpeed = speed;
      
      getActivePlayerId(function(playerId) {
        if(playerId !== null) {
          kodiApi.Player.SetSpeed({
            playerid: playerId,
            speed: speed
          }).then(function(data) {
              currentSpeed = data.speed;
          }, function(error) {
            rkLogService.error(error);
          });
        }
      });
    };
    
    var rewind = function() {
      var newSpeed = 0;
      
      if(currentSpeed === 0) {
        newSpeed = -1;
      }
      else if(currentSpeed > 0) {
        newSpeed = Math.floor(currentSpeed / 2);
      }
      else {
        newSpeed = (currentSpeed === -32)? -32 : (currentSpeed * 2);
      }

      newSpeed = (newSpeed === 0)? -1 : newSpeed;
      setSpeed(newSpeed);
    };
    
    var fastForward = function() {
      var newSpeed = 0;
      
      if(currentSpeed === 0) {
        newSpeed = 2;
      }
      else if(currentSpeed < 0) {
        newSpeed = Math.ceil(currentSpeed / 2);
      }
      else {
        newSpeed = (currentSpeed === 32)? 32 : (currentSpeed * 2);
      }

      newSpeed = (newSpeed === 0)? 1 : newSpeed;
      setSpeed(newSpeed);
    };
    
    var stop = function() {
      getActivePlayerId(function(playerId) {
        if(playerId !== null) {
          kodiApi.Player.Stop({
            playerid: playerId
          }).then(function(data) {
              currentSpeed = 0;
          }, function(error) {
            rkLogService.error(error);
          });
        }
      });
    };
    
    var setVolume = function(percentage) {
      if(kodiApi) {
        kodiApi.Application.SetVolume({
          volume: parseInt(percentage)
        }).then(function(data) {
            //console.log(data);
        }, function(error) {
          rkLogService.error(error);
        });
      }
    };
    
    var toggleMute = function() {
      if(kodiApi) {
        kodiApi.Application.SetMute({
          mute: 'toggle'
        }).then(function(data) {
            //console.log(data);
        }, function(error) {
          rkLogService.error(error);
        });
      }
    };
    
    var seek = function(timeObject, callback) {
      callback = (callback.constructor !== Function)? function(){} : callback;
      
      getActivePlayerId(function(playerId) {
        if(playerId !== null) {
          kodiApi.Player.Seek({
            playerid: playerId,
            value: timeObject
          }).then(function(data) {
              callback(data);
          }, function(error) {
            rkLogService.error(error);
            callback(null);
          });
        }
      });
    };
    
    var togglePartymode = function() {
      kodiApi.Player.SetPartymode({
        playerid: rkEnumsService.PlayerId.AUDIO,
        partymode: 'toggle'
      }).then(function(data) {
      }, function(error) {
        rkLogService.error(error);
      });
    };
    
    var cycleRepeat = function(repeatType) {
      setRepeat('cycle');
    };
    
    var setRepeat = function(mode) {
      mode = (!mode)? 'off' : mode;
      
      getActivePlayerId(function(playerId) {
        if(playerId !== null) {
          kodiApi.Player.SetRepeat({
            playerid: playerId,
            repeat: mode
          }).then(function(data) {
          }, function(error) {
            rkLogService.error(error);
          });
        }
      });
    };
    
    var toggleShuffle = function() {
      getActivePlayerId(function(playerId) {
        if(playerId !== null) {
          kodiApi.Player.SetShuffle({
            playerid: playerId,
            shuffle: 'toggle'
          }).then(function(data) {
          }, function(error) {
            rkLogService.error(error);
          });
        }
      });
    };

    var shutdown = function() {
      kodiApi.System.Shutdown().then(function(data) {
      }, function(error) {
        rkLogService.error(error);
      });
    };
    
    var reboot = function() {
      kodiApi.System.Reboot().then(function(data) {
      }, function(error) {
        rkLogService.error(error);
      });
    };
    
    function init() {
      $rootScope.$on('rkWsConnectionStatusChange', function(event, connection) {
        kodiApi = connection;
      });
      
      $rootScope.$on('rkPlayerPropertiesChange', function(event, properties) {
        playerProperties = properties;
      });
    }

    init();
    
    return {
      getActivePlayerId: getActivePlayerId,
      
      goTo: goTo,
      playPlaylistItem: playPlaylistItem,
      removePlaylistItem: removePlaylistItem,
      clearPlaylist: clearPlaylist,
      swapPlaylistItems: swapPlaylistItems,
      addToPlaylist: addToPlaylist,
      insertIntoPlaylist: insertIntoPlaylist,
      
      play: play,
      playPause: playPause,
      setSpeed: setSpeed,
      rewind: rewind,
      fastForward: fastForward,
      stop: stop,
      skipPrevious: skipPrevious,
      skipNext: skipNext,
      
      setVolume: setVolume,
      toggleMute: toggleMute,
      
      seek: seek,
      
      togglePartymode: togglePartymode,
      setRepeat: setRepeat,
      cycleRepeat: cycleRepeat,
      toggleShuffle: toggleShuffle,
      
      shutdown: shutdown,
      reboot: reboot
    };
  }
]);