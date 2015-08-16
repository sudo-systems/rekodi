rekodiApp.controller('rkNowPlayingCtrl', ['$scope', '$timeout', 'rkHelperService',
  function($scope, $timeout, rkHelperService) {
    $scope.nowPlaying = null;
    $scope.timePlaying = '00:00:00';
    
    function init() {
      $scope.$root.$on('rkNowPlayingDataUpdate', function(event, data) {
        $scope.nowPlaying = data;

        if(!data) {
          $scope.timePlaying = null;
        }
      });
      
      $scope.$root.$on('rkPlayerPropertiesChange', function(event, data) {
        if(data.time && Object.keys(data.time).length > 0) {
          var seconds = (+data.time.hours) * 60 * 60 + (+data.time.minutes) * 60 + (+data.time.seconds);
          $scope.timePlaying = rkHelperService.secondsToDuration(seconds);
          $scope.$apply();
        }
        else {
          $scope.timePlaying = null;
        }
      });
      
      $scope.$root.rkControllers.now_playing.loaded = true;
    }
    
    $timeout(function() {
      init();
    });
  }
]);