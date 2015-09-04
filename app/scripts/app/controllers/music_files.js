rekodiApp.controller('rkMusicFilesCtrl', ['$scope', 'kodiApiService', 'rkEnumsService', 'rkLogService', 'rkRemoteControlService', 'rkFilesService',
  function($scope, kodiApiService, rkEnumsService, rkLogService, rkRemoteControlService, rkFilesService) {
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

    $scope.play = function(entry) {
      if(kodiApi) {
        var options = {item: {}};
        options.item[entry.filetype] = entry.file;
        
        rkRemoteControlService.play(options);
      }
    };
    
    $scope.addToPlaylist = function(entry) {
      if(kodiApi) {
        kodiApi.Playlist.GetItems({
          playlistid: rkEnumsService.PlaylistId.AUDIO
        }).then(function(data) {
          var options = {
            playlistid: rkEnumsService.PlaylistId.AUDIO,
            position: (data.items)? data.items.length : 0,
            item: {}
          };

          options.item[entry.filetype] = entry.file;
          
          kodiApi.Playlist.Insert(options).then(function(data) {
            if(data === 'OK') {}
          }, function(error) {
            rkLogService.error(error);
          });
        }, function(error) {
          rkLogService.error(error);
        });
      }
    };
    
    $scope.filterList = function(entry) {
      return (entry.label.toLowerCase().indexOf($scope.filter.value.toLowerCase()) > -1 || entry.label === '..');
    };
    
    $scope.clearFilter = function() {
      $scope.filter.value = '';
    };
    
    function initConnectionChange() {
      kodiApi = kodiApiService.getConnection();

      if(kodiApi) {
        $scope.getSources();
      }
    }

    $scope.init = function() {
      filesService = new rkFilesService.instance('music');
      kodiApi = kodiApiService.getConnection();
      initConnectionChange();
      
      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        kodiApi = connection;
        initConnectionChange();
      });

      $scope.status.isInitialized = true;
    };
    
    $scope.$root.$on('rkMusicFilesCtrlInit', function (event) {
      if($scope.status.isInitialized) {
        return;
      }

      $scope.init();
    });
  }
]);