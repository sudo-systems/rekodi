rekodiApp.controller('rkPlaylistCtrl', ['$scope', 'kodiApiService', 'rkEnumsService', 'rkLogService', 'rkConfigService', 'rkNowPlayingService', 'rkDialogService', 'rkRemoteControlService', 'rkHelperService',
  function($scope, kodiApiService, rkEnumsService, rkLogService, rkConfigService, rkNowPlayingService, rkDialogService, rkRemoteControlService, rkHelperService) {
    var kodiApi = null;
    var displayLimit = 15;
    var requestPropertiesConfig = rkConfigService.get('apiRequestProperties', 'playlist');
    var requestProperties = [];
    var itemDrag = [];
    var dragPlaylistId = null;
    $scope.playlistIds = rkEnumsService.PlaylistId;
    $scope.playerIds = rkEnumsService.PlayerId;
    $scope.isFiltering = false;
    $scope.scrollItems = [];
    $scope.items = [];
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
    
    $scope.showItems = function(options) {
      var _scrollItemsCount = 0;
      var nowPlayingFilePath = rkNowPlayingService.getNowPlayingFilePath();
      var _options = angular.extend({}, {
        key: null,
        reset: false,
        data: null
      }, options);
      
      if($scope.isFiltering && !_options.reset) {
        _options.data = $scope.filteredItems;
      }

      if(_options.key !== null) {
        if(!$scope.scrollItems[_options.key] || _options.reset) {
          $scope.scrollItems[_options.key] = [];
        }
        
        _scrollItemsCount = $scope.scrollItems[_options.key].length;
      }
      else {
        if(_options.reset) {
          $scope.scrollItems = [];
        }
        
        _scrollItemsCount = $scope.scrollItems.length;
      }

      if(!_options.data || !_options.data[_scrollItemsCount]) {
        return;
      }
      
      for(var x = 0; x < displayLimit; x++) {
        var nextIndex = ((_scrollItemsCount)+x);

        if(_options.data[nextIndex]) {
          _options.data[nextIndex].is_playing = (_options.data[nextIndex].file === nowPlayingFilePath);

          if(_options.key !== null) {
            $scope.scrollItems[_options.key].push(_options.data[nextIndex]);
          }
          else {
            $scope.scrollItems.push(_options.data[nextIndex]);
          }
        }
      }

      if(!$scope.$$phase){
        $scope.$apply();
      }
    };

    $scope.get = function(playlistId) {
      if(kodiApi) {
        $scope.status[playlistId].isLoading = true;

        kodiApi.Playlist.GetItems({
          playlistid: playlistId,
          properties: requestProperties[playlistId]
        }).then(function(data) {
          $scope.items[playlistId] = (!data.items)? [] : rkHelperService.addCustomFields(data.items);

          $scope.showItems({
            key: playlistId,
            reset: true,
            data: $scope.items[playlistId]
          });
          
          $scope.status[playlistId].isLoading = false;
        }, function(error) {
          $scope.status[playlistId].isLoading = false;
          rkLogService.error(error);
        });
        
        return;
      }
      
      $scope.items[playlistId] = [];
      $scope.showItems({
        key: playlistId,
        reset: true,
        data: $scope.items[playlistId]
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
      $scope.showItems({
        key: playlistId,
        reset: true,
        data: $scope.items[playlistId]
      });
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
      else {
        $scope.scrollItems[playlistId] = [];

        if(!$scope.$$phase){
          $scope.$apply();
        }
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