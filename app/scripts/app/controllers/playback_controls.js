rekodiApp.controller('rkPlaybackControlsCtrl', ['$scope', '$sessionStorage',
  function($scope, $sessionStorage) {
    $scope.isConnected = $sessionStorage.connectionStatus.connected;
    
    function init() {
      $scope.$watch(function() { 
        return $sessionStorage.connectionStatus.connected; 
      }, function(newData, oldData) {
        $scope.isConnected = newData;
      });
    }
    
    init();
  }
]);