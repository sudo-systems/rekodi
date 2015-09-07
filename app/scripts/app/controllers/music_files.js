rekodiApp.controller('rkMusicFilesCtrl', ['$scope', 'rkFilesService', '$timeout',
  function($scope, rkFilesService, $timeout) {
    $scope.displayLimit = 15;
    var kodiApi = null;
    var filesService = null;
    $scope.files = [];
    $scope.sources = [];
    $scope.currentLevel = null;
    $scope.scrollItems = {
      sources: [],
      files: []
    };
    $scope.isFiltering = false;
    $scope.filteredItems = [];
    $scope.filter = {value: ''};

    $scope.getSources = function() {
      $scope.currentLevel = 'sources';
      $scope.clearFilter();
      
      $scope.sources = [];
      $scope.sources = filesService.getSourcesFromCache();
      
      if(!$scope.$$phase){
        $scope.$apply();
      }

      filesService.getSources(function(sources) {
        if(sources !== null && !angular.equals(sources, $scope.sources)) {
          $scope.sources = sources;
          
          if(!$scope.$$phase){
            $scope.$apply();
          }
        }
      });
    };
    
    $scope.getDirectory = function(directory) {
      $scope.currentLevel = 'files';
      $scope.clearFilter();
      
      $scope.files = [];
      $scope.files = filesService.getDirectoryFromCache(directory);
      
      if(!$scope.$$phase){
        $scope.$apply();
      }

      filesService.getDirectory(directory, function(files) {
        if(files !== null && !angular.equals(files, $scope.files)) {
          $scope.files = files;
          
          if(!$scope.$$phase){
            $scope.$apply();
          }
        }
      });
    };
    
    $scope.directoryUp = function() {
      var data = filesService.getDirectoryUpData();
      
      if(!data || data.type === 'sources') {
        $scope.getSources();
      }
      else if(data.type === 'directory') {
        $scope.getDirectory(data.directory);
      }
    };

    $scope.filterList = function(entry) {
      return (entry.label.toLowerCase().indexOf($scope.filter.value.toLowerCase()) > -1 || entry.label === '..');
    };
    
    $scope.clearFilter = function() {
      $scope.filter.value = '';
    };

    var init = function() {
      filesService = new rkFilesService.instance('music');

      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        kodiApi = connection;
        
        if(kodiApi) {
          $scope.getSources();
        }
      });
    };

    $scope.$evalAsync(function() {
      $timeout(function() {
        init();
      });
    });
  }
]);