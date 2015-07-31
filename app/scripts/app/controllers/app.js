rekodiApp.controller('rkAppCtrl', ['$scope', '$localStorage', '$timeout', 'rkKodiWsApiService',
  function($scope, $localStorage, $timeout, rkKodiWsApiService) {
    $scope.storage = $localStorage;

    if($scope.storage.settings && $scope.storage.settings.serverAddress !== '') {
      rkKodiWsApiService.connect();
    }
    
    $scope.setActiveTab = function(tab, subTab) {
      $timeout(function() {
        angular.element('nav li[rel='+tab+']').trigger('click');
      });

      if(subTab) {
        $timeout(function() {
          angular.element('nav li[rel='+subTab+']').trigger('click');
        });
      }
    };
  }
]);