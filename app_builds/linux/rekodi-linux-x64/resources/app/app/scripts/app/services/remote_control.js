rekodiApp.factory('rkRemoteControlService', ['$rootScope', 'kodiApiService', 'rkHelperService', 'rkEnumsService',
  function($rootScope, kodiApiService, rkHelperService, rkEnumsService) {
    var kodiApi = null;
    var currentSpeed = 0;
    
    var getActivePlayerId = function(callback) {
      if(kodiApi) {
        kodiApi.Player.GetActivePlayers().then(function(data) {
          var playerId = (data[0])? data[0].playerid : null;
          callback(playerId);
        }, function(error) {
          rkHelperService.handleError(error);
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
            rkHelperService.handleError(error);
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
            rkHelperService.handleError(error);
          });
        }
      });
    };
    
    var play = function(options) {
      if(kodiApi) {
        kodiApi.Player.Open(options).then(function(data) {
          
        }, function(error) {
          rkHelperService.handleError(error);
        });
      }
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
            rkHelperService.handleError(error);
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
            rkHelperService.handleError(error);
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
          rkHelperService.handleError(error);
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
          rkHelperService.handleError(error);
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
            rkHelperService.handleError(error);
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
        rkHelperService.handleError(error);
      });
    };
    
    var cycleRepeat = function() {
      getActivePlayerId(function(playerId) {
        if(playerId !== null) {
          kodiApi.Player.SetRepeat({
            playerid: playerId,
            repeat: 'cycle'
          }).then(function(data) {
          }, function(error) {
            rkHelperService.handleError(error);
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
            rkHelperService.handleError(error);
          });
        }
      });
    };
    
    function init() {
      $rootScope.$on('rkWsConnectionStatusChange', function(event, connection) {
        kodiApi = connection;
      });
    }

    init();
    
    return {
      getActivePlayerId: getActivePlayerId,
      goTo: goTo,
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
      cycleRepeat: cycleRepeat,
      toggleShuffle: toggleShuffle
    };
  }
]);