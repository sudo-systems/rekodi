rekodiApp.controller('rkWindowCtrl', ['$scope', 
  function($scope) {
    var remote = require('remote');
    var mainWindow = remote.getCurrentWindow();
    
    $scope.close = function() {
      console.log('close');
      mainWindow.close();
    };
    
    $scope.minimize = function() {
      console.log('minimize');
      mainWindow.minimize();
    };
  }
]);