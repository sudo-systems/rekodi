rekodiApp.controller('rkPlaybackControlsCtrl', ['$scope', '$timeout', 'rkPlayerPropertiesService', 'rkKodiWsApiService', 'rkHelperService',
  function($scope, $timeout, rkPlayerPropertiesService, rkKodiWsApiService, rkHelperService) {
    var kodiWsApiConnection = null;
    $scope.playerProperties = {};
    $scope.isPlaying = false;
    $scope.isConnected = false;
    $scope.isPaused = false;
    $scope.isFastForwarding = false;
    $scope.isRewinding = false;
    $scope.currentSpeed = 0;
    $scope.isSeeking = false;
    
    var getActivePlayer = function(callback) {
      if(kodiWsApiConnection) {
        kodiWsApiConnection.Player.GetActivePlayers().then(function(data) {
          var playerId = (data[0])? data[0].playerid : null;
          callback(playerId);
        }, function(error) {
          rkHelperService.handleError(error);
        });
      }
    };
    
    $scope.goTo = function(direction) {
      getActivePlayer(function(playerId) {
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
    
    $scope.skipPrevious = function() {
      $scope.goTo('previous');
    };
    
    $scope.skipNext = function() {
      $scope.goTo('next');
    };
    
    $scope.playPause = function() {
      getActivePlayer(function(playerId) {
        if(playerId !== null) {
          kodiWsApiConnection.Player.PlayPause({
            playerid: playerId,
            play: 'toggle'
          }).then(function(data) {
              $scope.isPlaying = (data.speed === 1);
              $scope.isPaused = (data.speed === 0);
              $scope.currentSpeed = data.speed;
          }, function(error) {
            rkHelperService.handleError(error);
          });
        }
      });
    };
    
    $scope.setSpeed = function(speed) {
      $scope.currentSpeed = speed;
      
      getActivePlayer(function(playerId) {
        if(playerId !== null) {
          kodiWsApiConnection.Player.SetSpeed({
            playerid: playerId,
            speed: speed
          }).then(function(data) {
              $scope.currentSpeed = data.speed;
          }, function(error) {
            rkHelperService.handleError(error);
          });
        }
      });
    };
    
    $scope.rewind = function() {
      var newSpeed = 0;
      
      if($scope.currentSpeed === 0) {
        newSpeed = -1;
      }
      else if($scope.currentSpeed > 0) {
        newSpeed = Math.floor($scope.currentSpeed / 2);
      }
      else {
        newSpeed = ($scope.currentSpeed === -32)? -32 : ($scope.currentSpeed * 2);
      }
      
      $scope.setSpeed(newSpeed);
    };
    
    $scope.fastForward = function() {
      var newSpeed = 0;
      
      if($scope.currentSpeed === 0) {
        newSpeed = 1;
      }
      else if($scope.currentSpeed < 0) {
        newSpeed = Math.ceil($scope.currentSpeed / 2);
      }
      else {
        newSpeed = ($scope.currentSpeed === 32)? 32 : ($scope.currentSpeed * 2);
      }
      
      $scope.setSpeed(newSpeed);
    };
    
    function init() {
      $scope.$root.$on('rkPlayerPropertiesChange', function(event, data) {
        $scope.playerProperties = data;
        $scope.isPlaying = (data.speed === 1);
        $scope.isPaused = (data.speed === 0);
        $scope.currentSpeed = data.speed;
        $scope.$apply();
      });
      
      $scope.$root.$on('rkNowPlayingDataUpdated', function(event, data) {
        $scope.isPlaying = data.isPlaying;
        $scope.$apply();
      });
      
      $scope.$root.$on('rkWsConnectionStatusChange', function(event, data) {
        kodiWsApiConnection = (data.connected)? rkKodiWsApiService.getConnection() : null;
        $scope.isConnected = data.connected;
        $scope.$apply();
        
        kodiWsApiConnection.Player.OnPlay(function(data) {
          $scope.isPlaying = true;
          $scope.isPaused = false;
          $scope.$apply();
        });
        
        kodiWsApiConnection.Player.OnPause(function(data) {
          $scope.isPlaying = false;
          $scope.isPaused = true;
          $scope.$apply();
        });
        
        kodiWsApiConnection.Player.OnStop(function(data) {
          $scope.isPlaying = false;
          $scope.isPaused = false;
          $scope.$apply();
        });
        
        kodiWsApiConnection.Player.OnSpeedChanged(function(data) {
          console.dir(data);
          $scope.$apply();
        });
      });
    }
    
    $timeout(function() {
      init();
    });
  }
]);