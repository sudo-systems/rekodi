rekodiApp.controller('rkPlaybackControlsCtrl', ['$scope', '$timeout', 'rkRemoteControlService', 'rkPlaybackStatusService',
  function ($scope, $timeout, rkRemoteControlService, rkPlaybackStatusService) {
    $scope.showPlayButton = true;
    $scope.showPauseButton = false;
    $scope.showStopButton = false;
    $scope.playerProperties = null;
    $scope.kodiProperties = null;
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
      
      $scope.$root.$on('rkKodiPropertiesChange', function(event, data) {
        $scope.kodiProperties = data;
        $scope.$apply();
      });
      
      $('.volume-slider-wrapper input[type="range"]').on('mouseout', function() {
        this.blur();
      }).on('mouseover input', function() {
        styl.inject('.volume-slider-wrapper input[type=range]:hover::-webkit-slider-thumb:after', {content: "'"+this.value+"%'"}).apply();
      });
      
      angular.element(document).bind('keypress', function(event) {
        //console.dir(event);
        if($('input:focus, textarea:focus').length === 0) {
          if(event.keyCode === 32) {
            rkRemoteControlService.playPause();
          }
          else if(event.keyCode === 13) {
            rkRemoteControlService.stop();
          }
          else if(event.keyCode === 91) { //[
            rkRemoteControlService.skipPrevious();
          }
          else if(event.keyCode === 93) { //]
            rkRemoteControlService.skipNext();
          }
          else if(event.keyCode === 44) { //,
            rkRemoteControlService.rewind();
          }
          else if(event.keyCode === 46) { //.
            rkRemoteControlService.fastForward();
          }
          else if(event.keyCode === 45) { //-
            if($scope.kodiProperties.volume && $scope.kodiProperties.volume >= 5) {
              $scope.kodiProperties.volume -= 5;
              $scope.$apply();
              
              rkRemoteControlService.setVolume($scope.kodiProperties.volume);
            }
          }
          else if(event.keyCode === 61) { //=
            if($scope.kodiProperties.volume && $scope.kodiProperties.volume <= 95) {
              $scope.kodiProperties.volume += 5;
              $scope.$apply();
              
              rkRemoteControlService.setVolume($scope.kodiProperties.volume);
            }
          }
          else if(event.keyCode === 114) { //r
            if(!$scope.playerProperties.partymode) {
              rkRemoteControlService.cycleRepeat();
            }
          }
          else if(event.keyCode === 115) { //s
            if(!$scope.playerProperties.partymode) {
              rkRemoteControlService.toggleShuffle();
            }
          }
          else if(event.keyCode === 112) { //p
            rkRemoteControlService.togglePartymode();
          }
        }
      });

      $scope.$root.rkRequiredControllers.playback_controls.loaded = true;
    }

    $timeout(function () {
      init();
    });
  }
]);