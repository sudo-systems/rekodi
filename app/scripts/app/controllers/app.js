rekodiApp.controller('rkAppCtrl', ['$scope', 'rkKodiWsApiService',
  function($scope, rkKodiWsApiService) {    
    rkKodiWsApiService.connectPersistent();
  }
]);