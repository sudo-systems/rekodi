rekodiApp.factory('rkRemoteControlService', ['$rootScope', '$timeout', 'rkKodiWsApiService', 'rkHelperService',
  function($rootScope, $timeout, rkKodiWsApiService, rkHelperService) {
    var kodiWsApiConnection = null;
    var currentSpeed = 0;
    
    var getActivePlayerId = function(callback) {
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
        callback(null);
      }
    };
    
    var goTo = function(direction) {
      getActivePlayerId(function(playerId) {
        if(playerId !== null) {
          kodiWsApiConnection.Player.GoTo({
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
          kodiWsApiConnection.Player.PlayPause({
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
    
    var setSpeed = function(speed) {
      currentSpeed = speed;
      
      getActivePlayerId(function(playerId) {
        if(playerId !== null) {
          kodiWsApiConnection.Player.SetSpeed({
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
        newSpeed = 1;
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
          kodiWsApiConnection.Player.Stop({
            playerid: playerId
          }).then(function(data) {
              currentSpeed = 0;
          }, function(error) {
            rkHelperService.handleError(error);
          });
        }
      });
    };
    
    function init() {
      $rootScope.$on('rkWsConnectionStatusChange', function(event, data) {
        kodiWsApiConnection = (data.connected)? rkKodiWsApiService.getConnection() : null;
      });
      
      $rootScope.$watch(function() {
        return currentSpeed;
      }, function(newValue, oldVlaue) {
        $rootScope.$emit('rkPlaybackSpeedChange', newValue);
      });
    }

    init();
    
    return {
      getActivePlayerId: getActivePlayerId,
      goTo: goTo,
      playPause: playPause,
      setSpeed: setSpeed,
      rewind: rewind,
      fastForward: fastForward,
      stop: stop,
      skipPrevious: skipPrevious,
      skipNext: skipNext
    };
  }
]);