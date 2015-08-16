rekodiApp.controller('rkFilesCtrl', ['$scope', '$element', 'kodiApiService', 'rkTooltipsService', 'rkEnumsService', '$attrs', 'rkCacheService', 'rkHelperService', 'rkRemoteControlService',
  function($scope, $element, kodiApiService, rkTooltipsService, rkEnumsService, $attrs, rkCacheService, rkHelperService, rkRemoteControlService) {
    $scope.identifier = $attrs.id;
    $scope.files = {};
    $scope.sources = [];
    $scope.type = '';
    $scope.currentLevel = null;
    $scope.currentDirectory = null;
    var sourcesPaths = [];
    var kodiApi = null;
    $scope.filter = {
      value: ''
    };
    
    function getSourcesFromCache() {
      if($scope.sources.length === 0) {
        $scope.sources = rkCacheService.get({key: 'sources'});
        sourcesPaths = rkCacheService.get({key: 'sourcesPaths'});
      }
    }

    $scope.getSources = function() {
      $scope.currentLevel = 'sources';
      $scope.currentDirectory = null;
      $scope.clearFilter();

      if(kodiApi) {
        $scope.$root.$emit('rkStartLoading');
        getSourcesFromCache();
        
        kodiApi.Files.GetSources({
          media: $scope.type,
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.sources = (data.sources === undefined)? [] : data.sources;
          var properties = {
            data: data.sources,
            key: 'sources'
          };
          
          if(rkCacheService.update(properties)) {
            $scope.sources = data.sources;
            
            for(var key in data.sources) {
              sourcesPaths.push(data.sources[key].file);
            }

            rkCacheService.update({
              data: sourcesPaths,
              key: 'sourcesPaths' 
            });
          }
          else {
            getSourcesFromCache();
          }

          $scope.$root.$emit('rkStopLoading');
          rkTooltipsService.apply($($element).find('.data-list-wrapper'));
        }, function(error) {
          rkHelperService.handleError(error);
          $scope.$root.$emit('rkStopLoading');
        });
      }
    };

    function getFilesFromCache(index) {
      if(!$scope.files[index]) {
        $scope.files[index] = rkCacheService.get({
          key: 'files',
          index: index
        });
      }
    }
    
    $scope.getDirectory = function(directory) {
      $scope.currentLevel = 'files';
      $scope.currentDirectory = directory;
      var indexKey = encodeURIComponent(directory);
      $scope.currentDirectoryIndexKey = indexKey;
      $scope.clearFilter();
      
      if(kodiApi) {
        $scope.$root.$emit('rkStartLoading');
        getFilesFromCache(indexKey);
        var fields = ['file'];

        if($scope.type === 'video') {
          fields = ['file', 'thumbnail', 'genre', 'plotoutline', 'rating', 'year'];
        }
        
        if($scope.type === 'audio') {
          fields = ['file'];
        }
        
        kodiApi.Files.GetDirectory({
          directory: directory,
          media: $scope.type,
          properties: fields,
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.files = (data.files === undefined)? [] : rkHelperService.addCustomFields(data.files);
          var properties = {
            data: data.files,
            key: 'files',
            index: indexKey
          };
          
          if(rkCacheService.update(properties)) {
            $scope.files[indexKey] = data.files;
          }
          else {
            getFilesFromCache(indexKey);
          }

          $scope.$root.$emit('rkStopLoading');
          rkTooltipsService.apply($($element).find('.data-list-wrapper'));
        }, function(error) {
          $scope.$root.$emit('rkStopLoading');
          rkHelperService.handleError(error);
        });
      }
    };
    
    $scope.directoryUp = function() {
      if($scope.currentDirectory) {
        var directoryUp = $scope.currentDirectory.split('/').slice(0, -2).join('/')+'/';
        
        for(var key in sourcesPaths) {
          if(sourcesPaths[key].indexOf(directoryUp) > -1 && directoryUp.length < sourcesPaths[key].length) {
            $scope.getSources();
            return;
          }
        }
        
        $scope.getDirectory(directoryUp);
      }
    };
    
    $scope.play = function(entry) {
      var options = {
        item: {}
      };
      
      options.item[entry.filetype] = entry.file;

      if(kodiApi) {
        rkRemoteControlService.play(options);
      }
    };
    
    $scope.addToPlaylist = function(entry) {
      if(kodiApi) {
        $scope.$root.$emit('rkStartLoading');
        var playlistId = ($scope.type === 'music')? rkEnumsService.PlaylistId.AUDIO : rkEnumsService.PlaylistId.VIDEO;

        kodiApi.Playlist.GetItems({
          playlistid: playlistId
        }).then(function(data) {
          var options = {
            playlistid: playlistId,
            position: (data.items)? data.items.length : 0,
            item: {}
          };

          options.item[entry.filetype] = entry.file;
          
          kodiApi.Playlist.Insert(options).then(function(data) {
            if(data === 'OK') {
              emitAddedToPlaylistNotification(entry);
            }
          }, function(error) {
            $scope.$root.$emit('rkStopLoading');
            rkHelperService.handleError(error);
          });
        }, function(error) {
          $scope.$root.$emit('rkStopLoading');
          rkHelperService.handleError(error);
        });
      }
    };
    
    $scope.filterList = function(entry) {
      return (entry.label.toLowerCase().indexOf($scope.filter.value.toLowerCase()) > -1 || entry.label === '..');
    };
    
    $scope.clearFilter = function() {
      $scope.filter.value = '';
    };

    function emitAddedToPlaylistNotification(entry) {
      var fileName = '';
      
      if(entry.filetype === 'file'){
        fileName = '"' +entry.file.substring(entry.file.lastIndexOf('/')+1, entry.file.lastIndexOf('.'))+ '"';
      }
      else if(entry.filetype === 'directory') {
        var parts = entry.file.split('/');
        fileName = 'Directory "' +parts[(parts.length-2)]+ '"';
      }
      else {
        fileName = '"Unknow"';
      }
      
      $scope.$root.$emit('rkAddedToPlaylist', {
        message: fileName+ ' has been added to the playlist'
      });
    }
    
    function initConnectionChange() {
      kodiApi = kodiApiService.getConnection();

      if(kodiApi && $scope.sources.length === 0) {
        $scope.getSources();
      }
    }

    $scope.init = function() {
      rkCacheService.setCategory($scope.identifier);
      initConnectionChange();
      
      $scope.$root.$on('rkWsConnectionStatusChange', function (event, data) {
        initConnectionChange();
      });
    };
  }
]);