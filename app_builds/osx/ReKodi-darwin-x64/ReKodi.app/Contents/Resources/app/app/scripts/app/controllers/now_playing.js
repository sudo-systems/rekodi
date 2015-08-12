rekodiApp.controller('rkNowPlayingCtrl', ['$scope', 'rkNowPlayingService', '$sessionStorage', '$timeout',
  function($scope, rkNowPlayingService, $sessionStorage, $timeout) {
    $scope.playStatus = $sessionStorage.playStatus;
    
    function init() {
      $scope.$root.$on('rkNowPlayingDataUpdated', function(event, data) {
        $timeout(function() {
          $scope.playStatus = data;
        });
      });
    }
    
    init();
  }
]);