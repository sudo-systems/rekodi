rekodiApp.controller('rkSettingsCtrl', ['$scope', 'kodiApiService', 'rkNowPlayingService', '$timeout', '$localStorage', 'rkDialogService',
  function($scope, kodiApiService, rkNowPlayingService, $timeout, $localStorage, rkDialogService) {
    var isConnected = false;
    $scope.settings = {};
    $scope.connectButton = {
      text: 'connect',
      disabled: false
    };
    
    $scope.connect = function() {
      kodiApiService.connect();
    };

    $scope.setConnectionStatus = function(connection) {
      if(connection) {
        $scope.connectButton.text = 'connected';
        $scope.connectButton.disabled = true;
      }
      else {
        $scope.connectButton.text = 'connect';
        $scope.connectButton.disabled = false;
      }
      
      if(!$scope.$$phase){
        $scope.$apply();
      }
    };

    function init() {
      $scope.settings = $localStorage.settings;
      
      $scope.$watch('settings.nowPlaying.fanartWallpaper', function(newValue, oldValue) {
        if(newValue !== oldValue && isConnected) {
          if(newValue) {
            rkNowPlayingService.applyCurrentFanartWallpaper();
          }
          else {
            rkNowPlayingService.applyDefaultWallpaper();
          }
        }
      }, true);
      
      $scope.$on('rkWsConnectionStatusChange', function(event, connection) {
        isConnected = (connection);
        $scope.setConnectionStatus(connection);
      });
    };
    
    $timeout(function() {
      init();
    });
  }
]);