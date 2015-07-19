rekodiApp.controller('rkMoviesCtrl', ['$scope', '$element', '$timeout', 'rkKodiWsApiService', 'rkTooltipsService',
  function($scope, $element, $timeout, rkKodiWsApiService, rkTooltipsService) {
    $scope.library = {};
    var kodiWsApiConnection = null;
    
    $scope.getLibrary = function() {
      
    };
    
    $scope.play = function(entry, type) {
      var options = {
        item: {}
      };
      
      options.item[type] = entry;

      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      var promise = kodiWsApiConnection.Player.Open(options);
      
      
      promise.then(function(data) {
        if(data === 'OK') {
          emitPlaybackNotification(entry, type);
        }
      }, function(error){
        console.log(error);
      });
    };

    $scope.$root.$on('rkWsConnectionStatusChange', function(event, data) {
      if(!data.connected) {
       
      }
    });
    
    function emitPlaybackNotification(entry, type) {
      var fileName = 'of ';
      
      if(type === 'file'){
        fileName += '"' +entry.substring(entry.lastIndexOf('/')+1, entry.lastIndexOf('.'))+ '"';
      }
      else if(type === 'directory') {
        var parts = entry.split('/');
        fileName += 'directory "' +parts[(parts.length-2)]+ '"';
      }
      else {
        fileName = '';
      }
      
      $scope.$root.$emit('rkPlaybackStart', {
        message: 'Playback ' +fileName+ ' started'
      });
    }
    
    $scope.$evalAsync(function() {
      
    });
    
    $scope.init = function() {

    };
  }
]);