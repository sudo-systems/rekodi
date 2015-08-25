rekodiApp.controller('rkSettingsCtrl', ['$scope', 'kodiApiService', 'rkNowPlayingService', 'rkSettingsService', '$timeout',
  function($scope, kodiApiService, rkNowPlayingService, rkSettingsService, $timeout) {
    var sections = ['connection', 'nowPlaying'];
    $scope.settings = {};
    $scope.connectButton = {
      text: 'connect',
      disabled: false
    };
    
    $scope.connect = function() {
      kodiApiService.connect(true);
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
    };

    $scope.init = function() {
      for(var key in sections) {
        $scope.settings[sections[key]] = rkSettingsService.get({category: sections[key]});
        
        $scope.$watchCollection('settings.'+sections[key], function(newData, oldData) {
          if(newData) {
            for(var key in newData) {
              rkSettingsService.set({
                category: sections[key],
                key: key,
                value: newData[key]
              });
            }
            
            if(newData.fanartWallpaper) {
              rkNowPlayingService.applyCurrentFanartWallpaper();
            }
            else {
              rkNowPlayingService.applyDefaultWallpaper();
            }
          }
        }, true);
      }

      $scope.$on('rkWsConnectionStatusChange', function(event, connection) {
        $scope.setConnectionStatus(connection);
      });
    };
    
    $timeout(function() {
      $scope.init();
    });
  }
]);