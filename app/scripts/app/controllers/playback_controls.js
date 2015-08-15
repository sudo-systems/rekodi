rekodiApp.controller('rkPlaybackControlsCtrl', ['$scope', '$timeout', 'rkKodiWsApiService', 'rkHelperService', 'rkRemoteControlService',
  function ($scope, $timeout, rkKodiWsApiService, rkHelperService, rkRemoteControlService) {
    var kodiWsApiConnection = null;
    $scope.playerProperties = {};
    $scope.player = {};
    $scope.status = {
      isConnected: false,
      isPlaying: false,
      isPaused: false,
      isStopped: true,
      isSeeking: false,
      isRewinding: false,
      isFastForwarding: false,
      isMuted: false,
      currentSpeed: null,
      currentVolume: 0,
      showPlayButton: true,
      showPauseButton: false,
      showStopButton: false
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
      $scope.status.showPlayButton = ($scope.status.isPaused || $scope.status.isStopped || $scope.status.isSeeking);
      $scope.status.showPauseButton = ($scope.status.isPlaying);
      $scope.status.showStopButton = ($scope.status.isPlaying || $scope.status.isPaused || $scope.status.isSeeking);
    }
    
    function initConnectionChange() {
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      $scope.status.isConnected = (kodiWsApiConnection);
      $scope.status.currentSpeed = null;
      $scope.$apply();

      if(kodiWsApiConnection) {
        kodiWsApiConnection.Player.OnPlay(function (data) {
          $scope.player = data.data.player;
          $scope.status.currentSpeed = (!$scope.status.isPlaying && data.data.player.speed === 0)? null : data.data.player.speed;
          $scope.$apply();
        });

        kodiWsApiConnection.Player.OnPause(function (data) {
          $scope.player = data.data.player;
          $scope.status.currentSpeed = (!$scope.status.isPlaying && data.data.player.speed === 0)? null : data.data.player.speed;
          $scope.$apply();
        });

        kodiWsApiConnection.Player.OnStop(function (data) {
          $scope.player = {};
          $scope.status.currentSpeed = null;
          $scope.$apply();
        });

        kodiWsApiConnection.Player.OnSpeedChanged(function (data) {
          $scope.player = data.data.player;
          $scope.status.currentSpeed = (!$scope.status.isPlaying && data.data.player.speed === 0)? null : data.data.player.speed;
          $scope.$apply();
        });
      }
    }

    function init() {
      initConnectionChange();
      
      $scope.$root.$on('rkPlayerPropertiesChange', function(event, data) {
        $scope.playerProperties = data;
        $scope.status.currentSpeed = (!$scope.status.isPlaying && data.speed === 0)? null : data.speed;
        $scope.$apply();
      });

      $scope.$root.$on('rkNowPlayingDataUpdated', function(event, data) {
        $scope.status.isPlaying = data.isPlaying;
        $scope.status.currentSpeed = (!$scope.status.isPlaying)? null : 1;
        $scope.$apply();
      });

      $scope.$root.$on('rkPlaybackSpeedChange', function(event, data) {
        $scope.status.currentSpeed = (!$scope.status.isPlaying && data.speed === 0)? null : data;
      });
      
      $scope.$root.$on('rkKodiPropertiesChange', function(event, data) {
        $scope.status.currentVolume = data.volume;
        $scope.status.isMuted = data.muted;
        $scope.$apply();
      });

      $scope.$watch('currentSpeed', function (newValue, oldValue) {
        $scope.status.isPlaying = (newValue === 1);
        $scope.status.isSeeking = (newValue !== null && (newValue < 0 || newValue > 1));
        $scope.status.isPaused = (newValue === 0);
        $scope.status.isStopped = (newValue === null);
        $scope.status.isRewinding = (newValue !== null && newValue < 0);
        $scope.status.isFastForwarding = (newValue !== null && newValue > 1);
        setButtonStates();
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