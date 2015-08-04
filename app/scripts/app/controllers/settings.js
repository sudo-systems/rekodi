rekodiApp.controller('rkSettingsCtrl', ['$scope', '$localStorage', 'rkKodiWsApiService',
  function($scope, $localStorage, rkKodiWsApiService) {
    $scope.storage = null;
    $scope.connectButton = {
      text: 'connect',
      disabled: false
    };
    
    $scope.connect = function() {
      $scope.connectButton.text = 'connecting...';
      $scope.connectButton.disabled = true;
      
      rkKodiWsApiService.connect(true, true, function(result) {
        if(result.connected) {
          $scope.connectButton.text = 'allready connected';
          $scope.connectButton.disabled = true;
        }
        else {
          $scope.connectButton.text = 'connect';
          $scope.connectButton.disabled = false;
        }
      });
    };
    
    $scope.setDefaultTab = function(tabPath) {
      
    };

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