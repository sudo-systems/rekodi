rekodiApp.controller('rkPlaylistCtrl', ['$scope', 'kodiApiService', 'rkEnumsService', 'rkLogService', 'rkConfigService', 'rkDialogService', 'rkRemoteControlService', 'rkHelperService',
  function($scope, kodiApiService, rkEnumsService, rkLogService, rkConfigService, rkDialogService, rkRemoteControlService, rkHelperService) {
    var kodiApi = null;
    $scope.displayLimit = 15;
    var requestPropertiesConfig = rkConfigService.get('apiRequestProperties', 'playlist');
    var requestProperties = [];
    var itemDrag = [];
    var dragPlaylistId = null;
    $scope.playlistIds = rkEnumsService.PlaylistId;
    $scope.playerIds = rkEnumsService.PlayerId;
    $scope.isFiltering = false;
    $scope.scrollItems = {};
    $scope.scrollItems[$scope.playlistIds.AUDIO] = [];
    $scope.scrollItems[$scope.playlistIds.VIDEO] = [];
    $scope.items = {};
    $scope.items[$scope.playlistIds.AUDIO] = [];
    $scope.items[$scope.playlistIds.VIDEO] = [];
    $scope.selected = [];
    $scope.status = [];
    $scope.filter = [];
    
    for(var key in $scope.playlistIds) {
      var id = $scope.playlistIds[key];
      var type = null;
      
      if(id === $scope.playlistIds.AUDIO) {
        type = 'audio';
      }
      else if(id === $scope.playlistIds.VIDEO) {
        type = 'audio';
      }
      
      requestProperties[id] = requestPropertiesConfig[type];
      $scope.scrollItems[id] = [];
      $scope.items[id] = [];
      $scope.selected[id] = {
        item: null
      };
      $scope.filter[id] = {
        value: ''
      };
      $scope.status[id] = {
        isInitialized: false,
        isLoading: false
      };
      itemDrag[id] = {
        startPosition: null,
        endPosition: null
      };
    }

    $scope.get = function(playlistId) {
      kodiApi.Playlist.GetItems({
        playlistid: playlistId,
        properties: requestProperties[playlistId]
      }).then(function(data) {
        $scope.items[playlistId] = (!data || !data.items)? [] : rkHelperService.addCustomFields(data.items);
      }, function(error) {
        rkLogService.error(error);
      });
    };
    
    $scope.showItemOptions = function(playlistId, playerId, position, item) {
      rkDialogService.showPlaylistItemOptions(playerId, position, item, playlistId);
    };
    
    $scope.startItemDrag = function(playlistId, position) {
      dragPlaylistId = playlistId;
      itemDrag[playlistId].startPosition = position;
    };

    $scope.endItemDrag = function(event, index, item) {
      itemDrag[dragPlaylistId].endPosition = index;
      return item;
    };

    $scope.placeItem = function(playlistId, position) {
      dragPlaylistId = null;
      
      if(itemDrag[playlistId].startPosition === null || itemDrag[playlistId].endPosition === null || itemDrag[playlistId].endPosition === itemDrag[playlistId].startPosition) {
        return;
      }

      $scope.scrollItems[playlistId].splice(position, 1);
      
      if(itemDrag[playlistId].startPosition > itemDrag[playlistId].endPosition) {
        for(var i=itemDrag[playlistId].startPosition; i>itemDrag[playlistId].endPosition; i--) {
          rkRemoteControlService.swapPlaylistItems(playlistId, i, (i-1));
        }
      }
      else {
        for(var i=itemDrag[playlistId].startPosition; i<itemDrag[playlistId].endPosition; i++) {
          rkRemoteControlService.swapPlaylistItems(playlistId, i, (i+1));
        }
      }
      
      itemDrag[playlistId] = {
        startPosition: null,
        endPosition: null
      };
    };

    $scope.clear = function(playlistId) {
      rkDialogService.showConfirm('Are you sure you want to clear the current playlist?', function() {
        rkRemoteControlService.clearPlaylist(playlistId);
        return true;
      });
    };

    $scope.clearFilter = function(playlistId) {
      $scope.filter[playlistId].value = '';
    };

    function initConnectionChange(playlistId) {
      if(kodiApi) {
        if($scope.items[playlistId] && $scope.items[playlistId].length === 0) {
          $scope.get(playlistId);
        }

        kodiApi.Playlist.OnAdd(function(serverData) {
          if(serverData.data.playlistid === playlistId) {
            $scope.get(playlistId);
          }
        });

        kodiApi.Playlist.OnRemove(function(serverData) {
          if(serverData.data.playlistid === playlistId) {
            $scope.get(playlistId);
          }
        });

        kodiApi.Playlist.OnClear(function(serverData) {
          if(serverData.data.playlistid === playlistId) {
            $scope.scrollItems[playlistId] = [];

            if(!$scope.$$phase){
              $scope.$apply();
            }
          }
        });
      }
    }

    $scope.init = function(playlistId) {
      kodiApi = kodiApiService.getConnection();
      initConnectionChange(playlistId);

      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        kodiApi = connection;
        
        for(var key in $scope.playlistIds) {
          initConnectionChange($scope.playlistIds[key]);
        }
      });
      
      $scope.$root.$on('rkNowPlayingDataUpdate', function(event, data) {
        for(var key in $scope.playlistIds) {
          var id = $scope.playlistIds[key];
          
          for(var index in $scope.scrollItems[id]) {
            $scope.scrollItems[id][index].is_playing = ($scope.scrollItems[id][index] && $scope.scrollItems[id][index].file === data.file);
          }
        }
      });

      $scope.status[playlistId].isInitialized = true;
    };
    
    $scope.$root.$on('rkPlaylistCtrlInit', function (event) {
      for(var key in $scope.playlistIds) {
        if(!$scope.status[$scope.playlistIds[key]].isInitialized) {
          $scope.init($scope.playlistIds[key]);
        }
      }
    });
  }
]);