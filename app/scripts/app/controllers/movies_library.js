rekodiApp.controller('rkMoviesLibraryCtrl', ['$scope', '$element', 'kodiApiService', 'rkTooltipsService', 'rkRemoteControlService', '$timeout', 'rkVideoLibraryService',
  function($scope, $element, kodiApiService, rkTooltipsService, rkRemoteControlService, $timeout, rkVideoLibraryService) {
    var modal = {};
    var displayLimit = 5;
    var kodiApi = null;
    $scope.moviesCategorised = {};
    $scope.moviesIndex = [];
    $scope.scrollItems = [];
    $scope.isFiltering = false;
    $scope.isInitialized = false;
    $scope.resumeMovie = {};
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

    function createCategorisedIndex(moviesCategorised) {
      $scope.moviesIndex = [];

      for (var key in moviesCategorised) {
        if (moviesCategorised.hasOwnProperty(key)) {
          $scope.moviesIndex.push(key);
        }
      }

      return $scope.moviesIndex;
    }
    
    function getDefaultIndex(moviesIndex) {
      for(var key in moviesIndex) {
        if(moviesIndex[key].toLowerCase() !== moviesIndex[key].toUpperCase()) {
          return moviesIndex[key];
        }
      }
      
      return null;
    }
    
    $scope.getMoviesCategorised = function() {
      $scope.clearFilter();
      
      if(Object.keys($scope.moviesCategorised).length === 0) {
        $scope.moviesCategorised = rkVideoLibraryService.getMoviesCategorisedFromCache();
        applyMoviesData($scope.moviesCategorised);
      }

      rkVideoLibraryService.getMoviesCategorised(function(moviesCategorised) {
        if(moviesCategorised && !angular.equals(moviesCategorised, $scope.moviesCategorised)) {
          $scope.moviesCategorised = moviesCategorised;
          applyMoviesData($scope.moviesCategorised);
        }
      });
    };
    
    function applyMoviesData(moviesCategorised) {
      $scope.moviesIndex = createCategorisedIndex(moviesCategorised);
      $scope.guiModels.selectedIndex = getDefaultIndex($scope.moviesIndex);

      $scope.showItems({
        reset: true,
        data: moviesCategorised[$scope.guiModels.selectedIndex]
      });
    }
    
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

    $scope.handlePlay = function(movie) {
      if(movie.resume.position > 0) {
        $scope.resumeMovie = movie;
        modal.resumeMovie = $('[data-remodal-id=resumeMovieModal]').remodal();
        modal.resumeMovie.open();
      }
      else {
        $scope.play(movie, false);
      }
    };
    
    $scope.play = function(movie, resume) {
      if(modal.resumeMovie) {
        modal.resumeMovie.close();
      }
      
      resume = (resume)? true : false;
      var options = {
        item: {
          movieid: movie.movieid
        },
        options: {
          resume: resume
        }
      };

      rkRemoteControlService.play(options);
    };
    
    function initConnectionChange() {
      kodiApi = kodiApiService.getConnection();

      if(kodiApi && Object.keys($scope.moviesCategorised).length === 0) {
        $scope.getMoviesCategorised();
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

      $(document).on('closed', '[data-remodal-id=resumeMovieModal]', function(e) {
        $scope.resumeMovie = {};
        modal.resumeMovie = null;
      });

      $scope.isInitialized = true;
    };
  }
]);