rekodiApp.controller('rkNowPlayingCtrl', ['$scope', '$timeout',
  function($scope, $timeout) {
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