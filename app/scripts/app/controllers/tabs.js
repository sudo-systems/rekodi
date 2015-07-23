rekodiApp.controller('rkTabsCtrl', ['$scope', 
  function($scope) {
    $scope.initTab = function(tabSelector) {
      for(var i in tabSelector) {
        angular.element($(tabSelector[i])).scope().init();
      }
    };
  }
]);