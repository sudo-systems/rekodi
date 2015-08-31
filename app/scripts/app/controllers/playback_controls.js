rekodiApp.controller('rkPlaybackControlsCtrl', ['$scope', '$timeout', 'rkRemoteControlService', 'rkPlaybackStatusService', 'rkNotificationService',
  function ($scope, $timeout, rkRemoteControlService, rkPlaybackStatusService, rkNotificationService) {
    $scope.showPlayButton = true;
    $scope.showPauseButton = false;
    $scope.showStopButton = false;
    $scope.showPreviousButton = true;
    $scope.showNextButton = true;
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
    
    function updateVolumeTooltip(percentage) {
      var sliderWrapperHoverSelector = '.volume-slider-wrapper input[type=range]:hover::-webkit-slider-thumb:after';
      var sliderWrapperFocusSelector = '.volume-slider-wrapper input[type=range]:focus::-webkit-slider-thumb:after';

      styl.inject(sliderWrapperHoverSelector+', '+sliderWrapperFocusSelector, {content: '\''+percentage+'%\''}).apply();
    }

    $scope.setVolume = function(percentage) {
      percentage = parseInt(Math.floor(percentage));
      
      updateVolumeTooltip(percentage);
      rkRemoteControlService.setVolume(percentage);
    };
    
    $scope.toggleMute = function() {
      rkRemoteControlService.toggleMute();
    };
    
    $scope.togglePartymode = function() {
      if($scope.status.isPlaying && !$scope.playerProperties.partymode) {
        rkRemoteControlService.stop();
      }
      
      $scope.playerProperties.partymode = (!$scope.playerProperties.partymode);
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
        $scope.showPlayButton = (!$scope.status.isPlaying || $scope.status.isPaused || $scope.status.isRewinding || $scope.status.isFastForwarding);
        $scope.showPauseButton = ($scope.status.isPlaying && !$scope.status.isPaused && !$scope.status.isRewinding && !$scope.status.isFastForwarding);
        $scope.showStopButton = ($scope.status.isPlaying || $scope.status.isPaused || $scope.status.isRewinding || $scope.status.isFastForwarding);
      });
    }

    function init() {
      $scope.status = rkPlaybackStatusService.getCurrentStatus();
      setButtonStates();
      
      $scope.$root.$on('rkPlaybackStatusChange', function(event, data) {
        $scope.status = data;
        
        if(!$scope.$$phase){
          $scope.$apply();
        }
        
        setButtonStates();
      });
      
      $scope.$root.$on('rkPlayerPropertiesChange', function(event, data) {
        $scope.playerProperties = data;
        
        if(!$scope.$$phase){
          $scope.$apply();
        }
      });
      
      $scope.$root.$on('rkKodiPropertiesChange', function(event, data) {
        $scope.kodiProperties = data;

        if($scope.kodiProperties && $scope.kodiProperties.volume !== undefined) {
          var percentage = parseInt(Math.floor($scope.kodiProperties.volume));
          updateVolumeTooltip(percentage);
        }
        
        if(!$scope.$$phase){
          $scope.$apply();
        }
      });
      
      $('.volume-slider-wrapper input[type="range"]').on('mouseup', function() {
        this.blur();
      });
      
      angular.element(document).bind('keypress', function(event) {
        if($('input:focus, textarea:focus').length === 0) {
          if(event.keyCode === 32) {
            $scope.playPause();
          }
          else if(event.keyCode === 13) {
            $scope.stop();
          }
          else if(event.keyCode === 91) { //[
            $scope.skipPrevious();
          }
          else if(event.keyCode === 93) { //]
            $scope.skipNext();
          }
          else if(event.keyCode === 44) { //,
            $scope.rewind();
          }
          else if(event.keyCode === 46) { //.
            $scope.fastForward();
          }
          else if(event.keyCode === 45) { //-
            if($scope.kodiProperties && $scope.kodiProperties.volume !== undefined) {
              var newVolume = ($scope.kodiProperties.volume >= 5)? Math.floor($scope.kodiProperties.volume - 5) : 0;
              $scope.setVolume(newVolume);
              rkNotificationService.notifyVolume(newVolume);
            }
          }
          else if(event.keyCode === 61) { //=
            if($scope.kodiProperties && $scope.kodiProperties.volume !== undefined) {
              var newVolume = ($scope.kodiProperties.volume <= 95)? Math.floor($scope.kodiProperties.volume + 5) : 100;
              $scope.setVolume(newVolume);
              rkNotificationService.notifyVolume(newVolume);
            }
          }
          else if(event.keyCode === 114) { //r
            if(!$scope.playerProperties.partymode) {
              $scope.cycleRepeat();
            }
          }
          else if(event.keyCode === 115) { //s
            if(!$scope.playerProperties.partymode) {
              $scope.toggleShuffle();
            }
          }
          else if(event.keyCode === 112) { //p
            $scope.togglePartymode();
          }
        }
      });

      $scope.$root.rkRequiredControllers.playback_controls.loaded = true;
    }

    $scope.$evalAsync(function() {
      $timeout(function() {
        init();
      });
    });
  }
]);