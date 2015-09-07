rekodiApp.controller('rkTabsCtrl', ['$scope', '$timeout', 'rkTabsService',
  function($scope, $timeout, rkTabsService) {
    $scope.initController = function(controller) {
      //rkTabsService.initController(controller);
    };
    
    function init() {
      
    }
    
    $scope.$evalAsync(function() {
      $timeout(function() {
        init();
      });
    });
  }
]);