rekodiApp.controller('rkAppCtrl', ['$scope', '$localStorage', '$timeout', 'kodiApiService', '$sessionStorage', 'rkNowPlayingService', 'rkKodiPropertiesService', 'rkNotificationService', 'rkSettingsService',
  function($scope, $localStorage, $timeout, kodiApiService, $sessionStorage, rkNowPlayingService, rkKodiPropertiesService, rkNotificationService, rkSettingsService) {
    $scope.storage = $localStorage;
    $scope.sessionStorage = $sessionStorage;
    $scope.isConfigured = rkSettingsService.isConnectionConfigured();
    $scope.isConnected = true;
    $scope.controllersLoaded = false;
    $scope.$root.rkRequiredControllers = {};
    var rkRequiredControllers = ['footer', 'now_playing', 'playback_controls', 'tabs', 'window'];
    
    for(var key in rkRequiredControllers) {
      $scope.$root.rkRequiredControllers[rkRequiredControllers[key]] = {loaded: false};
    }

    $scope.setActiveTab = function(tab, subTab) {
      $timeout(function() {
        angular.element('nav li[rel='+tab+']').trigger('click');
      });

      if(subTab) {
        $timeout(function() {å
          angular.element('nav li[rel='+subTab+']').trigger('click');
        });
      }
    };

    function init() {
      if($scope.storage.tabs && $scope.storage.tabs.currentlyActiveTab) {
        $scope.storage.tabs.currentlyActiveTab = '';
      }

      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        $scope.isConfigured = rkSettingsService.isConnectionConfigured();
        $scope.isConnected = (connection);
        
        if(connection) {
          rkNotificationService.notifyConnection(true, 'Connection with Kodi has been established');
        }
        else {
          rkNotificationService.notifyConnection(false, 'Could not connect with Kodi');
        }
      });

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
          kodiApiService.connect();
          loadRequiredControllersWatch(); //destroy watcher
        }
      }, true);
    }
    
    $timeout(function() {
      init();
    });
  }
]);