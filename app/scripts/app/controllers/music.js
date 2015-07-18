rekodiApp.controller('rkMusicCtrl', ['$scope', '$timeout', 'rkKodiWsApiService',
  function($scope, $timeout, rkKodiWsApiService) {
    $scope.libraryData = {};
    $scope.filesData = {};
    var sourcePaths = [];
    var kodiWsApiConnection = null;
    
    $scope.getLibraryData = function() {
      
    };
    
    $scope.getSourcesData = function() {
      $scope.$root.$emit('rkStartLoading');
   
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      var promise = kodiWsApiConnection.Files.GetSources({
        media: 'music',
        sort: {
          order: 'ascending',
          method: 'label'
        }
      });

      promise.then(function(data) {
        sourcePaths = [];

        for(var i=0; i<data.sources.length; i++) {
          sourcePaths[i] = data.sources[i].file;
        }

        $scope.filesData = data.sources;
        $scope.$apply();
        $scope.$root.$emit('rkStopLoading');
      }, function(error) {
        $scope.$root.$emit('rkStopLoading');
      });
    };
    
    $scope.getDirectoryData = function(directory) {
      if(directory === 'LOAD_SOURCES') {
        $scope.getSourcesData();
        return;
      }

      $scope.$root.$emit('rkStartLoading');
      var directoryUp = directory.split('/').slice(0, -2).join('/')+'/';
      
      for(var key in sourcePaths) {
        if(sourcePaths[key].indexOf(directoryUp) > -1 && directoryUp.length < sourcePaths[key].length) {
          directoryUp = 'LOAD_SOURCES';
        }
      }
      
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      var promise = kodiWsApiConnection.Files.GetDirectory({
        directory: directory,
        media: 'music',
        sort: {
            order: 'ascending',
            method: 'label'
          }
      });

      promise.then(function(data) {
        data.files = (data.files === undefined)? [] : data.files;
        $scope.filesData = data.files;
        $scope.filesData.unshift({
          label: '..',
          filetype: 'directory',
          file: directoryUp
        });
        $scope.$apply();
        $scope.$root.$emit('rkStopLoading');
      }, function(error) {
        $scope.$root.$emit('rkStopLoading');
      });
    };
    
    $scope.playEntry = function(entry, type) {
      var options = {
        item: {}
      };
      
      options.item[type] = entry;

      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      var promise = kodiWsApiConnection.Player.Open(options);
      
      promise.then(function(data) {
        console.log(data);
      }, function(error){
        console.log(error);
      });
    };

    $scope.$root.$on('rkWsConnectionStatusChange', function(event, data) {
      if(data.connected) {
        $scope.getSourcesData();
      }
      else {
        $scope.filesData = {};
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