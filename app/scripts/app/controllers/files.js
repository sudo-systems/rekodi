rekodiApp.controller('rkFilesCtrl', ['$scope', '$element', '$timeout', 'rkKodiWsApiService', 'rkTooltipsService', 'rkEnumsService', '$attrs', '$localStorage',
  function($scope, $element, $timeout, rkKodiWsApiService, rkTooltipsService, rkEnumsService, $attrs, $localStorage) {
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
      if($localStorage.cache[$scope.identifier].sources && $scope.sources.length === 0) {
        $scope.sources = JSON.parse($localStorage.cache[$scope.identifier].sources);
        sourcesPaths = JSON.parse($localStorage.cache[$scope.identifier].sourcesPaths);
      }
    }
    
    function updateSourcesCache(sources) {
      if(!$localStorage.cache[$scope.identifier].sources || $localStorage.cache[$scope.identifier].sources !== JSON.stringify(sources)) {
        processSources(sources);
        return true;
      }
      
      return false;
    }
    
    function processSources(sources) {
      $scope.sources = sources;
      $localStorage.cache[$scope.identifier].sources = JSON.stringify(sources);
      sourcesPaths = [];

      for(var key in sources) {
        sourcesPaths[key] = sources[key].file;
      }
      
      $localStorage.cache[$scope.identifier].sourcesPaths = JSON.stringify(sourcesPaths);
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

          if(!updateSourcesCache(data.sources)) {
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
    
    function getFilesFromCache(directory) {
      if($localStorage.cache[$scope.identifier].files) {
        if(!$scope.files[directory] || $scope.files[directory].length === 0) {
          var filesCacheTemp = JSON.parse($localStorage.cache[$scope.identifier].files);
          $scope.files[directory] = (filesCacheTemp[directory])? filesCacheTemp[directory] : [];
        }
        
        if($localStorage.cache[$scope.identifier].sourcesPaths && sourcesPaths.length === 0) {
          sourcesPaths = JSON.parse($localStorage.cache[$scope.identifier].sourcesPaths);
        }
      }
    }
    
    function updateFilesCache(files, directory) {
      if($localStorage.cache[$scope.identifier].files) {
        var filesCacheTemp = JSON.parse($localStorage.cache[$scope.identifier].files);
        
        if(!filesCacheTemp[directory] || JSON.stringify(filesCacheTemp[directory]) !== JSON.stringify(files)) {
          processFiles(files, directory);
          return true;
        }
      }
      else {
        processFiles(files, directory);
        return true;
      }

      return false;
    }
    
    function processFiles(files, directory) {
      $scope.sources = sources;
      $localStorage.cache[$scope.identifier].sources = JSON.stringify(sources);
      sourcesPaths = [];

      for(var key in sources) {
        sourcesPaths[key] = sources[key].file;
      }
      
      $localStorage.cache[$scope.identifier].sourcesPaths = JSON.stringify(sourcesPaths);
    }
    
    $scope.getDirectory = function(directory) {
      $scope.currentLevel = 'files';
      $scope.currentDirectory = directory;

      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
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
          $scope.clearFilter();
          data.files = (data.files === undefined)? [] : data.files;
          $scope.files = data.files;

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
      if($.isEmptyObject($scope.sources)) {
        $timeout(function() {
          $scope.getSources();
        });
      }
      
      if(!$localStorage.cache) {
        $localStorage.cache = {};
      }
      
      if(!$localStorage.cache[$scope.identifier]) {
        $localStorage.cache[$scope.identifier] = {};
      }
    };
  }
]);