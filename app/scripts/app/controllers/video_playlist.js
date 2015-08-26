rekodiApp.controller('rkVideoPlaylistCtrl', ['$scope', '$element', 'kodiApiService', 'rkTooltipsService', 'rkEnumsService', 'rkLogService',
  function($scope, $element, kodiApiService, rkTooltipsService, rkEnumsService, rkLogService) {
    var kodiApi = null;
    var displayLimit = 15;
    $scope.playlistId = rkEnumsService.PlaylistId.VIDEO;
    $scope.items = [];
    $scope.scrollItems = [];
    $scope.status = {
      isInitialized: false,
      isLoading: false
    };
    $scope.filter = {
      value: ''
    };
    
    $scope.showItems = function(options) {
      var _scrollItemsCount = 0;
      var _options = angular.extend({}, {
        key: null,
        reset: false, //optional
        data: null //required
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
          if(_options.key) {
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

    $scope.get = function() {
      if(kodiApi) {
        $scope.status.isLoading = true;
        
        kodiApi.Playlist.GetItems({
          playlistid: rkEnumsService.PlaylistId.VIDEO,
          properties: ['file']
        }).then(function(data) {
          $scope.items = data.items;
          
          $scope.showItems({
            reset: true,
            data: $scope.items
          });
          
          $scope.status.isLoading = false;
        }, function(error) {
          $scope.status.isLoading = false;
          rkLogService.error(error);
        });
        
        return;
      }
      
      $scope.items = [];
      $scope.showItems({
        reset: true,
        data: $scope.items
      });
    };
    
    $scope.filterList = function(entry) {
      return (entry.label.toLowerCase().indexOf($scope.filter.value.toLowerCase()) > -1 || entry.label === '..');
    };
    
    $scope.clearFilter = function() {
      $scope.filter.value = '';
      $scope.showItems({
        reset: true,
        data: $scope.items
      });
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
      if($scope.status.isInitialized) {
        return;
      }
      
      initConnectionChange();

      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        initConnectionChange();
      });

      $scope.status.isInitialized = true;
    };
  }
]);