rekodiApp.controller('rkAppCtrl', ['$scope', '$localStorage', '$timeout', 'rkKodiWsApiService',
  function($scope, $localStorage, $timeout, rkKodiWsApiService) {
    $scope.storage = $localStorage;

    if($scope.storage.settings) {
      if($scope.storage.settings.serverAddress !== '') {
        rkKodiWsApiService.connect();
      }
      else if($scope.storage.tabs && $scope.storage.tabs.currentlyActiveTab) {
        $scope.storage.tabs.currentlyActiveTab = '';
      }
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