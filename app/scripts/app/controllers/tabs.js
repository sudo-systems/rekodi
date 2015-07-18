rekodiApp.controller('rkTabsCtrl', ['$scope', 
  function($scope) {
    $scope.initTab = function(tabSelector) {
      angular.element($(tabSelector)).scope().init();
    };
  }
]);