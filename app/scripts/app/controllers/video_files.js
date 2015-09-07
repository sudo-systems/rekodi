rekodiApp.controller('rkVideoFilesCtrl', ['$scope', 'rkEnumsService', 'rkLogService', 'rkRemoteControlService', 'rkFilesService', '$timeout',
  function($scope, rkEnumsService, rkLogService, rkRemoteControlService, rkFilesService, $timeout) {
    $scope.displayLimit = 15;
    var kodiApi = null;
    var filesService = null;
    $scope.files = [];
    $scope.sources = [];
    $scope.currentLevel = null;
    $scope.scrollItems = [];
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
        if(sources && !angular.equals(sources, $scope.sources)) {
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
          playlistid: rkEnumsService.PlaylistId.VIDEO
        }).then(function(data) {
          var options = {
            playlistid: rkEnumsService.PlaylistId.VIDEO,
            position: (data.items)? data.items.length : 0,
            item: {}
          };

          options.item[entry.filetype] = entry.file;
          
          kodiApi.Playlist.Insert(options).then(function(data) {
            if(data === 'OK') {
              
            }
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

    var init = function() {
      filesService = new rkFilesService.instance('video');

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