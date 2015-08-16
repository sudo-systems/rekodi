rekodiApp.controller('rkSettingsCtrl', ['$scope', '$localStorage', 'kodiApiService', 'rkNowPlayingService', '$timeout',
  function($scope, $localStorage, kodiApiService, rkNowPlayingService, $timeout) {
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
          password: '',
          fanartWallpaper: false
        };
      }
      
      $scope.storage = $localStorage.settings;
      
      $scope.$on('rkWsConnectionStatusChange', function(event, data) {
        $scope.setConnectionStatus(data);
      });


      $scope.$watchCollection(function() { 
        return $localStorage.settings; 
      }, function(newData, oldData) {
        $scope.setButtonStatus(newData, oldData);

        if(newData.fanartWallpaper) {
          rkNowPlayingService.applyCurrentFanartWallpaper();
        }
        else {
          rkNowPlayingService.applyDefaultWallpaper();
        }
      });
    }
    
    $timeout(function() {
      init();
    });
  }
]);