rekodiApp.controller('rkMoviesLibraryCtrl', ['$scope', 'kodiApiService', 'rkVideoLibraryService', 'rkSettingsService', 'rkDialogService', 'rkNowPlayingService',
  function($scope, kodiApiService, rkVideoLibraryService, rkSettingsService, rkDialogService, rkNowPlayingService) {
    $scope.displayLimit = 5;
    var kodiApi = null;
    $scope.moviesCategorised = {};
    $scope.moviesIndex = [];
    $scope.scrollItems = [];
    $scope.isFiltering = false;
    $scope.settings = rkSettingsService.get({category: 'moviesLibrary'});
    $scope.resumeMovie = {};
    $scope.guiModels = {
      filterValue: '',
      selectedIndex: null
    };
    $scope.status = {
      isInitalized: false
    };

    function getDefaultIndex(moviesIndex) {
      for(var key in moviesIndex) {
        if(moviesIndex[key].toLowerCase() !== moviesIndex[key].toUpperCase()) {
          return moviesIndex[key];
        }
      }
      
      return null;
    }
    
    function getUnwatchedMovies(moviesCategorised) {
      var newCategorisedLibrary = {};
      
      for(var key in moviesCategorised) {
        var indexCollection = [];
        
        for(var index in moviesCategorised[key]) {
          if(!moviesCategorised[key][index].is_watched) {
            indexCollection.push(moviesCategorised[key][index]);
          }
        }

        if(indexCollection.length > 0) {
          newCategorisedLibrary[key] = indexCollection;
        }
      }
      
      return newCategorisedLibrary;
    }
    
    $scope.getMoviesCategorised = function() {
      $scope.clearFilter();
      
      if(Object.keys($scope.moviesCategorised).length === 0) {
        $scope.moviesCategorised = rkVideoLibraryService.getMoviesCategorisedFromCache();
        
        if($scope.settings.hideWatched) {
          $scope.moviesCategorised = getUnwatchedMovies($scope.moviesCategorised);
        }
        
        $scope.moviesIndex = Object.keys($scope.moviesCategorised);
        $scope.guiModels.selectedIndex = (!$scope.guiModels.selectedIndex)? getDefaultIndex($scope.moviesIndex) : $scope.guiModels.selectedIndex;
      }

      rkVideoLibraryService.getMoviesCategorised(function(moviesCategorised) {
        if(moviesCategorised && $scope.settings.hideWatched) {
          moviesCategorised = getUnwatchedMovies(moviesCategorised);
        }
        
        if(moviesCategorised && !angular.equals(moviesCategorised, $scope.moviesCategorised)) {
          $scope.moviesCategorised = moviesCategorised;
          $scope.moviesIndex = Object.keys(moviesCategorised);
          $scope.guiModels.selectedIndex = (!$scope.guiModels.selectedIndex)? getDefaultIndex($scope.moviesIndex) : $scope.guiModels.selectedIndex;
        }
      });
    };

    $scope.applyFilter = function(filterValue) {
      if(filterValue.length < 2) {
        $scope.isFiltering = false;
        return;
      }

      $scope.isFiltering = true;
      $scope.filteredItems = [];
      var items = rkVideoLibraryService.getMoviesFromCache();

      for(var key in items) {
        if(items[key].label && items[key].label.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1) {
          $scope.filteredItems.push(items[key]);
        }
      }
    };
    
    $scope.clearFilter = function() {
      $scope.isFiltering = false;
      $scope.filteredItems = [];
      $scope.guiModels.filterValue = '';
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

    $scope.showMovieOptionsDialog = function(movie) {
      rkDialogService.showMovieOptions(movie, function(markWatchedSuccess) {
        if(markWatchedSuccess) {
          $scope.getMoviesCategorised();
        }
      });
    };

    function initConnectionChange() {
      if(kodiApi) {
        $scope.getMoviesCategorised();
        
        kodiApi.VideoLibrary.OnCleanFinished(function(data) {
          $scope.getMoviesCategorised();
        });

        kodiApi.VideoLibrary.OnScanFinished(function(data) {
          $scope.getMoviesCategorised();
        });

        kodiApi.VideoLibrary.OnRemove(function(data) {
          $scope.getMoviesCategorised();
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
            category: 'moviesLibrary',
            key: key,
            value: newData[key]
          });
        }

        if(newData.hideWatched !== oldData.hideWatched) {
          $scope.moviesCategorised = {};
          $scope.getMoviesCategorised();
        }
      });

      $scope.status.isInitialized = true;
    };
    
    $scope.$root.$on('rkMoviesLibraryCtrlInit', function (event) {
      if($scope.status.isInitialized) {
        return;
      }

      $scope.init();
    });
  }
]);