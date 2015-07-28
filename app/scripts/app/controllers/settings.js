rekodiApp.controller('rkSettingsCtrl', ['$scope', '$localStorage',
  function($scope, $localStorage) {
    $scope.storage = null;

    function init() {
      if(!$localStorage.settings || $localStorage.settings.constructor !== Object) {
        $localStorage.settings = {
          serverAddress: '',
          jsonRpcPort: '9090'
        };
      }
      
      $scope.storage = $localStorage.settings;
    }
    
    init();
  }
]);