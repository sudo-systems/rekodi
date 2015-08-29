rekodiApp.controller('rkWindowCtrl', ['$scope', '$element', 'rkTooltipsService', 'rkNowPlayingService', '$timeout', '$localStorage', 'rkDialogService', 'rkSettingsService',
  function($scope, $element, rkTooltipsService, rkNowPlayingService, $timeout, $localStorage, rkDialogService, rkSettingsService) {
    var remote = require('remote');
    var rimraf = require('rimraf');
    var mainWindow = remote.getCurrentWindow();
    var defaultWallpaperApplied = false;
    var isClosing = false;
    var minWindowHeight = 227;
    var maxWindowHeight = 700;
    var windowWidth = 500;
    
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