rekodiApp.controller('rkNowPlayingCtrl', ['$scope', '$timeout', 'rkHelperService', 'rkPlaybackStatusService', 'rkRemoteControlService',
  function($scope, $timeout, rkHelperService, rkPlaybackStatusService, rkRemoteControlService) {
    $scope.nowPlaying = null;
    $scope.timePlaying = '00:00:00';
    $scope.isManuallySeeking = false;
    $scope.playbackStatus = null;
    $scope.seekbarResolution = 100000;
    $scope.seek = {
      position: 0
    };
    
    function setDefaults() {
      $scope.nowPlaying = null;
      $scope.timePlaying = '00:00:00';
      $scope.seek.position = 0;
      $scope.playbackStatus = null;
      $scope.isManuallySeeking = false;
      $scope.updateTootltip($scope.seek.position);
    }
    
    $scope.setPlaybackPosition = function(seekPosition) {
      if($scope.nowPlaying && $scope.nowPlaying.duration) {
        var seconds = Math.ceil(($scope.nowPlaying.duration / $scope.seekbarResolution) * seekPosition);
        var timeObject = rkHelperService.secondsToTimeObject(seconds);

        rkRemoteControlService.seek(timeObject, function(data) {
          var seconds = rkHelperService.timeObjectToSeconds(data.time);
          var totalSeconds = rkHelperService.timeObjectToSeconds(data.totaltime);
          $scope.seek.position = Math.floor((seconds / totalSeconds) * $scope.seekbarResolution);
          $scope.setManuallySeeking(false);
        });
      }
    };
    
    $scope.setManuallySeeking = function(manuallySeeking) {
      $scope.isManuallySeeking = manuallySeeking;
    };

    $scope.updateTootltip = function(seekPosition) {
      var sliderWrapperHoverSelector = '.seek-slider-wrapper input[type=range]:hover::-webkit-slider-thumb:after';
      var sliderWrapperFocusSelector = '.seek-slider-wrapper input[type=range]:focus::-webkit-slider-thumb:after';

      if($scope.nowPlaying && $scope.nowPlaying.duration) {
        var seconds = Math.ceil(($scope.nowPlaying.duration / $scope.seekbarResolution) * seekPosition);
        var seekTime = rkHelperService.secondsToDuration(seconds);
        styl.inject(sliderWrapperHoverSelector+', '+sliderWrapperFocusSelector, {content: "'"+seekTime+"'"}).apply();
      }
    };

    function init() {
      $scope.status = rkPlaybackStatusService.getCurrentStatus();
      
      $scope.$root.$on('rkNowPlayingDataUpdate', function(event, data) {
        $scope.nowPlaying = data;
        
        if(!data) {
          setDefaults();
        }
        
        $scope.$apply();
      });
      
      $scope.$root.$on('rkPlayerPropertiesChange', function(event, data) {
        if(data.time && Object.keys(data.time).length > 0) {
          var seconds = rkHelperService.timeObjectToSeconds(data.time);
          $scope.timePlaying = rkHelperService.secondsToDuration(seconds);

          if(!$scope.isManuallySeeking) {
            if($scope.nowPlaying && $scope.nowPlaying.duration) {
              $scope.seek.position = Math.floor((seconds / $scope.nowPlaying.duration) * $scope.seekbarResolution);
            }
            else {
              $scope.seek.position = 0;
            }

            $scope.updateTootltip($scope.seek.position);
          }
        }
        else {
          $scope.timePlaying = '00:00:00';
          $scope.seek.position = 0;
          $scope.updateTootltip($scope.seek.position);
        }
        
        $scope.$apply();
      });
      
      $scope.$root.$on('rkPlaybackStatusChange', function(event, data) {
        $scope.playbackStatus = data;
      });
      
      $scope.updateTootltip($scope.seek.position);

      $('.seek-slider-wrapper input[type="range"]').on('mouseup', function() {
        this.blur();
      });

      $scope.$root.rkRequiredControllers.now_playing.loaded = true;
    }
    
    $timeout(function() {
      init();
    });
  }
]);