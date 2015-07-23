rekodiApp.controller('rkPlaylistCtrl', ['$scope', '$element', '$timeout', 'rkKodiWsApiService', 'rkTooltipsService', 'rkEnumsService',
  function($scope, $element, $timeout, rkKodiWsApiService, rkTooltipsService, rkEnumsService) {
    $scope.type = '';
    $scope.playlistId = null;
    $scope.items = [];
    $scope.filter = {
      value: ''
    };
    var kodiWsApiConnection = null;
    
    $scope.$watch('type', function() {
      if($scope.type === 'audio') {
        $scope.playlistId = rkEnumsService.PlaylistId.AUDIO;
      }
      
      if($scope.type === 'video') {
        $scope.playlistId = rkEnumsService.PlaylistId.VIDEO;
      }
    });
    
    $scope.get = function() {
      kodiWsApiConnection = rkKodiWsApiService.getConnection();

      if(kodiWsApiConnection) {
        $scope.$root.$emit('rkStartLoading');
        
        var promise = kodiWsApiConnection.Playlist.GetItems({
          playlistid: $scope.playlistId
        });

        promise.then(function(data) {
          $scope.items = data.items;
          $scope.$apply();
          $scope.$root.$emit('rkStopLoading');
          rkTooltipsService.apply($($element).find('.data-list-wrapper'));
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
    
    function handleError(error) {
      $scope.$root.$emit('rkServerError', {
        message: error.response.message+' ('+error.response.data.stack.message+': '+error.response.data.stack.name+')'
      });
    }
    
    function bindEvents() {
      kodiWsApiConnection = rkKodiWsApiService.getConnection();

      if(kodiWsApiConnection) {
        kodiWsApiConnection.Playlist.OnAdd(function(serverData) {
          if(serverData.data.playlistid === $scope.playlistId) {
            $scope.get();
          }
        });
        
        kodiWsApiConnection.Playlist.OnRemove(function(serverData) {
          if(serverData.data.playlistid === $scope.playlistId) {
            $scope.get();
          }
        });
        
        kodiWsApiConnection.Playlist.OnClear(function(serverData) {
          if(serverData.data.playlistid === $scope.playlistId) {
            $scope.get();
          }
        });
      }
    }
    
    $scope.init = function() {
      $timeout(function() {
        if($.isEmptyObject($scope.items)) {
          $scope.get();
        };
        
        bindEvents();
      });
    };
    
    $scope.$root.$on('rkWsConnectionStatusChange', function(event, data) {
      if(!data.connected) {
        $scope.items = [];
      }
      else {
        $scope.get();
      }
    });
  }
]);