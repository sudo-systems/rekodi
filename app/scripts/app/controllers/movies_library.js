rekodiApp.controller('rkMoviesLibraryCtrl', ['$scope', '$element', 'kodiApiService', 'rkTooltipsService', 'rkRemoteControlService', '$timeout', 'rkVideoLibraryService',
  function($scope, $element, kodiApiService, rkTooltipsService, rkRemoteControlService, $timeout, rkVideoLibraryService) {
    var modal = {};
    $scope.selectedIndex = null;
    $scope.moviesCategorised = {};
    $scope.moviesIndex = [];
    $scope.scrollItems = [];
    $scope.displayLimit = 3;
    $scope.isFiltering = false;
    $scope.resumeMovie = {};
    $scope.filter = {value: ''};
    var kodiApi = null;
    
    $scope.showItems = function(selectedIndex, reset) {
      $scope.selectedIndex = selectedIndex;
      
      if(reset) {
        $scope.scrollItems = [];
      }

      var scrollItemsCount = $scope.scrollItems.length;
      
      if(!$scope.moviesCategorised[selectedIndex] || !$scope.moviesCategorised[selectedIndex][scrollItemsCount]) {
        return;
      }

      for(var x = 0; x < $scope.displayLimit; x++) {
        var nextIndex = ((scrollItemsCount)+x);

        if($scope.moviesCategorised[selectedIndex][nextIndex]) {
          $scope.scrollItems.push($scope.moviesCategorised[selectedIndex][nextIndex]);
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
      $scope.selectedIndex = getDefaultIndex($scope.moviesIndex);
      $scope.showItems($scope.selectedIndex, true);
    }
    
    $scope.applyFilter = function(filterValue) {
      if(filterValue.length < 2) {
        $scope.isFiltering = false;
        $scope.showItems($scope.selectedIndex, true);
        return;
      }

      $scope.isFiltering = true;
      $scope.scrollItems = [];
      
      if(!$scope.$$phase){
        $scope.$apply();
      }

      var items = rkVideoLibraryService.getMoviesFromCache();

      for(var key in items) {
        if(items[key].label && items[key].label.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1) {
          $scope.scrollItems.push(items[key]);
        }
      }
    };
    
    $scope.clearFilter = function() {
      $scope.isFiltering = false;
      $scope.filter.value = '';
      $scope.showItems($scope.selectedIndex, true);
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

    var init = function() {
      if(!$scope.isInitialized) {
        initConnectionChange();

        $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
          initConnectionChange();
        });

        $(document).on('closed', '[data-remodal-id=resumeMovieModal]', function(e) {
          $scope.resumeMovie = {};
          modal.resumeMovie = null;
        });
        
        $scope.isInitialized = true;
      }
    };
    
    $timeout(function() {
      init();
    });
  }
]);