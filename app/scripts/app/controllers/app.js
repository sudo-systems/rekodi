rekodiApp.controller('rkAppCtrl', ['$scope', '$localStorage', '$timeout', 'rkKodiWsApiService',
  function($scope, $localStorage, $timeout, rkKodiWsApiService) { 
    $scope.isConfigured = rkKodiWsApiService.isConfigured();
    $scope.storage = $localStorage;

    if($scope.isConfigured) {
      rkKodiWsApiService.connect();
    }
    
    $scope.setActiveTab = function(tab, subTab) {
      $timeout(function() {
        angular.element('#'+tab).trigger('click');
      });

      if(subTab) {
        $timeout(function() {
          angular.element('#'+subTab).trigger('click');
        });
      }
    };
  }
]);