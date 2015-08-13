rekodiApp.controller('rkNowPlayingCtrl', ['$scope', '$timeout', 'rkNowPlayingService', 
  function($scope, $timeout, rkNowPlayingService) {
    $scope.playStatus = {};
    
    function init() {
      $scope.$root.$on('rkNowPlayingDataUpdated', function(event, data) {
        $scope.playStatus = data;
      });
    }
    
    $timeout(function() {
      init();
    });
  }
]);