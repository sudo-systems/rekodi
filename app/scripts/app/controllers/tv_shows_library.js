rekodiApp.controller('rkTvShowsLibraryCtrl', ['$scope', 'kodiApiService', 'rkVideoLibraryService', 'rkSettingsService', 'rkDialogService', 'rkNotificationService',
  function($scope, kodiApiService, rkVideoLibraryService, rkSettingsService, rkDialogService, rkNotificationService) {
    $scope.displayLimit = 5;
    var kodiApi = null;
    $scope.tvShowsCategorised = {};
    $scope.seasons = [];
    $scope.episodes = [];
    $scope.tvShowsIndex = [];
    $scope.scrollItems = {
      tvShows: [],
      seasons: [],
      episodes: []
    };
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

    function refreshData() {
      if($scope.currentLevel === 'tvShows') {
        $scope.getTvShowsCategorised();
      }
      else if ($scope.currentLevel === 'seasons'){
        $scope.getSeasons($scope.currentTvShowId);
      }
      else if($scope.currentLevel === 'episodes') {
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
      $scope.tvShowsCategorised = {};
      $scope.tvShowsCategorised = rkVideoLibraryService.getTvShowsCategorisedFromCache();
      $scope.clearFilter();

      if($scope.tvShowsCategorised.length > 0) {
        if($scope.settings.hideWatched) {
          $scope.tvShowsCategorised = getUnwatchedTvShows($scope.tvShowsCategorised);
        }

        $scope.tvShowsIndex = Object.keys($scope.tvShowsCategorised);
        $scope.guiModels.selectedIndex = getDefaultIndex($scope.tvShowsIndex);
      }

      rkVideoLibraryService.getTvShowsCategorised(function(tvShowsCategorised) {
        if(tvShowsCategorised === null) {
          return;
        }

        if(Object.keys(tvShowsCategorised).length > 0) {
          if($scope.settings.hideWatched) {
            tvShowsCategorised = getUnwatchedTvShows(tvShowsCategorised);
          }

          if(!angular.equals(tvShowsCategorised, $scope.tvShowsCategorised)) {
            $scope.tvShowsCategorised = tvShowsCategorised;
            $scope.tvShowsIndex = Object.keys($scope.tvShowsCategorised);
            $scope.guiModels.selectedIndex = getDefaultIndex($scope.tvShowsIndex);
          }
        }
        else {
          $scope.tvShowsCategorised = {};
          rkNotificationService.notifyRemoteSystem('No TV Shows found');
        }
        
        if(!$scope.$$phase){
          $scope.$apply();
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
      $scope.seasons = [];
      $scope.seasons = rkVideoLibraryService.getSeasonsFromCache(tvShowId);
        
      if($scope.seasons.length > 0 && $scope.settings.hideWatched) {
        $scope.seasons = getUnwatchedSeasons($scope.seasons);
      }

      rkVideoLibraryService.getSeasons(tvShowId, function(seasons) {
        if(seasons === null) {
          return;
        }
        
        if(seasons.length > 0) {
          if($scope.settings.hideWatched) {
            seasons = getUnwatchedSeasons(seasons);
            
            if(!angular.equals(seasons, $scope.seasons)) {
              $scope.seasons = seasons;
            }
            
            if($scope.seasons === 0) {
              rkNotificationService.notifyRemoteSystem('No unwachtched seasons found for this TV Show');
              $scope.getTvShowsCategorised();
              return;
            }
          }
          
          if(!angular.equals(seasons, $scope.seasons)) {
            $scope.seasons = seasons;
          }
          
          if($scope.seasons === 1) {
            $scope.getEpisodes(tvShowId, $scope.seasons[0].season);
          }
        }
        else {
          $scope.seasons = [];
          rkNotificationService.notifyRemoteSystem('No seasons found for this TV Show');
          $scope.getTvShowsCategorised();
        }
        
        if(!$scope.$$phase){
          $scope.$apply();
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
      $scope.episodes = [];
      $scope.episodes = rkVideoLibraryService.getEpisodesFromCache(tvShowId, season);
      $scope.clearFilter();
        
      if($scope.episodes.length > 0 && $scope.settings.hideWatched) {
        $scope.episodes = getUnwatchedEpisodes($scope.episodes);
      }

      rkVideoLibraryService.getEpisodes(tvShowId, season, function(episodes) {
        if(episodes === null) {
          return;
        }
        
        if(episodes.length > 0) {
          if($scope.settings.hideWatched) {
            episodes = getUnwatchedEpisodes(episodes);
            
            if(episodes && !angular.equals(episodes, $scope.episodes)) {
              $scope.episodes = episodes;
            }
            
            if($scope.episodes === 0) {
              rkNotificationService.notifyRemoteSystem('No unwachtched episodes found for this TV Show');
              
              if($scope.seasons === 1) {
                $scope.getTvShowsCategorised();
              }
              else {
                $scope.getSeasons($scope.currentTvShowId);
              }
              
              return;
            }
          }
          
          if(episodes && !angular.equals(episodes, $scope.episodes)) {
            $scope.episodes = episodes;
          }
        }
        else {
          $scope.episodes = [];
          rkNotificationService.notifyRemoteSystem('No episodes found for this TV Show');
          $scope.getSeasons($scope.currentTvShowId);
        }
        
        if(!$scope.$$phase){
          $scope.$apply();
        }
      });
    };
    
    $scope.updateLibrary = function() {
      rkVideoLibraryService.scan();
    };
    
    $scope.cleanLibrary = function() {
      rkDialogService.showConfirm('Are you sure sou want to clean your video library?', function() {
        rkVideoLibraryService.clean();
        return true;
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
        items = $scope.seasons;
      }
      else if($scope.currentLevel === 'episodes') {
        items = $scope.episodes;
      }

      for(var key in items) {
        if(items[key].label && items[key].label.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1) {
          $scope.filteredItems.push(items[key]);
        }
      }
    };
    
    $scope.clearFilter = function(clearValue) {
      $scope.isFiltering = false;
      $scope.filteredItems = [];
      clearValue = (clearValue === undefined)? true : clearValue;
      
      if(clearValue) {
        $scope.guiModels.filterValue = '';
      }
 
      if($scope.currentLevel === 'seasons') {        

      }
      else if($scope.currentLevel === 'episodes') {

      }
      else if($scope.currentLevel === 'tvShows') {

      }
    };

    function initConnectionChange() {
      if(kodiApi) {
        $scope.getTvShowsCategorised();
        
        kodiApi.VideoLibrary.OnCleanFinished(function(data) {
          refreshData();
        });

        kodiApi.VideoLibrary.OnScanFinished(function(data) {
          refreshData();
        });
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