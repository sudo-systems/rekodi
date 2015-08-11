rekodiApp.controller('rkMoviesCtrl', ['$scope', '$element', '$timeout', 'rkKodiWsApiService', 'rkTooltipsService', '$localStorage', '$attrs', 'rkCacheService',
  function($scope, $element, $timeout, rkKodiWsApiService, rkTooltipsService, $localStorage, $attrs, rkCacheService) {
    $scope.identifier = $attrs.id;
    $scope.selectedIndex = null;
    $scope.moviesCategorised = {};
    $scope.moviesIndex = [];
    $scope.movies = [];
    var kodiWsApiConnection = null;
    $scope.filter = {
      value: ''
    };
    
    function getMoviesFromCache() {
      /*if($scope.movies.length === 0) {
        $scope.movies = rkCacheService.get({key: 'movies'});
      }*/
      
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
    
    $scope.getMovies = function() {
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
      $scope.clearFilter();
      getMoviesFromCache();
      
      if(kodiWsApiConnection) {
        $scope.$root.$emit('rkStartLoading');
        
        kodiWsApiConnection.VideoLibrary.GetMovies({
          properties: ['thumbnail', 'year', 'rating', 'plotoutline'],
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.movies = (data.movies === undefined)? [] : addCustomMoviesFields(data.movies);
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
          handleError(error);
          $scope.$root.$emit('rkStopLoading');
        });
      }
    };
    
    function addCustomMoviesFields(movies) {
      for(var key in movies) {
        if(movies[key].thumbnail) {
          movies[key].thumbnail_src = getImageSrc(movies[key].thumbnail);
        }
        
        if(movies[key].rating) {
          movies[key].rating_rounded =  Math.round(movies[key].rating * 10 ) / 10;
        }
      }
      
      return movies;
    }
    
    function setDefaultSelectedIndex() {
      for(var key in $scope.moviesIndex) {
        if($scope.moviesIndex[key].toLowerCase() !== $scope.moviesIndex[key].toUpperCase()) {
          $scope.selectedIndex = $scope.moviesIndex[key];
          break;
        }
      }
    }
    
    $scope.filterList = function(entry) {
      return (entry.label.toLowerCase().indexOf($scope.filter.value.toLowerCase()) > -1 || entry.label === '..');
    };
    
    $scope.clearFilter = function() {
      $scope.filter.value = '';
    };
    
    function getImageSrc(specialPath) {
      var usernameAndPassword = ($localStorage.settings.password && $localStorage.settings.password !== '')? $localStorage.settings.username+':'+$localStorage.settings.password+'@' : '';
      return 'http://'+usernameAndPassword+$localStorage.settings.serverAddress+':'+$localStorage.settings.httpPort+'/image/'+encodeURIComponent(specialPath);
    }
    
    function handleError(error) {
      var errorDetails = (error.response.data)? ' ('+error.response.data.stack.message+': '+error.response.data.stack.name+')' : '';
      $scope.$root.$emit('rkServerError', {
        message: error.response.message+errorDetails
      });
    }
    
    $scope.init = function() {
      $timeout(function() {
        rkCacheService.setCategory($scope.identifier);
      });
      
      if($.isEmptyObject($scope.movies)) {
        $timeout(function() {
          $scope.getMovies();
        });
      }
    };
  }
]);