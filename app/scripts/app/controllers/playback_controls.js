rekodiApp.controller('rkPlaybackControlsCtrl', ['$scope', '$timeout', 'rkRemoteControlService', 'rkPlaybackStatusService',
  function ($scope, $timeout, rkRemoteControlService, rkPlaybackStatusService) {
    $scope.showPlayButton = true;
    $scope.showPauseButton = false;
    $scope.showStopButton = false;
    $scope.playerProperties = null;
    $scope.status = {};

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
    
    $scope.togglePartymode = function() {
      rkRemoteControlService.togglePartymode();
    };
    
    $scope.cycleRepeat = function() {
      rkRemoteControlService.cycleRepeat();
    };

    $scope.toggleShuffle = function() {
      rkRemoteControlService.toggleShuffle();
    };

    function setButtonStates() {
      $timeout(function() {
        $scope.showPlayButton = ($scope.status.isPaused || !$scope.status.isPlaying || $scope.status.isRewinding || $scope.status.isFastForwarding);
        $scope.showPauseButton = ($scope.status.isPlaying && !$scope.status.isPaused && !$scope.status.isRewinding && !$scope.status.isFastForwarding);
        $scope.showStopButton = ($scope.status.isPlaying || $scope.status.isPaused || $scope.status.isRewinding || $scope.status.isFastForwarding);
      });
    }

    function init() {
      $scope.status = rkPlaybackStatusService.getCurrentStatus();
      setButtonStates();
      
      $scope.$root.$on('rkPlaybackStatusChange', function(event, data) {
        $scope.status = data;
        setButtonStates();
      });
      
      $scope.$root.$on('rkPlayerPropertiesChange', function(event, data) {
        $scope.playerProperties = data;
        $scope.$apply();
      });
      
      $('.volume-slider-wrapper input[type="range"]').on('mouseout', function() {
        this.blur();
      }).on('mouseover input', function() {
        styl.inject('.volume-slider-wrapper input[type=range]:hover::-webkit-slider-thumb:after', {content: "'"+this.value+"%'"}).apply();
      });

      $scope.$root.rkRequiredControllers.playback_controls.loaded = true;
    }

    $timeout(function () {
      init();
    });
  }
]);