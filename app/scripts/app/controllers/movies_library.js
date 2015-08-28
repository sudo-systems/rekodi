rekodiApp.controller('rkMoviesLibraryCtrl', ['$scope', 'kodiApiService', 'rkVideoLibraryService', 'rkSettingsService', 'rkDialogService',
  function($scope, kodiApiService, rkVideoLibraryService, rkSettingsService, rkDialogService) {
    var modal = {};
    var displayLimit = 5;
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
        $scope.guiModels.selectedIndex = getDefaultIndex($scope.moviesIndex);
      }
      
      $scope.showItems({
        reset: true,
        data: $scope.moviesCategorised[$scope.guiModels.selectedIndex]
      });

      rkVideoLibraryService.getMoviesCategorised(function(moviesCategorised) {
        if(moviesCategorised && $scope.settings.hideWatched) {
          moviesCategorised = getUnwatchedMovies(moviesCategorised);
        }
        
        if(moviesCategorised && !angular.equals(moviesCategorised, $scope.moviesCategorised)) {
          $scope.moviesCategorised = moviesCategorised;
          $scope.moviesIndex = Object.keys(moviesCategorised);
          $scope.guiModels.selectedIndex = getDefaultIndex($scope.moviesIndex);

          $scope.showItems({
            reset: true,
            data: $scope.moviesCategorised[$scope.guiModels.selectedIndex]
          });
        }
      });
    };

    $scope.applyFilter = function(filterValue) {
      if(filterValue.length < 2) {
        $scope.isFiltering = false;
        $scope.showItems({
          reset: true,
          data: $scope.moviesCategorised[$scope.guiModels.selectedIndex]
        });
        
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
        data: $scope.moviesCategorised[$scope.guiModels.selectedIndex]
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
    
    $scope.$root.$on('rkMoviesLibraryCtrlInit', function (event, connection) {
      if($scope.status.isInitialized) {
        return;
      }

      $scope.init();
    });
  }
]);