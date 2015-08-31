rekodiApp.controller('rkWindowCtrl', ['$scope', 'rkNowPlayingService', '$timeout', '$localStorage', 'rkDialogService', 'rkSettingsService',
  function($scope, rkNowPlayingService, $timeout, $localStorage, rkDialogService, rkSettingsService) {
    var remote = require('remote');
    var rimraf = require('rimraf');
    var mainWindow = remote.getCurrentWindow();
    var defaultWallpaperApplied = false;
    var isClosing = false;
    var minWindowHeight = 227;
    var maxWindowHeight = 700;
    var windowWidth = 500;
    $scope.isConnected = false;
    
    $scope.close = function() {
      if(!rkSettingsService.get({category: 'window', key: 'hideShutdownDialog'})) {
        rkDialogService.showCloseWindow();
        return;
      }
      
      mainWindow.close();
    };
    
    $scope.minimize = function() {
      mainWindow.minimize();
    };
    
    $scope.showSystemOptionsDialog = function() {
      rkDialogService.showSystemOptions();
    };
    
    $scope.toggleCompact = function() {
      var currentWindowSize = mainWindow.getSize();
      var resizeAnimationInterval = null;
      var animationSpeed = 1;
      var animationSteps = 100;
      
      if(currentWindowSize[1] >= maxWindowHeight) {
        var tempHeight = currentWindowSize[1];
        
        resizeAnimationInterval = setInterval(function() {
          if(tempHeight === minWindowHeight) {
            clearInterval(resizeAnimationInterval);
          }
          else {
            tempHeight -= animationSteps;
            
            if(tempHeight < minWindowHeight) {
              tempHeight = minWindowHeight;
            }
            
            mainWindow.setSize(windowWidth, tempHeight);
          }
        }, animationSpeed);
      }
      else if(currentWindowSize[1] < maxWindowHeight) {
        var tempHeight = currentWindowSize[1];
        
        resizeAnimationInterval = setInterval(function() {
          if(tempHeight === maxWindowHeight) {
            clearInterval(resizeAnimationInterval);
          }
          else {
            tempHeight += animationSteps;
            
            if(tempHeight > maxWindowHeight) {
              tempHeight = maxWindowHeight;
            }
            
            mainWindow.setSize(windowWidth, tempHeight);
          }
        }, animationSpeed);
      }
    };

    function init() {
      window.onbeforeunload = function (event) {
        if($localStorage.settings.nowPlaying.fanartWallpaper) {
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

      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        $scope.isConnected = (connection);
      });
      
      $scope.$root.rkRequiredControllers.window.loaded = true;
    }
    
    $scope.$evalAsync(function() {
      $timeout(function() {
        init();
      });
    });
  }
]);