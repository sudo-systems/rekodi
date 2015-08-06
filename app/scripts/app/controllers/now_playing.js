rekodiApp.controller('rkNowPlayingCtrl', ['$scope', 'rkNowPlayingService', '$sessionStorage',
  function($scope, rkNowPlayingService, $sessionStorage) {
    $scope.playStatus = $sessionStorage.playStatus;
    
    function init() {
      $scope.$watchCollection(function() {
        return $sessionStorage.playStatus;
      }, function(newValue, oldValue) {
        $scope.playStatus = newValue;
      });
    }
    
    init();
  }
]);