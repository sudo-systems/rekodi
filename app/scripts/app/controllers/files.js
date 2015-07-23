rekodiApp.controller('rkFilesCtrl', ['$scope', '$element', '$timeout', 'rkKodiWsApiService', 'rkTooltipsService', 'rkEnumsService',
  function($scope, $element, $timeout, rkKodiWsApiService, rkTooltipsService, rkEnumsService) {
    $scope.files = [];
    $scope.type = '';
    $scope.filter = {
      value: ''
    };
    var sourcePaths = [];
    var kodiWsApiConnection = null;

    $scope.getSources = function() {
      kodiWsApiConnection = rkKodiWsApiService.getConnection();

      if(kodiWsApiConnection) {
        $scope.$root.$emit('rkStartLoading');
        
        var promise = kodiWsApiConnection.Files.GetSources({
          media: $scope.type,
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

          $scope.files = data.sources;
          $scope.$apply();
          $scope.$root.$emit('rkStopLoading');
          rkTooltipsService.apply($($element).find('.data-list-wrapper'));
        }, function(error) {
          $scope.$root.$emit('rkStopLoading');
          handleError(error);
        });
      }
    };
    
    $scope.getDirectory = function(directory) {
      if(directory === 'LOAD_SOURCES') {
        $scope.getSources();
        return;
      }

      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
      if(kodiWsApiConnection) {
        $scope.$root.$emit('rkStartLoading');
        var directoryUp = directory.split('/').slice(0, -2).join('/')+'/';
        var fields = [];

        for(var key in sourcePaths) {
          if(sourcePaths[key].indexOf(directoryUp) > -1 && directoryUp.length < sourcePaths[key].length) {
            directoryUp = 'LOAD_SOURCES';
          }
        }

        if($scope.type === 'video') {
          fields = ['plotoutline'];
        }
        
        var promise = kodiWsApiConnection.Files.GetDirectory({
          directory: directory,
          media: $scope.type,
          properties: fields,
          sort: {
            order: 'ascending',
            method: 'label'
          }
        });

        promise.then(function(data) {
          $scope.clearFilter();
          data.files = (data.files === undefined)? [] : data.files;
          $scope.files = data.files;
          var dirUp = {
            label: '..',
            filetype: 'directory',
            file: directoryUp
          };

          $scope.files.unshift(dirUp);

          $scope.$apply();
          $scope.$root.$emit('rkStopLoading');
          rkTooltipsService.apply($($element).find('.data-list-wrapper'));
        }, function(error) {
          $scope.$root.$emit('rkStopLoading');
          handleError(error);
        });
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
      $scope.$root.$emit('rkServerError', {
        message: error.response.message+' ('+error.response.data.stack.message+': '+error.response.data.stack.name+')'
      });
    }

    $scope.$evalAsync(function() {
      
    });
    
    $scope.init = function() {
      if($.isEmptyObject($scope.files)) {
        $timeout(function() {
          $scope.getSources();
        });
      }
    };
  }
]);