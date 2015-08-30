rekodiApp.controller('rkFooterCtrl', ['$scope', '$timeout',
  function($scope, $timeout) {
    $scope.isConnected = false;
    $scope.loadingMessage = 'loading...';

    $scope.$root.$on('rkWsConnectionStatusChange', function(event, connection) {
      $timeout(function() {
        $scope.isConnected = (connection);
        
        if(!$scope.$$phase){
          $scope.$apply();
        }
      });
    });
    
    $scope.$root.$on('rkStartLoading', function(event, data) {
      $timeout(function() {
        $('#footer .indicator').hide();
        $('#footer .indicator.loading').stop().fadeIn(150).css('display', 'inline-block');
      });
    });
    
    $scope.$root.$on('rkStopLoading', function(event, data) {
      $timeout(function() {
        $('#footer .indicator').hide();
        $('#footer .indicator.loading').stop().fadeOut(150);
      });
    });

    $timeout(function() {
      $scope.$root.rkRequiredControllers.footer.loaded = true;
    });
  }
]);