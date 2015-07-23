rekodiApp.controller('rkPlaylistCtrl', ['$scope', '$element', '$timeout', 'rkKodiWsApiService', 'rkTooltipsService', 'rkEnumsService',
  function($scope, $element, $timeout, rkKodiWsApiService, rkTooltipsService, rkEnumsService) {
    $scope.type = '';
    $scope.entries = [];
    $scope.filter = {
      value: ''
    };
    var kodiWsApiConnection = null;
    
    $scope.getPlaylist = function() {
      kodiWsApiConnection = rkKodiWsApiService.getConnection();

      if(kodiWsApiConnection) {
        $scope.$root.$emit('rkStartLoading');
        
        var promise = kodiWsApiConnection.Playlist.GetItems({
          playlistid: ($scope.type === 'audio')? rkEnumsService.PlaylistId.AUDIO : rkEnumsService.PlaylistId.VIDEO
        });

        promise.then(function(data) {
          $scope.items = data.items;
          $scope.$apply();
          $scope.$root.$emit('rkStopLoading');
          rkTooltipsService.apply($($element).find('.data-list-wrapper'));
        }, function(error) {
          $scope.$root.$emit('rkStopLoading');
          handleError(error);
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
      $scope.$root.$emit('rkServerError', {
        message: error.response.message+' ('+error.response.data.stack.message+': '+error.response.data.stack.name+')'
      });
    }
    
    $scope.init = function() {
      $timeout(function() {
        $scope.getPlaylist();
      });
    };
  }
]);