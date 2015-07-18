rekodiApp.controller('rkMusicCtrl', ['$scope', '$timeout', 'rkKodiWsApiService',
  function($scope, $timeout, rkKodiWsApiService) {
    $scope.libraryData = {};
    $scope.filesData = {};
    var kodiWsApiConnection = null;
    
    $scope.getLibraryData = function() {
      
    };
    
    $scope.getSourcesData = function() {
        kodiWsApiConnection = rkKodiWsApiService.getConnection();
        var promise = kodiWsApiConnection.Files.GetSources({
          media: 'music',
          sort: {
            order: 'ascending',
            method: 'label'
          }
        });
        
        promise.then(function(data) {
          $scope.filesData = data.sources;
          $scope.$apply();
        }, function(error) {});
    };
    
    $scope.getDirectoryData = function(directory) {
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      var promise = kodiWsApiConnection.Files.GetDirectory({
        directory: directory,
        media: 'music',
        sort: {
            order: 'ascending',
            method: 'label'
          }
      });
      
      var dirWithoutTrailingSlash = directory.substr(0, directory.lastIndexOf('/'));
      var dirUp = dirWithoutTrailingSlash.substr(0, dirWithoutTrailingSlash.lastIndexOf('/'))+'/';

      promise.then(function(data) {
        $scope.filesData = data.files;
        $scope.filesData.unshift({
          label: '..',
          filetype: 'directory',
          file: dirUp
        });
        $scope.$apply();
      }, function(error) {
        $scope.getSourcesData();
      });
    };
    
    $scope.getData = function() {
      $scope.getSourcesData();
    };
    
    $scope.$root.$on('rkWsConnectionStatusChange', function(event, data) {
      if(data.connected) {
        $scope.getSourcesData();
      }
      else {
        $scope.sourcesData = {};
      }
    });
    
    $scope.$evalAsync(function() { 
      if(rkKodiWsApiService.isConnected()) {
        $timeout(function() {
          $scope.getSourcesData();
        });
      }
    });
  }
]);