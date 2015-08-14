rekodiApp.controller('rkPlaybackControlsCtrl', ['$scope', '$timeout', 'rkKodiWsApiService', 'rkHelperService', 'rkRemoteControlService',
  function ($scope, $timeout, rkKodiWsApiService, rkHelperService, rkRemoteControlService) {
    var kodiWsApiConnection = null;
    $scope.playerProperties = {};
    $scope.isConnected = false;
    $scope.isPlaying = false;
    $scope.isPaused = false;
    $scope.isStopped = true;
    $scope.isSeeking = false;
    $scope.isRewinding = false;
    $scope.isFastForwarding = false;
    $scope.currentSpeed = null;
    $scope.showPlayButton = true;
    $scope.currentVolume = 0;
    $scope.isMuted = false;
    $scope.player = {};

    $scope.skipPrevious = function () {
      rkRemoteControlService.skipPrevious();
    };

    $scope.skipNext = function () {
      rkRemoteControlService.skipNext();
    };

    $scope.playPause = function () {
      rkRemoteControlService.playPause();
    };

    $scope.rewind = function () {
      rkRemoteControlService.rewind();
    };

    $scope.fastForward = function () {
      rkRemoteControlService.fastForward();
    };

    $scope.stop = function () {
      rkRemoteControlService.stop();
    };

    $scope.setVolume = function(percentage) {
      percentage = parseInt(Math.ceil(percentage));
      rkRemoteControlService.setVolume(percentage);
    };
    
    $scope.toggleMute = function() {
      rkRemoteControlService.toggleMute();
    };

    function setButtonStates() {
      $scope.showPlayButton = ($scope.isPaused || $scope.isStopped || $scope.isSeeking);
      $scope.showPauseButton = ($scope.isPlaying);
      $scope.showStopButton = ($scope.isPlaying || $scope.isPaused || $scope.isSeeking);
    }

    function init() {
      $scope.$root.$on('rkPlayerPropertiesChange', function(event, data) {
        $scope.playerProperties = data;
        $scope.currentSpeed = (!$scope.isPlaying && data.speed === 0)? null : data.speed;
        $scope.$apply();
      });

      $scope.$root.$on('rkNowPlayingDataUpdated', function(event, data) {
        $scope.isPlaying = data.isPlaying;
        $scope.currentSpeed = (!$scope.isPlaying)? null : 1;
        $scope.$apply();
      });

      $scope.$root.$on('rkPlaybackSpeedChange', function(event, data) {
        $scope.currentSpeed = (!$scope.isPlaying && data.speed === 0)? null : data;
      });
      
      $scope.$root.$on('rkKodiPropertiesChange', function(event, data) {
        $scope.currentVolume = data.volume;
        $scope.isMuted = data.muted;
        $scope.$apply();
      });

      $scope.$watch('currentSpeed', function (newValue, oldValue) {
        $scope.isPlaying = (newValue === 1);
        $scope.isSeeking = (newValue !== null && (newValue < 0 || newValue > 1));
        $scope.isPaused = (newValue === 0);
        $scope.isStopped = (newValue === null);
        $scope.isRewinding = (newValue !== null && newValue < 0);
        $scope.isFastForwarding = (newValue !== null && newValue > 1);
        
        console.log(newValue);
        
        setButtonStates();
      });

      $scope.$root.$on('rkWsConnectionStatusChange', function (event, data) {
        kodiWsApiConnection = (data.connected) ? rkKodiWsApiService.getConnection() : null;
        $scope.isConnected = data.connected;
        $scope.currentSpeed = null;
        $scope.$apply();

        kodiWsApiConnection.Player.OnPlay(function (data) {
          $scope.player = data.data.player;
          $scope.currentSpeed = (!$scope.isPlaying && data.data.player.speed === 0)? null : data.data.player.speed;
          $scope.$apply();
        });

        kodiWsApiConnection.Player.OnPause(function (data) {
          $scope.player = data.data.player;
          $scope.currentSpeed = (!$scope.isPlaying && data.data.player.speed === 0)? null : data.data.player.speed;
          $scope.$apply();
        });

        kodiWsApiConnection.Player.OnStop(function (data) {
          $scope.player = {};
          $scope.currentSpeed = null;
          $scope.$apply();
        });

        kodiWsApiConnection.Player.OnSpeedChanged(function (data) {
          $scope.player = data.data.player;
          $scope.currentSpeed = (!$scope.isPlaying && data.data.player.speed === 0)? null : data.data.player.speed;
          $scope.$apply();
        });
      });
    }

    $timeout(function () {
      init();
    });
  }
]);