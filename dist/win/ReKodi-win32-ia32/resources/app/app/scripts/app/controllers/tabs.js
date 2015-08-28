rekodiApp.controller('rkTabsCtrl', ['$scope', '$timeout', 'rkTabsService',
  function($scope, $timeout, rkTabsService) {
    $scope.initController = function(controller) {
      rkTabsService.initController(controller);
    };
    
    function init() {
      $scope.$root.rkRequiredControllers.tabs.loaded = true;
    }
    
    $timeout(function() {
      init();
    });
  }
]);