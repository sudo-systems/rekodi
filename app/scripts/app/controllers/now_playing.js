rekodiApp.controller('rkNowPlayingCtrl', ['$scope', '$timeout', 'rkHelperService', 'rkPlaybackStatusService', 'rkRemoteControlService', 'rkNotificationService', 'rkDialogService',
  function($scope, $timeout, rkHelperService, rkPlaybackStatusService, rkRemoteControlService, rkNotificationService, rkDialogService) {
    $scope.nowPlaying = null;
    $scope.timePlaying = null;
    $scope.isManuallySeeking = false;
    $scope.playbackStatus = null;
    $scope.seekbarResolution = 100000;
    $scope.playerProperties = null;
    $scope.seek = {
      position: 0
    };
    
    function setDefaults() {
      $scope.nowPlaying = null;
      $scope.timePlaying = '00:00';
      $scope.seek.position = 0;
      $scope.playbackStatus = null;
      $scope.isManuallySeeking = false;
      $scope.updateTootltip($scope.seek.position);
      
      if(!$scope.$$phase){
        $scope.$apply();
      }
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
          
          if(!$scope.$$phase){
            $scope.$apply();
          }
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
        styl.inject(sliderWrapperHoverSelector+', '+sliderWrapperFocusSelector, {content: '\''+seekTime+'\''}).apply();
      }
    };
    
    $scope.showArtistOptionsDialog = function(nowPlayingData) {
      var _artist = angular.extend({}, {}, nowPlayingData);
      _artist.label = nowPlayingData.displayartist;
      rkDialogService.showArtistOptions(_artist);
    };
    
    $scope.showAlbumOptionsDialog = function(nowPlayingData) {
      var _album = angular.extend({}, {}, nowPlayingData);
      _album.label = nowPlayingData.album;
      rkDialogService.showAlbumOptions(_album);
    };
    
    $scope.showSongOptionsDialog = function(nowPlayingData) {
      rkDialogService.showSongOptions(nowPlayingData);
    };

    function init() {
      $scope.status = rkPlaybackStatusService.getCurrentStatus();
      
      $scope.$root.$on('rkNowPlayingDataUpdate', function(event, data) {
        $scope.nowPlaying = data;
        
        if(!$scope.$$phase){
          $scope.$apply();
        }

        if(!$scope.nowPlaying) {
          setDefaults();
        }
      });
      
      $scope.$root.$on('rkPlayerPropertiesChange', function(event, data) {
        $scope.playerProperties = data;

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
        
        if(!$scope.$$phase){
          $scope.$apply();
        }
      });
      
      $scope.$root.$on('rkPlaybackStatusChange', function(event, data) {
        if(data && $scope.playbackStatus) {
          if(!$scope.playbackStatus.isPaused && data.isPaused) {
            rkNotificationService.notifyPause($scope.nowPlaying);
          }
          else if($scope.playbackStatus.isPaused && data.isPlaying) {
            rkNotificationService.notifyResume($scope.nowPlaying);
          }
        }

        $scope.playbackStatus = data;
        
        if(!$scope.$$phase){
          $scope.$apply();
        }
      });
      
      $scope.updateTootltip($scope.seek.position);

      $('.seek-slider-wrapper input[type="range"]').on('mouseup', function() {
        this.blur();
      });
    }
    
    $scope.$evalAsync(function() {
      $timeout(function() {
        init();
      });
    });
  }
]);