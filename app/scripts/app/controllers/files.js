rekodiApp.controller('rkFilesCtrl', ['$scope', '$element', '$timeout', 'rkKodiWsApiService', 'rkTooltipsService', 'rkEnumsService', '$attrs', 'rkCacheService',
  function($scope, $element, $timeout, rkKodiWsApiService, rkTooltipsService, rkEnumsService, $attrs, rkCacheService) {
    $scope.identifier = $attrs.id;
    $scope.files = {};
    $scope.sources = [];
    $scope.type = '';
    $scope.currentLevel = null;
    $scope.currentDirectory = null;
    var sourcesPaths = [];
    var kodiWsApiConnection = null;
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
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
      $scope.clearFilter();
      getSourcesFromCache();

      if(kodiWsApiConnection) {
        $scope.$root.$emit('rkStartLoading');
        
        kodiWsApiConnection.Files.GetSources({
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
          handleError(error);
          $scope.$root.$emit('rkStopLoading');
        });
      }
    };
    
    function getFilesFromCache(index) {
      if(!$scope.files[index]) {
        $scope.files[index] = rkCacheService.get({
          key: 'sources',
          index: index
        });
      }
    }
    
    $scope.getDirectory = function(directory) {
      $scope.currentLevel = 'files';
      $scope.currentDirectory = directory;
      var indexKey = encodeURIComponent(directory);
      $scope.currentDirectoryIndexKey = indexKey;
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
      $scope.clearFilter();
      getFilesFromCache(indexKey);
      
      if(kodiWsApiConnection) {
        $scope.$root.$emit('rkStartLoading');
        var fields = ['file'];

        if($scope.type === 'video') {
          fields = ['file'];
        }
        
        if($scope.type === 'audio') {
          fields = ['file'];
        }
        
        kodiWsApiConnection.Files.GetDirectory({
          directory: directory,
          media: $scope.type,
          properties: fields,
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.files = (data.files === undefined)? [] : data.files;
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
          handleError(error);
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

      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      var promise = kodiWsApiConnection.Player.Open(options);
      
      promise.then(function(data) {
        if(data === 'OK') {
          emitPlaybackNotification(entry);
        }
      }, function(error) {
        handleError(error);
      });
    };
    
    $scope.addToPlaylist = function(entry) {
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
      if(kodiWsApiConnection) {
        $scope.$root.$emit('rkStartLoading');
        var playlistId = ($scope.type === 'music')? rkEnumsService.PlaylistId.AUDIO : rkEnumsService.PlaylistId.VIDEO;

        var playlistPromise = kodiWsApiConnection.Playlist.GetItems({
          playlistid: playlistId
        });

        playlistPromise.then(function(data) {
          var options = {
            playlistid: playlistId,
            position: (data.items)? data.items.length : 0,
            item: {}
          };

          options.item[entry.filetype] = entry.file;
          
          var promise = kodiWsApiConnection.Playlist.Insert(options);

          promise.then(function(data) {
            if(data === 'OK') {
              emitAddedToPlaylistNotification(entry);
            }
          }, function(error) {
            $scope.$root.$emit('rkStopLoading');
            handleError(error);
          });
        }, function(error) {
          $scope.$root.$emit('rkStopLoading');
          handleError(error);
        });
      }
    };
    
    $scope.filterList = function(entry) {
      return (entry.label.toLowerCase().indexOf($scope.filter.value.toLowerCase()) > -1 || entry.label === '..');
    };
    
    $scope.clearFilter = function() {
      $scope.filter.value = '';
    };

    $scope.$root.$on('rkWsConnectionStatusChange', function(event, data) {
      if(!data.connected) {
        $scope.files = [];
      }
      else {
        $scope.getSources();
      }
    });

    function emitPlaybackNotification(entry) {
      var fileName = 'of ';
      
      if(entry.filetype === 'file'){
        fileName += '"' +entry.file.substring(entry.file.lastIndexOf('/')+1, entry.file.lastIndexOf('.'))+ '"';
      }
      else if(entry.filetype === 'directory') {
        var parts = entry.file.split('/');
        fileName += 'directory "' +parts[(parts.length-2)]+ '"';
      }
      else {
        fileName = '';
      }
      
      $scope.$root.$emit('rkPlaybackStart', {
        message: 'Playback ' +fileName+ ' started'
      });
    }
    
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
    
    function handleError(error) {
      var errorDetails = (error.response.data)? ' ('+error.response.data.stack.message+': '+error.response.data.stack.name+')' : '';
      $scope.$root.$emit('rkServerError', {
        message: error.response.message+errorDetails
      });
    }

    $scope.$evalAsync(function() {
      
    });
    
    $scope.init = function() {
      rkCacheService.setCategory($scope.identifier);
      
      if($.isEmptyObject($scope.sources)) {
        $timeout(function() {
          $scope.getSources();
        });
      }
    };
  }
]);