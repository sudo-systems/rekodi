rekodiApp.controller('rkMoviesCtrl', ['$scope', '$element', '$timeout', 'rkKodiWsApiService', 'rkTooltipsService', '$localStorage',
  function($scope, $element, $timeout, rkKodiWsApiService, rkTooltipsService, $localStorage) {
    $scope.library = [];
    $scope.filter = {
      value: ''
    };
    var kodiWsApiConnection = null;
    
    $scope.getLibrary = function() {
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
      if(kodiWsApiConnection) {
        $scope.$root.$emit('rkStartLoading');
        
        kodiWsApiConnection.VideoLibrary.GetMovies({
          properties: ['thumbnail', 'year', 'rating', 'plotoutline'],
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.movies = (data.movies === undefined)? [] : data.movies;
          $scope.library = data.movies;
          
          for(var key in $scope.library) {
            if($scope.library[key].thumbnail) {
              var usernameAndPassword = ($localStorage.settings.password && $localStorage.settings.password !== '')? $localStorage.settings.username+':'+$localStorage.settings.password+'@' : '';
              $scope.library[key].thumbnail = 'http://'+usernameAndPassword+$localStorage.settings.serverAddress+':'+$localStorage.settings.httpPort+'/image/'+encodeURIComponent($scope.library[key].thumbnail);
              $scope.library[key].rating =  Math.round($scope.library[key].rating * 10 ) / 10;
            }
          }
          
          $scope.$root.$emit('rkStopLoading');
        }, function(error) {
          handleError(error);
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
    
    function handleError(error) {
      var errorDetails = (error.response.data)? ' ('+error.response.data.stack.message+': '+error.response.data.stack.name+')' : '';
      $scope.$root.$emit('rkServerError', {
        message: error.response.message+errorDetails
      });
    }
    
    $scope.init = function() {
      if($.isEmptyObject($scope.library)) {
        $timeout(function() {
          $scope.getLibrary();
        });
      }
    };
  }
]);