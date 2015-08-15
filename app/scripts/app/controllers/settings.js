rekodiApp.controller('rkSettingsCtrl', ['$scope', '$localStorage', 'kodiApiService', '$sessionStorage',
  function($scope, $localStorage, kodiApiService, $sessionStorage) {
    $scope.storage = null;
    $scope.connectButton = {
      text: 'connect',
      disabled: false
    };
    
    $scope.connect = function() {
      kodiApiService.connect(true);
    };
    
    $scope.setDefaultTab = function(tabPath) {
      
    };
    
    $scope.setConnectionStatus = function(newData) {
      if(newData.connected) {
        $scope.connectButton.text = 'connected';
        $scope.connectButton.disabled = true;
      }
      else if(newData.connecting) {
        $scope.connectButton.text = 'connecting...';
        $scope.connectButton.disabled = true;
      }
      else {
        $scope.connectButton.text = 'connect';
        $scope.connectButton.disabled = false;
      }
    };
    
    $scope.setButtonStatus = function(newData, oldData) {
      if(newData.serverAddress !== oldData.serverAddress || newData.jsonRpcPort !== oldData.jsonRpcPort) {
        $scope.connectButton.text = 'connect';
        $scope.connectButton.disabled = false;
      }
    };

    function init() {
      if(!$localStorage.settings || $localStorage.settings.constructor !== Object) {
        $localStorage.settings = {
          serverAddress: '',
          jsonRpcPort: '9090',
          httpPort: '8080',
          username: 'kodi',
          password: ''
        };
      }
      
      $scope.storage = $localStorage.settings;

      $scope.$watchCollection(function() { 
        return $sessionStorage.connectionStatus; 
      }, function(newData, oldData) {
        $scope.setConnectionStatus(newData);
      });
      
      $scope.$watchCollection(function() { 
        return $localStorage.settings; 
      }, function(newData, oldData) {
        $scope.setButtonStatus(newData, oldData);
      });
    }
    
    init();
  }
]);