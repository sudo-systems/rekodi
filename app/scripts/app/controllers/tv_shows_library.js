rekodiApp.controller('rkTvShowsLibraryCtrl', ['$scope', '$element', 'kodiApiService', 'rkTooltipsService', 'rkRemoteControlService', 'rkVideoLibraryService', 'rkSettingsService',
  function($scope, $element, kodiApiService, rkTooltipsService, rkRemoteControlService, rkVideoLibraryService, rkSettingsService) {
    var modal = {};
    var displayLimit = 3;
    var kodiApi = null;
    $scope.tvShowsCategorised = {};
    $scope.seasons = [];
    $scope.episodes = [];
    $scope.tvShowsIndex = [];
    $scope.scrollItems = [];
    $scope.isFiltering = false;
    $scope.isInitialized = false;
    $scope.currentLevel = null;
    $scope.currentTvShowId = null;
    $scope.currentSeasonId = null;
    $scope.settings = rkSettingsService.get({category: 'tvShowsLibrary'});
    $scope.resumeTvShow = {};
    $scope.guiModels = {
      filterValue: '',
      selectedIndex: null
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

    function getDefaultIndex(tvShowsIndex) {
      for(var key in tvShowsIndex) {
        if(tvShowsIndex[key].toLowerCase() !== tvShowsIndex[key].toUpperCase()) {
          return tvShowsIndex[key];
        }
      }
      
      return null;
    }
    
    function removeWatchedSTvShows(tvShowsCategorised) {
      tvShowsCategorised = (!tvShowsCategorised)? {} : tvShowsCategorised;
      
      for(var key in tvShowsCategorised) {
        for(var index in tvShowsCategorised[key]) {
          if(!tvShowsCategorised[key][index].episode || tvShowsCategorised[key][index].watchedepisodes === tvShowsCategorised[key][index].episode) {
            tvShowsCategorised[key].splice(index, 1);
          }
        }

        if(tvShowsCategorised[key].length === 0) {
          delete tvShowsCategorised[key];
        }
      }
      
      return tvShowsCategorised;
    }
    
    $scope.getTvShowsCategorised = function() {
      $scope.currentLevel = 'tvShows';
      $scope.currentTvShowId = null;
      $scope.currentSeasonId = null;
      $scope.clearFilter();
      
      if(Object.keys($scope.tvShowsCategorised).length === 0) {
        $scope.tvShowsCategorised = rkVideoLibraryService.getTvShowsCategorisedFromCache();
        
        if($scope.settings.hideWatched) {
          $scope.tvShowsCategorised = removeWatchedSTvShows($scope.tvShowsCategorised);
        }

        $scope.tvShowsIndex = Object.keys($scope.tvShowsCategorised);
        $scope.guiModels.selectedIndex = getDefaultIndex($scope.tvShowsIndex);
      }
      
      $scope.showItems({
        key: $scope.currentLevel,
        reset: true,
        data: $scope.tvShowsCategorised[$scope.guiModels.selectedIndex]
      });

      rkVideoLibraryService.getTvShowsCategorised(function(tvShowsCategorised) {
        if($scope.settings.hideWatched) {
          tvShowsCategorised = removeWatchedSTvShows(tvShowsCategorised);
        }

        if(tvShowsCategorised && !angular.equals(tvShowsCategorised, $scope.tvShowsCategorised)) {
          $scope.tvShowsCategorised = tvShowsCategorised;
          $scope.tvShowsIndex = Object.keys(tvShowsCategorised);
          $scope.guiModels.selectedIndex = getDefaultIndex($scope.tvShowsIndex);

          $scope.showItems({
            key: $scope.currentLevel,
            reset: true,
            data: tvShowsCategorised[$scope.guiModels.selectedIndex]
          });
        }
      });
    };

    $scope.getSeasons = function(tvShowId) {
      $scope.currentLevel = 'seasons';
      $scope.currentTvShowId = tvShowId;
      $scope.currentSeasonId = null;
      $scope.clearFilter();
      
      if(!$scope.seasons[tvShowId]) {
        $scope.seasons[tvShowId] = [];
      }
      
      if($scope.seasons[tvShowId].length === 0) {
        $scope.seasons[tvShowId] = rkVideoLibraryService.getSeasonsFromCache(tvShowId);
      }
      
      $scope.showItems({
        key: $scope.currentLevel,
        reset: true,
        data: $scope.seasons[tvShowId]
      });

      rkVideoLibraryService.getSeasons(tvShowId, function(seasons) {
        if(seasons && !angular.equals(seasons, $scope.seasons[tvShowId])) {
          $scope.seasons[tvShowId] = seasons;

          if(seasons.length !== 1) {
            $scope.showItems({
              key: $scope.currentLevel,
              reset: true,
              data: $scope.seasons[tvShowId]
            });
          }
        }
        
        if($scope.seasons[tvShowId].length === 1) {
          $scope.getEpisodes(tvShowId, $scope.seasons[tvShowId][0].season);
        }
      });
    };
    
    $scope.getEpisodes = function(tvShowId, season) {
      $scope.currentLevel = 'episodes';
      $scope.currentSeasonId = tvShowId+'_'+season;
      $scope.clearFilter();
      
      if(!$scope.episodes[$scope.currentSeasonId]) {
        $scope.episodes[$scope.currentSeasonId] = [];
      }
      
      if($scope.episodes[$scope.currentSeasonId].length === 0) {
        $scope.episodes[$scope.currentSeasonId] = rkVideoLibraryService.getEpisodesFromCache(tvShowId, season);
      }
      
      $scope.showItems({
        key: $scope.currentLevel,
        reset: true,
        data: $scope.episodes[$scope.currentSeasonId]
      });

      rkVideoLibraryService.getEpisodes(tvShowId, season, function(episodes) {
        if(episodes && !angular.equals(episodes, $scope.episodes[$scope.currentSeasonId])) {
          $scope.episodes[$scope.currentSeasonId] = episodes;
          
          $scope.showItems({
            key: $scope.currentLevel,
            reset: true,
            data: $scope.episodes[$scope.currentSeasonId]
          });
        }
      });
    };
    
    $scope.applyFilter = function(filterValue) {
      if(filterValue.length < 2) {
        $scope.isFiltering = false;
        $scope.showItems({
          reset: true,
          data: $scope.tvShowsCategorised[$scope.guiModels.selectedIndex]
        });
        
        return;
      }

      $scope.isFiltering = true;
      $scope.filteredItems = [];
      var items = rkVideoLibraryService.getTvShowsFromCache();

      for(var key in items) {
        if(items[key].label && items[key].label.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1) {
          $scope.filteredItems.push(items[key]);
        }
      }
      
      $scope.showItems({
        reset: true,
        data: $scope.filteredItems
      });
    };
    
    $scope.clearFilter = function() {
      $scope.isFiltering = false;
      $scope.filteredItems = [];
      $scope.guiModels.filterValue = '';
      
      $scope.showItems({
        index: $scope.guiModels.selectedIndex,
        reset: true,
        data: $scope.tvShowsCategorised[$scope.guiModels.selectedIndex]
      });
    };

    $scope.handlePlay = function(tvShow) {
      if(tvShow.resume.position > 0) {
        $scope.resumeTvShow = tvShow;
        modal.resumeTvShow = $('[data-remodal-id=resumeTvShowModal]').remodal();
        modal.resumeTvShow.open();
      }
      else {
        $scope.play(tvShow, false);
      }
    };
    
    $scope.play = function(tvShow, resume) {
      if(modal.resumeTvShow) {
        modal.resumeTvShow.close();
      }
      
      resume = (resume)? true : false;
      var options = {
        item: {
          tvShowid: tvShow.tvShowid
        },
        options: {
          resume: resume
        }
      };

      rkRemoteControlService.play(options);
    };
    
    function initConnectionChange() {
      kodiApi = kodiApiService.getConnection();

      if(kodiApi && Object.keys($scope.tvShowsCategorised).length === 0) {
        $scope.getTvShowsCategorised();
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

      $(document).on('closed', '[data-remodal-id=resumeTvShowModal]', function(e) {
        $scope.resumeTvShow = {};
        modal.resumeTvShow = null;
      });
      
      $scope.$watchCollection('settings', function(newData, oldData) {
        for(var key in newData) {
          rkSettingsService.set({
            category: 'tvShowsLibrary',
            key: key,
            value: newData[key]
          });
        }
      });

      $scope.isInitialized = true;
    };
  }
]);