rekodiApp.controller('rkPlaylistCtrl', ['$scope', '$element', 'kodiApiService', 'rkTooltipsService', 'rkEnumsService', '$sessionStorage', 'rkHelperService',
  function($scope, $element, kodiApiService, rkTooltipsService, rkEnumsService, $sessionStorage, rkHelperService) {
    var kodiApi = null;
    $scope.type = '';
    $scope.playlistId = null;
    $scope.items = [];
    $scope.playStatus = null;
    $scope.isInitialized = false;
    $scope.filter = {
      value: ''
    };
    
    $scope.$watch('type', function() {
      if($scope.type === 'audio') {
        $scope.playlistId = rkEnumsService.PlaylistId.AUDIO;
      }
      
      if($scope.type === 'video') {
        $scope.playlistId = rkEnumsService.PlaylistId.VIDEO;
      }
    });
    
    $scope.get = function() {
      if(kodiApi) {
        $scope.$root.$emit('rkStartLoading');
        
        kodiApi.Playlist.GetItems({
          playlistid: $scope.playlistId,
          properties: ['file']
        }).then(function(data) {
          $scope.items = data.items;
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
    
    function initConnectionChange() {
      kodiApi = kodiApiService.getConnection();

      if(kodiApi) {
        if($scope.items.length === 0) {
          $scope.get();
        }

        kodiApi.Playlist.OnAdd(function(serverData) {
          if(serverData.data.playlistid === $scope.playlistId) {
            $scope.get();
          }
        });

        kodiApi.Playlist.OnRemove(function(serverData) {
          if(serverData.data.playlistid === $scope.playlistId) {
            $scope.get();
          }
        });

        kodiApi.Playlist.OnClear(function(serverData) {
          if(serverData.data.playlistid === $scope.playlistId) {
            $scope.get();
          }
        });
      }
    }

    $scope.init = function() {
      if(!$scope.isInitialized) {
        initConnectionChange();

        $scope.$root.$on('rkWsConnectionStatusChange', function (event, data) {
          initConnectionChange();
        });

        $scope.$watchCollection(function() {
          return $sessionStorage.playStatus;
        }, function(newValue, oldValue) {
          $scope.playStatus = newValue;
        });

        $scope.playStatus = $sessionStorage.playStatus;
        $scope.isInitialized = true;
      }
    };
  }
]);