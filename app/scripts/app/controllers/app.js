rekodiApp.controller('rkAppCtrl', ['$scope', '$timeout', 'kodiApiService', 'rkSettingsService', 'rkDialogService', 'rkKodiPropertiesService',
  function($scope, $timeout, kodiApiService, rkSettingsService, rkDialogService, rkKodiPropertiesService) {
    $scope.controllersLoaded = false;
    $scope.$root.rkRequiredControllers = {};
    var rkRequiredControllers = ['footer', 'now_playing', 'playback_controls', 'tabs', 'window'];
    
    for(var key in rkRequiredControllers) {
      $scope.$root.rkRequiredControllers[rkRequiredControllers[key]] = {loaded: false};
    }

    function init() {
      if(rkSettingsService.isConnectionConfigured()) {
        rkDialogService.showConnecting();
      }
      else {
        rkDialogService.showNotConfigured();
      }
      
      var loadRequiredControllersWatch = $scope.$root.$watch('rkRequiredControllers', function(newValue, oldValue) {
        var allInitialControllersLoaded = true;

        for(var key in newValue) {
          if(!newValue[key].loaded) {
            allInitialControllersLoaded = false;
            break;
          }
        }
        
        if(allInitialControllersLoaded) {
          $scope.controllersLoaded = true;

          if(rkSettingsService.isConnectionConfigured()) {
            kodiApiService.connect();
          }
          
          loadRequiredControllersWatch(); //destroy watcher
        }
      }, true);
    }
    
    $timeout(function() {
      init();
    });
  }
]);