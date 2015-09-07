rekodiApp.controller('rkAppCtrl', ['$scope', '$timeout', 'kodiApiService', 'rkSettingsService', 'rkDialogService', 'rkKodiPropertiesService',
  function($scope, $timeout, kodiApiService, rkSettingsService, rkDialogService, rkKodiPropertiesService) {
    function init() {
      if(rkSettingsService.isConnectionConfigured()) {
        rkDialogService.showConnecting();
        
        $timeout(function() {
          kodiApiService.connect();
        }, 1000);
      }
      else {
        rkDialogService.showNotConfigured();
      }
    }
    
    $timeout(function() {
      init();
    });
  }
]);