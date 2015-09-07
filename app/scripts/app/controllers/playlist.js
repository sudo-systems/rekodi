rekodiApp.controller('rkPlaylistCtrl', ['$scope', 'kodiApiService', 'rkEnumsService', 'rkLogService', 'rkConfigService', 'rkDialogService', 'rkRemoteControlService', 'rkHelperService', '$timeout',
  function($scope, kodiApiService, rkEnumsService, rkLogService, rkConfigService, rkDialogService, rkRemoteControlService, rkHelperService, $timeout) {
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
        
        if(!$scope.$$phase){
          $scope.$apply();
        }
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

    var init = function(playlistId) {
      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        kodiApi = connection;
        
        if(kodiApi) {
          for(var key in $scope.playlistIds) {
            if($scope.items[key] && $scope.items[key].length === 0) {
              $scope.get(key);
            }

            kodiApi.Playlist.OnAdd(function(serverData) {
              if(serverData.data.playlistid === key) {
                $scope.get(key);
              }
            });

            kodiApi.Playlist.OnRemove(function(serverData) {
              if(serverData.data.playlistid === key) {
                $scope.get(key);
              }
            });

            kodiApi.Playlist.OnClear(function(serverData) {
              if(serverData.data.playlistid === key) {
                $scope.scrollItems[key] = [];

                if(!$scope.$$phase){
                  $scope.$apply();
                }
              }
            });
          }
        }
      });
      
      $scope.$root.$on('rkNowPlayingDataUpdate', function(event, data) {
        if(data === null) {
          return;
        }
        
        for(var key in $scope.playlistIds) {
          var id = $scope.playlistIds[key];
          
          for(var index in $scope.scrollItems[id]) {
            $scope.scrollItems[id][index].is_playing = ($scope.scrollItems[id][index].file === data.file);
          }
        }
      });
    };

    $scope.$evalAsync(function() {
      $timeout(function() {
        for(var key in $scope.playlistIds) {
          init($scope.playlistIds[key]);
        }
      });
    });
  }
]);