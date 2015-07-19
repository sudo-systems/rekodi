rekodiApp.controller('rkFilesCtrl', ['$scope', '$element', '$timeout', 'rkKodiWsApiService', 'rkTooltipsService',
  function($scope, $element, $timeout, rkKodiWsApiService, rkTooltipsService) {
    $scope.files = {};
    $scope.type = '';
    $scope.filter = {
      value: ''
    };
    var sourcePaths = [];
    var kodiWsApiConnection = null;

    $scope.getSources = function() {
      $scope.$root.$emit('rkStartLoading');
   
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
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
      });
    };
    
    $scope.getDirectory = function(directory) {
      $scope.clearFilter();

      if(directory === 'LOAD_SOURCES') {
        $scope.getSources();
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
        media: $scope.type,
        sort: {
            order: 'ascending',
            method: 'label'
          }
      });

      promise.then(function(data) {
        data.files = (data.files === undefined)? [] : data.files;
        $scope.files = data.files;
        
        $scope.files.unshift({
          label: '..',
          filetype: 'directory',
          file: directoryUp
        });
        
        $scope.$apply();
        $scope.$root.$emit('rkStopLoading');
        rkTooltipsService.apply($($element).find('.data-list-wrapper'));
      }, function(error) {
        $scope.$root.$emit('rkStopLoading');
      });
    };
    
    $scope.play = function(entry, type) {
      var options = {
        item: {}
      };
      
      options.item[type] = entry;

      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      var promise = kodiWsApiConnection.Player.Open(options);
      
      
      promise.then(function(data) {
        if(data === 'OK') {
          emitPlaybackNotification(entry, type);
        }
      }, function(error){
        console.log(error);
      });
    };
    
    $scope.filterList = function(entry) {
      return (entry.label.toLowerCase().indexOf($scope.filter.value.toLowerCase()) > -1 || entry.label === '..');
    };
    
    $scope.clearFilter = function() {
      $scope.filter.value = '';
    };

    $scope.$root.$on('rkWsConnectionStatusChange', function(event, data) {
      if(!data.connected) {
        $scope.files = {};
      }
    });
    
    function emitPlaybackNotification(entry, type) {
      var fileName = 'of ';
      
      if(type === 'file'){
        fileName += '"' +entry.substring(entry.lastIndexOf('/')+1, entry.lastIndexOf('.'))+ '"';
      }
      else if(type === 'directory') {
        var parts = entry.split('/');
        fileName += 'directory "' +parts[(parts.length-2)]+ '"';
      }
      else {
        fileName = '';
      }
      
      $scope.$root.$emit('rkPlaybackStart', {
        message: 'Playback ' +fileName+ ' started'
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