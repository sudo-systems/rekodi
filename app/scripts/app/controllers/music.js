rekodiApp.controller('rkMusicCtrl', ['$scope', '$timeout', 'rkKodiWsApiService',
  function($scope, $timeout, rkKodiWsApiService) {
    $scope.libraryData = {};
    $scope.filesData = {};
    $scope.sourcesData = {};
    
    $scope.getLibraryData = function() {
      
    };
    
    $scope.getSourcesData = function() {
      if(rkKodiWsApiService.isConnected()) {
        var kodiWsApi = rkKodiWsApiService.getConnection();
        var sourcesPromise = kodiWsApi.Files.GetSources({
          media: 'music'
        });
        
        sourcesPromise.then(function(data) {
          $scope.sourcesData = data;
          console.dir($scope.sourcesData);
        }, function(error) {
        });
      }
    };
    
    $scope.getFilesData = function() {
      
    };
    
    $scope.$root.$on('rkWsConnectionStatusChange', function(event, data) {
      $scope.getSourcesData();
    });
  }
]);