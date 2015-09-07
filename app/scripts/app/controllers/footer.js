rekodiApp.controller('rkFooterCtrl', ['$scope', '$timeout',
  function($scope, $timeout) {
    $scope.isConnected = false;
    
    function init() {
      $scope.$root.$on('rkWsConnectionStatusChange', function(event, connection) {
        $timeout(function() {
          $scope.isConnected = (connection);

          if(!$scope.$$phase){
            $scope.$apply();
          }
        });
      });
    }
    
    $scope.$evalAsync(function() {
      $timeout(function() {
        init();
      });
    });
  }
]);