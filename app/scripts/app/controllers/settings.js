rekodiApp.controller('rkSettingsCtrl', ['$scope', 'rkNowPlayingService', '$timeout', '$localStorage', '$translate',
  function($scope, rkNowPlayingService, $timeout, $localStorage, $translate) {
    var isConnected = false;
    $scope.settings = {};
    
    $scope.changeLanguage = function(key) {
      $translate.use(key);
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
      });
    };
    
    $scope.$evalAsync(function() {
      $timeout(function() {
        init();
      });
    });
  }
]);