rekodiApp.controller('rkFooterCtrl', ['$scope', '$timeout',
  function($scope, $timeout) {
    $scope.connected = false;
    $scope.statusMessage = 'offline';
    
    $scope.$root.$on('rkWsConnectionStatusChange', function(event, data) {
      $timeout(function() {
        $scope.connected = data.connected;
        $scope.statusMessage = data.statusMessage;
      });
    });
    
    $scope.$root.$on('rkStartLoading', function(event, data) {
      $timeout(function() {
        $('#footer .loading-indicator').css('display', 'inline-block').fadeIn(150);
      });
    });
    
    $scope.$root.$on('rkStopLoading', function(event, data) {
      $timeout(function() {
        $('#footer .loading-indicator').fadeOut(150);
      });
    });
  }
]);