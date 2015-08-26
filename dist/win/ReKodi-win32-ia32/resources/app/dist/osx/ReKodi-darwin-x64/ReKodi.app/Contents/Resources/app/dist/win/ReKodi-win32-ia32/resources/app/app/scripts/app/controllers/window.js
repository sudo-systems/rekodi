rekodiApp.controller('rkWindowCtrl', ['$scope', '$element', 'rkTooltipsService',
  function($scope, $element, rkTooltipsService) {
    var remote = require('remote');
    var mainWindow = remote.getCurrentWindow();
    
    $scope.close = function() {
      mainWindow.close();
    };
    
    $scope.minimize = function() {
      mainWindow.minimize();
    };
    
    $scope.$evalAsync(function() {
      rkTooltipsService.apply($($element));
    });
  }
]);