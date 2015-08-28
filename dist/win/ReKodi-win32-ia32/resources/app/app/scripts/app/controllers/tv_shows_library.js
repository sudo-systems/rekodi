rekodiApp.controller('rkTvShowsLibraryCtrl', ['$scope', 'kodiApiService', 'rkVideoLibraryService', 'rkSettingsService', 'rkDialogService',
  function($scope, kodiApiService, rkVideoLibraryService, rkSettingsService, rkDialogService) {
    var displayLimit = 5;
    var kodiApi = null;
    $scope.tvShowsCategorised = {};
    $scope.seasons = [];
    $scope.episodes = [];
    $scope.tvShowsIndex = [];
    $scope.scrollItems = [];
    $scope.isFiltering = false;
    $scope.currentLevel = null;
    $scope.currentTvShowId = null;
    $scope.currentSeason = null;
    $scope.currentSeasonId = null;
    $scope.settings = rkSettingsService.get({category: 'tvShowsLibrary'});
    $scope.guiModels = {
      filterValue: '',
      selectedIndex: null
    };
    $scope.status = {
      isInitalized: false
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
    
    function refreshData() {
      if($scope.currentLevel === 'tvShows') {
        $scope.tvShowsCategorised = {};
        $scope.getTvShowsCategorised();
      }
      else if ($scope.currentLevel === 'seasons'){
        $scope.seasons = [];
        $scope.getSeasons($scope.currentTvShowId);
      }
      else if($scope.currentLevel === 'episodes') {
        $scope.episodes = [];
        $scope.getEpisodes($scope.currentTvShowId, $scope.currentSeason);
      }
    }

    function getDefaultIndex(tvShowsIndex) {
      for(var key in tvShowsIndex) {
        if(tvShowsIndex[key].toLowerCase() !== tvShowsIndex[key].toUpperCase()) {
          return tvShowsIndex[key];
        }
      }
      
      return null;
    }
    
    function getUnwatchedTvShows(tvShowsCategorised) {
      var newCategorisedLibrary = {};
      
      for(var key in tvShowsCategorised) {
        var indexCollection = [];
        
        for(var index in tvShowsCategorised[key]) {
          if(tvShowsCategorised[key][index].episode !== 0 && tvShowsCategorised[key][index].episode !== tvShowsCategorised[key][index].watchedepisodes) {
            indexCollection.push(tvShowsCategorised[key][index]);
          }
        }

        if(indexCollection.length > 0) {
          newCategorisedLibrary[key] = indexCollection;
        }
      }
      
      return newCategorisedLibrary;
    }
    
    $scope.getTvShowsCategorised = function() {
      $scope.currentLevel = 'tvShows';
      $scope.currentTvShowId = null;
      $scope.currentSeason = null;
      $scope.currentSeasonId = null;
      $scope.clearFilter();
      
      if(Object.keys($scope.tvShowsCategorised).length === 0) {
        $scope.tvShowsCategorised = rkVideoLibraryService.getTvShowsCategorisedFromCache();
        
        if($scope.settings.hideWatched) {
          $scope.tvShowsCategorised = getUnwatchedTvShows($scope.tvShowsCategorised);
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
        if(tvShowsCategorised && $scope.settings.hideWatched) {
          tvShowsCategorised = getUnwatchedTvShows(tvShowsCategorised);
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
    
    function getUnwatchedSeasons(seasons) {
      var newSeasons = [];
      
      for(var index in seasons) {
        if(seasons[index].episode !== 0 && seasons[index].episode !== seasons[index].watchedepisodes) {
          newSeasons.push(seasons[index]);
        }
      }

      return newSeasons;
    }

    $scope.getSeasons = function(tvShowId) {
      $scope.currentLevel = 'seasons';
      $scope.currentTvShowId = tvShowId;
      $scope.currentSeason = null;
      $scope.currentSeasonId = null;
      $scope.clearFilter();
      
      if(!$scope.seasons[tvShowId]) {
        $scope.seasons[tvShowId] = [];
      }
      
      if($scope.seasons[tvShowId].length === 0) {
        $scope.seasons[tvShowId] = rkVideoLibraryService.getSeasonsFromCache(tvShowId);
        
        if($scope.settings.hideWatched) {
          $scope.seasons[tvShowId] = getUnwatchedSeasons($scope.seasons[tvShowId]);
        }
      }
      
      if($scope.seasons[tvShowId].length === 1) {
        $scope.getEpisodes(tvShowId, $scope.seasons[tvShowId][0].season);
        return;
      }
      
      $scope.showItems({
        key: $scope.currentLevel,
        reset: true,
        data: $scope.seasons[tvShowId]
      });

      rkVideoLibraryService.getSeasons(tvShowId, function(seasons) {
        if(seasons && $scope.settings.hideWatched) {
          seasons = getUnwatchedSeasons(seasons);
        }

        if(seasons && !angular.equals(seasons, $scope.seasons[tvShowId])) {
          $scope.seasons[tvShowId] = seasons;

          if(seasons.length !== 1) {
            $scope.showItems({
              key: $scope.currentLevel,
              reset: true,
              data: $scope.seasons[tvShowId]
            });
          }
          
          if($scope.seasons[tvShowId].length === 1) {
            $scope.getEpisodes(tvShowId, $scope.seasons[tvShowId][0].season);
          }
        }
      });
    };
    
    function getUnwatchedEpisodes(episodes) {
      var newEpisodes = [];

      for(var index in episodes) {
        if(!episodes[index].is_watched) {
          newEpisodes.push(episodes[index]);
        }
      }

      return newEpisodes;
    }
    
    $scope.getEpisodes = function(tvShowId, season) {
      $scope.currentLevel = 'episodes';
      $scope.currentSeason = season;
      $scope.currentSeasonId = tvShowId+'_'+season;
      $scope.clearFilter();
      
      if(!$scope.episodes[$scope.currentSeasonId]) {
        $scope.episodes[$scope.currentSeasonId] = [];
      }
      
      if($scope.episodes[$scope.currentSeasonId].length === 0) {
        $scope.episodes[$scope.currentSeasonId] = rkVideoLibraryService.getEpisodesFromCache(tvShowId, season);
        
        if($scope.settings.hideWatched) {
          $scope.episodes[$scope.currentSeasonId] = getUnwatchedEpisodes($scope.episodes[$scope.currentSeasonId]);
        }
      }
      
      $scope.showItems({
        key: $scope.currentLevel,
        reset: true,
        data: $scope.episodes[$scope.currentSeasonId]
      });

      rkVideoLibraryService.getEpisodes(tvShowId, season, function(episodes) {
        if(episodes && $scope.settings.hideWatched) {
          episodes = getUnwatchedEpisodes(episodes);
        }
        
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
    
    $scope.showEpisodeOptionsDialog = function(episode) {
      rkDialogService.showEpisodeOptions(episode, function(markWatchedSuccess) {
        if(markWatchedSuccess) {
          $scope.getEpisodes($scope.currentTvShowId, $scope.currentSeason);
        }
      });
    };
    
    $scope.applyFilter = function(filterValue) {
      if(filterValue.length < 2) {
        $scope.clearFilter(false);
        return;
      }
      
      $scope.isFiltering = true;
      $scope.filteredItems = [];
      var items = [];

      if($scope.currentLevel === 'tvShows') {
        items = rkVideoLibraryService.getTvShowsFromCache();
      }
      else if($scope.currentLevel === 'seasons') {
        items = ($scope.currentTvShowId !== null)? $scope.seasons[$scope.currentTvShowId] : [];
      }
      else if($scope.currentLevel === 'episodes') {
        items = ($scope.currentSeasonId !== null)? $scope.episodes[$scope.currentSeasonId] : [];
      }

      for(var key in items) {
        if(items[key].label && items[key].label.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1) {
          $scope.filteredItems.push(items[key]);
        }
      }

      $scope.showItems({
        key: $scope.currentLevel,
        reset: true,
        data: $scope.filteredItems
      });
    };
    
    $scope.clearFilter = function(clearValue) {
      $scope.isFiltering = false;
      $scope.filteredItems = [];
      clearValue = (clearValue === undefined)? true : clearValue;
      
      if(clearValue) {
        $scope.guiModels.filterValue = '';
      }
 
      if($scope.currentLevel === 'seasons') {        
        $scope.showItems({
          key: $scope.currentLevel,
          reset: true,
          data: $scope.seasons[$scope.currentTvShowId]
        });
      }
      else if($scope.currentLevel === 'episodes') {
        $scope.showItems({
          key: $scope.currentLevel,
          reset: true,
          data: $scope.episodes[$scope.currentSeasonId]
        });
      }
      else if($scope.currentLevel === 'tvShows') {
        $scope.showItems({
          key: $scope.currentLevel,
          reset: true,
          data: $scope.tvShowsCategorised[$scope.guiModels.selectedIndex]
        });
      }
    };

    function initConnectionChange() {
      if(kodiApi) {
        $scope.getTvShowsCategorised();
      }
      else {
        $scope.scrollItems = [];
      }
    }

    $scope.init = function() {
      kodiApi = kodiApiService.getConnection();
      initConnectionChange();

      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        kodiApi = connection;
        initConnectionChange();
      });

      $scope.$watchCollection('settings', function(newData, oldData) {
        for(var key in newData) {
          rkSettingsService.set({
            category: 'tvShowsLibrary',
            key: key,
            value: newData[key]
          });
        }
        
        if(newData.hideWatched !== oldData.hideWatched) {
          refreshData();
        }
      });

      $scope.status.isInitialized = true;
    };
    
    $scope.$root.$on('rkTvShowsLibraryCtrlInit', function (event) {
      if($scope.status.isInitialized) {
        return;
      }

      $scope.init();
    });
  }
]);