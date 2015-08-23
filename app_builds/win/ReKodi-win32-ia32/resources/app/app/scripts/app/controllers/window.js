rekodiApp.controller('rkWindowCtrl', ['$scope', '$element', 'rkTooltipsService', 'rkNowPlayingService', '$timeout', '$localStorage',
  function($scope, $element, rkTooltipsService, rkNowPlayingService, $timeout, $localStorage) {
    var remote = require('remote');
    var rimraf = require('rimraf');
    var mainWindow = remote.getCurrentWindow();
    var defaultWallpaperApplied = false;
    var isClosing = false;
    
    $scope.close = function() {
      mainWindow.close();
    };
    
    $scope.minimize = function() {
      mainWindow.minimize();
    };

    function deleteTempDirectory() {
      rimraf(__dirname+'/.tmp/', function(error) {
        if(error) {
          console.error('Error: '+error);
        } 
      });
    }

    function init() {
      window.onbeforeunload = function (event) {
        if($localStorage.settings && $localStorage.settings.fanartWallpaper) {
          if(isClosing) {
            if(defaultWallpaperApplied) {
              deleteTempDirectory();
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
        
        deleteTempDirectory();
        
        return true;
      };
      
      mainWindow.on('close', function() {
        isClosing = true;
      });
      
      $scope.$evalAsync(function() {
        rkTooltipsService.apply($($element));
      });
      
      $scope.$root.rkRequiredControllers.window.loaded = true;
    }
    
    $timeout(function() {
      init();
    });
  }
]);