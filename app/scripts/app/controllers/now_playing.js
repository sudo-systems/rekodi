rekodiApp.controller('rkNowPlayingCtrl', ['$scope', '$timeout',
  function($scope, $timeout) {
    $scope.nowPlaying = null;
    
    function init() {
      $scope.$root.$on('rkNowPlayingDataUpdate', function(event, data) {
        $scope.nowPlaying = data;
      });
    }
    
    $timeout(function() {
      init();
    });
  }
]);