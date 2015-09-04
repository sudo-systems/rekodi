rekodiApp.controller('rkPicturesCtrl', ['$scope', 'kodiApiService', 'rkRemoteControlService', 'rkFilesService',
  function($scope, kodiApiService,rkRemoteControlService, rkFilesService) {
    var displayLimit = 15;
    var kodiApi = null;
    var filesService = null;
    $scope.files = [];
    $scope.sources = [];
    $scope.currentLevel = null;
    $scope.scrollItems = [];
    $scope.isFiltering = false;
    $scope.filteredItems = [];
    $scope.filter = {value: ''};
    $scope.status = {
      isInitalized: false
    };

    $scope.getSources = function() {
      $scope.currentLevel = 'sources';
      $scope.clearFilter();
      
      $scope.sources = [];
      $scope.sources = filesService.getSourcesFromCache();

      filesService.getSources(function(sources) {
        if(sources !== null && !angular.equals(sources, $scope.sources)) {
          $scope.sources = sources;
        }
      });
    };
    
    $scope.getDirectory = function(directory) {
      $scope.currentLevel = 'files';
      $scope.clearFilter();
      
      $scope.files = [];
      $scope.files = filesService.getDirectoryFromCache(directory);

      filesService.getDirectory(directory, function(files) {
        if(files !== null && !angular.equals(files, $scope.files)) {
          $scope.files = files;
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

    $scope.show = function(entry) {
      if(kodiApi) {
        var options = {item: {}};
        options.item[entry.filetype] = entry.file;
        
        rkRemoteControlService.play(options);
      }
    };

    $scope.filterList = function(entry) {
      return (entry.label.toLowerCase().indexOf($scope.filter.value.toLowerCase()) > -1 || entry.label === '..');
    };
    
    $scope.clearFilter = function() {
      $scope.filter.value = '';
    };
    
    function initConnectionChange() {
      if(kodiApi) {
        $scope.getSources();
      }
    }

    $scope.init = function() {
      filesService = new rkFilesService.instance('pictures');
      kodiApi = kodiApiService.getConnection();
      initConnectionChange();
      
      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        kodiApi = connection;
        initConnectionChange();
      });
      
      $scope.status.isInitialized = true;
    };
    
    $scope.$root.$on('rkPicturesCtrlInit', function (event) {
      if($scope.status.isInitialized) {
        return;
      }

      $scope.init();
    });
  }
]);