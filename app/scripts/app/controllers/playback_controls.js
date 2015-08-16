rekodiApp.controller('rkPlaybackControlsCtrl', ['$scope', '$timeout', 'kodiApiService', 'rkRemoteControlService', 'rkPlayerPropertiesService',
  function ($scope, $timeout, kodiApiService, rkRemoteControlService, rkPlayerPropertiesService) {
    var kodiApi = null;
    $scope.playerProperties = null;
    $scope.player = {};
    $scope.showPlayButton = true;
    $scope.showPauseButton = false;
    $scope.showStopButton = false;
    $scope.status = {
      isConnected: false,
      isPlaying: false,
      isPaused: false,
      isStopped: true,
      isRewinding: false,
      isFastForwarding: false,
      isMuted: false,
      currentSpeed: 0,
      currentVolume: 0
    };

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
      $timeout(function() {
        $scope.showPlayButton = ($scope.status.isPaused || !$scope.status.isPlaying || $scope.status.isRewinding || $scope.status.isFastForwarding);
        $scope.showPauseButton = ($scope.status.isPlaying && !$scope.status.isPaused && !$scope.status.isRewinding && !$scope.status.isFastForwarding);
        $scope.showStopButton = ($scope.status.isPlaying || $scope.status.isPaused || $scope.status.isRewinding || $scope.status.isFastForwarding);
      });
    }
    
    function initConnectionChange() {
      kodiApi = kodiApiService.getConnection();
      $scope.status.isConnected = (kodiApi);
      $scope.status.currentSpeed = 0;
      setButtonStates();

      if(kodiApi) {
        kodiApi.Player.OnPlay(function(data) {
          $scope.player = data.data.player;
          $scope.status.isPaused = false;
          $scope.status.isPlaying = true;
          $scope.status.currentSpeed = data.data.player.speed;
          $scope.status.isRewinding = (data.data.player.speed < 0);
          $scope.status.isFastForwarding = (data.data.player.speed > 1);
          setButtonStates();
        });

        kodiApi.Player.OnPause(function(data) {
          $scope.player = data.data.player;
          $scope.status.isPaused = true;
          $scope.status.isPlaying = true;
          $scope.status.currentSpeed = 0;
          $scope.status.isRewinding = false;
          $scope.status.isFastForwarding = false;
          setButtonStates();
        });

        kodiApi.Player.OnStop(function(data) {
          $scope.player = {};
          $scope.status.isPaused = false;
          $scope.status.isPlaying = false;
          $scope.status.currentSpeed = 0;
          $scope.status.isRewinding = false;
          $scope.status.isFastForwarding = false;
          setButtonStates();
        });

        kodiApi.Player.OnSpeedChanged(function (data) {
          $scope.player = data.data.player;
          $scope.status.currentSpeed = data.data.player.speed;
          $scope.status.isRewinding = (data.data.player.speed < 0);
          $scope.status.isFastForwarding = (data.data.player.speed > 1);
          setButtonStates();
        });
      }
    }

    function init() {
      initConnectionChange();
      
      $scope.$root.$on('rkPlayerPropertiesChange', function(event, data) {
        $scope.status.isPaused = (data.speed === 0 && data.type !== null);
        $scope.status.isPlaying = (data.type !== null);
        $scope.status.currentSpeed = data.speed;
        $scope.status.isRewinding = (data.speed < 0 && data.type !== null);
        $scope.status.isFastForwarding = (data.speed > 1 && data.type !== null);
        $scope.playerProperties = data;
      });

      $scope.$root.$on('rkNowPlayingDataUpdate', function(event, data) {
        if(data === null) {
          rkPlayerPropertiesService.stopUpdateInterval();
          $scope.status.isPaused = false;
          $scope.status.isPlaying = false;
          $scope.status.currentSpeed = 0;
          $scope.status.isRewinding = false;
          $scope.status.isFastForwarding = false;
        }
        else {
          rkPlayerPropertiesService.startUpdateInterval();
          $scope.status.isPlaying = true;
        }
        
        setButtonStates();
      });
      
      $scope.$root.$on('rkKodiPropertiesChange', function(event, data) {
        $scope.status.currentVolume = data.volume;
        $scope.status.isMuted = data.muted;
        $scope.$apply();
      });

      $scope.$root.$on('rkWsConnectionStatusChange', function (event, data) {
        initConnectionChange();
      });
    }

    $timeout(function () {
      init();
    });
  }
]);