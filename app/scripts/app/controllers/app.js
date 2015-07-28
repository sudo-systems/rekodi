rekodiApp.controller('rkAppCtrl', ['$scope', 'rkKodiWsApiService',
  function($scope, rkKodiWsApiService) { 
    $scope.isConfigured = rkKodiWsApiService.isConfigured();

    if($scope.isConfigured) {
      rkKodiWsApiService.connect();
    }
  }
]);