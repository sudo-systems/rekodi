rekodiApp.controller('rkNowPlayingCtrl', ['$scope', '$timeout', 'rkHelperService', 'rkPlaybackStatusService',
  function($scope, $timeout, rkHelperService, rkPlaybackStatusService) {
    $scope.nowPlaying = null;
    $scope.timePlaying = '00:00:00';
    $scope.seekPercentage = 0;
    var pauseSeekPositionUpdates = false;
    $scope.playbackStatus = {};
    
    $scope.setPlaybackPosition = function() {
      pauseSeekPositionUpdates = false;
      
      if($scope.nowPlaying && $scope.nowPlaying.duration) {

      }
    };
    
    $scope.updateTootltip = function(useSeekPercentage) {
      var seekTime = $scope.timePlaying;
      
      if(useSeekPercentage && $scope.nowPlaying && $scope.nowPlaying.duration) {
        var seconds = Math.ceil(($scope.nowPlaying.duration / 100) * $scope.seekPercentage);
        seekTime = rkHelperService.secondsToDuration(seconds);
      }
      
      styl.inject('.seek-slider-wrapper input[type=range]:hover::-webkit-slider-thumb:after, .seek-slider-wrapper input[type=range]:focus::-webkit-slider-thumb:after', {content: "'"+seekTime+"'"}).apply();
    };
    
    $scope.pausePositionUpdates = function() {
      pauseSeekPositionUpdates = true;
    };
    
    function init() {
      $scope.status = rkPlaybackStatusService.getCurrentStatus();
      
      $scope.$root.$on('rkNowPlayingDataUpdate', function(event, data) {
        $scope.nowPlaying = data;

        if(!data) {
          $scope.timePlaying = null;
          $scope.seekPercentage = 0;
          $scope.updateTootltip();
        }
      });
      
      $scope.$root.$on('rkPlayerPropertiesChange', function(event, data) {
        if(data.time && Object.keys(data.time).length > 0) {
          var seconds = (+data.time.hours) * 60 * 60 + (+data.time.minutes) * 60 + (+data.time.seconds);
          $scope.timePlaying = rkHelperService.secondsToDuration(seconds);

          if(!pauseSeekPositionUpdates) {
            if($scope.nowPlaying && $scope.nowPlaying.duration) {
              $scope.seekPercentage = ((seconds / $scope.nowPlaying.duration) * 100).toFixed(2);
            }
            else {
              $scope.seekPercentage = 0;
            }
            
            $scope.updateTootltip();
          }
          
          $scope.$apply();
        }
        else {
          $scope.timePlaying = null;
          $scope.seekPercentage = 0;
          $scope.updateTootltip();
        }
      });
      
      $scope.$root.$on('rkPlaybackStatusChange', function(event, data) {
        $scope.playbackStatus = data;
      });

      $('.seek-slider-wrapper input[type="range"]').on('mouseup', function() {
        this.blur();
      }).on('mouseover', function() {
        $scope.updateTootltip();
      });

      $scope.$root.rkRequiredControllers.now_playing.loaded = true;
    }
    
    $timeout(function() {
      init();
    });
  }
]);