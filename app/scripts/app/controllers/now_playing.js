rekodiApp.controller('rkNowPlayingCtrl', ['$scope', '$sessionStorage', '$timeout',
  function($scope, $sessionStorage, $timeout) {
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