rekodiApp.controller('rkVideoPlaylistCtrl', ['$scope', '$element', 'kodiApiService', 'rkTooltipsService', 'rkEnumsService', 'rkHelperService',
  function($scope, $element, kodiApiService, rkTooltipsService, rkEnumsService, rkHelperService) {
    var kodiApi = null;
    $scope.playlistId = rkEnumsService.PlaylistId.VIDEO;
    $scope.items = [];
    $scope.isInitialized = false;
    $scope.filter = {
      value: ''
    };

    $scope.get = function() {
      if(kodiApi) {
        kodiApi.Playlist.GetItems({
          playlistid: rkEnumsService.PlaylistId.VIDEO,
          properties: ['file']
        }).then(function(data) {
          $scope.items = data.items;
          rkTooltipsService.apply($($element).find('.data-list-wrapper'));
        }, function(error) {
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
          if(serverData.data.playlistid === rkEnumsService.PlaylistId.VIDEO) {
            $scope.get();
          }
        });

        kodiApi.Playlist.OnRemove(function(serverData) {
          if(serverData.data.playlistid === rkEnumsService.PlaylistId.VIDEO) {
            $scope.get();
          }
        });

        kodiApi.Playlist.OnClear(function(serverData) {
          if(serverData.data.playlistid === rkEnumsService.PlaylistId.VIDEO) {
            $scope.get();
          }
        });
      }
    }

    $scope.init = function() {
      if($scope.isInitialized) {
        return;
      }
      
      initConnectionChange();

      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        initConnectionChange();
      });

      $scope.isInitialized = true;
    };
  }
]);