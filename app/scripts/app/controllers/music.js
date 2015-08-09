rekodiApp.controller('rkMusicCtrl', ['$scope', '$element', '$timeout', 'rkKodiWsApiService', 'rkTooltipsService', '$localStorage',
  function($scope, $element, $timeout, rkKodiWsApiService, rkTooltipsService, $localStorage) {
    $scope.library = [];
    $scope.listLimit = 100;
    $scope.totalListLimit = $scope.listLimit;
    $scope.filter = {
      value: ''
    };
    var kodiWsApiConnection = null;
    
    $scope.getLibrary = function() {
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
      if(kodiWsApiConnection) {
        $scope.$root.$emit('rkStartLoading');
        
        kodiWsApiConnection.AudioLibrary.GetArtists({
          albumartistsonly: true,
          properties: ['thumbnail'],
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          console.dir(data);
          
          data.artists = (data.artists === undefined)? [] : data.artists;
          $scope.library = data.artists;
          
          for(var key in $scope.library) {
            $scope.library[key].elementid = 'artist_'+$scope.library[key].artistid;
            if($scope.library[key].thumbnail) {
              $scope.library[key].thumbnail_src = getImageSrc($scope.library[key].thumbnail);
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
    
    function setNumberOfListItems() {
      $scope.totalListLimit += $scope.listLimit;
    }
    
    $scope.init = function() {
      if($.isEmptyObject($scope.library)) {
        $timeout(function() {
          $scope.getLibrary();
        });
      }
      
      $('.data-list-wrapper').on('scroll', function() {
        if(($(this).scrollTop() + $(this).innerHeight()) === this.scrollHeight){
          setNumberOfListItems();
        }
      });
    };
  }
]);