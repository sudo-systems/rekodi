rekodiApp.controller('rkWindowCtrl', ['$scope', '$element', 'rkTooltipsService', 'rkNowPlayingService', '$timeout', '$localStorage',
  function($scope, $element, rkTooltipsService, rkNowPlayingService, $timeout, $localStorage) {
    var remote = require('remote');
    var mainWindow = remote.getCurrentWindow();
    var defaultWallpaperApplied = false;
    var isClosing = false;
    
    $scope.close = function() {
      mainWindow.close();
    };
    
    $scope.minimize = function() {
      mainWindow.minimize();
    };

    function init() {
      window.onbeforeunload = function (event) {
        if($localStorage.settings && $localStorage.settings.fanartWallpaper) {
          if(isClosing) {
            if(defaultWallpaperApplied) {
              return true;
            }
            
            rkNowPlayingService.applyDefaultWallpaper(function() {
              defaultWallpaperApplied = true;
              mainWindow.close();
            });

            return false;
          }
          
          rkNowPlayingService.applyDefaultWallpaper();
        }
        
        return true;
      };
      
      mainWindow.on('close', function() {
        isClosing = true;
      });
      
      $scope.$evalAsync(function() {
        rkTooltipsService.apply($($element));
      });
      
      $scope.$root.rkControllers.window.loaded = true;
    }
    
    $timeout(function() {
      init();
    });
  }
]);