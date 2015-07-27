rekodiApp.controller('rkSettingsCtrl', ['$scope', '$localStorage',
  function($scope, $localStorage) {
    $scope.storage = $localStorage.settings;
    
    $scope.saveValue = function(key, value) {
      
    };
    
    function init() {
      if(!$localStorage.settings || $localStorage.settings.constructor !== Object) {
        $localStorage.settings = {
          ipAddress: '',
          jsonRpcPort: '9090'
        };
      }
      
      $scope.storage = $localStorage.settings;
    }
    
    init();
  }
]);