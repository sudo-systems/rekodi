rekodiApp.controller('rkPlaylistCtrl', ['$scope', '$element', '$timeout', 'rkKodiWsApiService', 'rkTooltipsService', 'rkEnumsService', '$sessionStorage', 'rkHelperService',
  function($scope, $element, $timeout, rkKodiWsApiService, rkTooltipsService, rkEnumsService, $sessionStorage, rkHelperService) {
    $scope.type = '';
    $scope.playlistId = null;
    $scope.items = [];
    $scope.playStatus = null;
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
        
        kodiWsApiConnection.Playlist.GetItems({
          playlistid: $scope.playlistId,
          properties: ['file']
        }).then(function(data) {
          $scope.items = data.items;
          console.dir(data.items);
          $scope.$root.$emit('rkStopLoading');
          rkTooltipsService.apply($($element).find('.data-list-wrapper'));
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
        
        $scope.$root.$on('rkWsConnectionStatusChange', function(event, data) {
          if(!data.connected) {
            $scope.items = [];
          }
          else {
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
      
      $scope.$watchCollection(function() {
        return $sessionStorage.playStatus;
      }, function(newValue, oldValue) {
        $scope.playStatus = newValue;
      });
      
      $scope.playStatus = $sessionStorage.playStatus;
    };
  }
]);