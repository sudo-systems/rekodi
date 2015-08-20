rekodiApp.controller('rkMoviesCtrl', ['$scope', '$element', 'kodiApiService', 'rkTooltipsService', '$attrs', 'rkCacheService', 'rkHelperService', 'rkRemoteControlService',
  function($scope, $element, kodiApiService, rkTooltipsService, $attrs, rkCacheService, rkHelperService, rkRemoteControlService) {
    var modal = {};
    $scope.identifier = $attrs.id;
    $scope.selectedIndex = null;
    $scope.moviesCategorised = {};
    $scope.moviesIndex = [];
    $scope.movies = [];
    $scope.scrollItems = [];
    $scope.displayLimit = 3;
    $scope.isInitialized = false;
    $scope.resumeMovie = {};
    var kodiApi = null;
    $scope.filter = {
      value: ''
    };
    
    $scope.showItems = function(selectedIndex, reset) {
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
    
    function getMoviesFromCache() {
      if(Object.keys($scope.moviesCategorised).length === 0) {
        $scope.moviesCategorised = rkCacheService.get({key: 'moviesCategorised'});
      }

      if($scope.moviesIndex.length === 0) {
        $scope.moviesIndex = rkCacheService.get({key: 'moviesIndex'});
      }

      if($scope.moviesIndex.length > 0) {
        setDefaultSelectedIndex();
      }
    }
    
    function createMoviesCategorised(movies) {
      $scope.moviesCategorised = {};
      
      for(var key in movies) {
        var firstLetter = movies[key].label.charAt(0).toUpperCase();

        if($scope.moviesCategorised[firstLetter] === undefined) {
          $scope.moviesCategorised[firstLetter] = [];
        }

        $scope.moviesCategorised[firstLetter].push(movies[key]);
      }
 
      rkCacheService.set({
        data: $scope.moviesCategorised,
        key: 'moviesCategorised'
      });
      
      createMoviesCategorisedIndex();
    }
    
    function createMoviesCategorisedIndex() {
      $scope.moviesIndex = [];

      for (var key in $scope.moviesCategorised) {
        if ($scope.moviesCategorised.hasOwnProperty(key)) {
          $scope.moviesIndex.push(key);
        }
      }
      
      rkCacheService.set({
        data: $scope.moviesIndex,
        key: 'moviesIndex'
      });
      
      setDefaultSelectedIndex();
    }
    
    function setDefaultSelectedIndex() {
      for(var key in $scope.moviesIndex) {
        if($scope.moviesIndex[key].toLowerCase() !== $scope.moviesIndex[key].toUpperCase()) {
          $scope.selectedIndex = $scope.moviesIndex[key];
          $scope.showItems($scope.moviesIndex[key], true);
          break;
        }
      }
    }
    
    $scope.getMovies = function() {
      $scope.clearFilter();
      
      if(kodiApi) {
        $scope.$root.$emit('rkStartLoading');
        getMoviesFromCache();
        
        kodiApi.VideoLibrary.GetMovies({
          properties: ['thumbnail', 'year', 'rating', 'plotoutline', 'genre', 'runtime', 'resume', 'lastplayed', 'file'],
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.movies = (data.movies === undefined)? [] : rkHelperService.addCustomFields(data.movies);
          var properties = {
            data: data.movies,
            key: 'movies'
          };
          
          if(rkCacheService.update(properties)) {
            createMoviesCategorised(data.movies);
          }
          else {
            getMoviesFromCache();
          }

          $scope.$root.$emit('rkStopLoading');
          rkTooltipsService.apply($($element).find('.data-list-wrapper'));
        }, function(error) {
          rkHelperService.handleError(error);
          $scope.$root.$emit('rkStopLoading');
        });
      }
    };
    
    $scope.filterList = function(entry) {
      return (entry.label.toLowerCase().indexOf($scope.filter.value.toLowerCase()) > -1 || entry.label === '..');
    };
    
    $scope.clearFilter = function() {
      $scope.filter.value = '';
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

      if(kodiApi && $.isEmptyObject($scope.movies)) {
        $scope.getMovies();
      }
    }

    $scope.init = function() {
      if(!$scope.isInitialized) {
        rkCacheService.setCategory($scope.identifier);
        initConnectionChange();

        $scope.$root.$on('rkWsConnectionStatusChange', function (event, data) {
          initConnectionChange();
        });

        $(document).on('closed', '[data-remodal-id=resumeMovieModal]', function(e) {
          $scope.resumeMovie = {};
          modal.resumeMovie = null;
        });
        
        $scope.isInitialized = true;
      }
    };
  }
]);