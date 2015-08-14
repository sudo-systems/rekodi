rekodiApp.controller('rkAppCtrl', ['$scope', '$localStorage', '$timeout', 'rkKodiWsApiService', '$sessionStorage', 'rkPlayerPropertiesService', 'rkNowPlayingService',
  function($scope, $localStorage, $timeout, rkKodiWsApiService, $sessionStorage, rkPlayerPropertiesService, rkNowPlayingService) {
    $scope.storage = $localStorage;
    $scope.sessionStorage = $sessionStorage;
    $scope.isConfigured = true;
    $scope.isConnected = true;

    $scope.setActiveTab = function(tab, subTab) {
      $timeout(function() {
        angular.element('nav li[rel='+tab+']').trigger('click');
      });

      if(subTab) {
        $timeout(function() {
          angular.element('nav li[rel='+subTab+']').trigger('click');
        });
      }
    };
    
    function setIfConnectionConfigured() {
      $scope.isConfigured = (!$localStorage.settings ||
        $localStorage.settings.constructor !== Object ||
        !$localStorage.settings.serverAddress || 
        !$localStorage.settings.jsonRpcPort || 
        $localStorage.settings.serverAddress === '' || 
        $localStorage.settings.jsonRpcPort === '')? false : true;
    };

    function init() {
      setIfConnectionConfigured();
      rkKodiWsApiService.connect();
      
      if($scope.storage.tabs && $scope.storage.tabs.currentlyActiveTab) {
        $scope.storage.tabs.currentlyActiveTab = '';
      }
      
      $scope.$watchCollection(function() { 
        return $localStorage.settings; 
      }, function(newData, oldData) {
        setIfConnectionConfigured();
      });
      
      $scope.$watch(function() { 
        return $sessionStorage.connectionStatus.connected; 
      }, function(newData, oldData) {
        $scope.isConnected = newData;
      });
    }
    
    init();
  }
]);