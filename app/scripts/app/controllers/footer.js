rekodiApp.controller('rkFooterCtrl', ['$scope', '$element', '$timeout', 'rkTooltipsService',
  function($scope, $element, $timeout, rkTooltipsService) {
    $scope.connected = false;
    $scope.statusMessage = 'offline';
    $scope.playbackMessage = '';
    
    $scope.$root.$on('rkWsConnectionStatusChange', function(event, data) {
      $timeout(function() {
        $scope.connected = data.connected;
        $scope.statusMessage = data.statusMessage;
        $scope.$apply();
        
        rkTooltipsService.applySingle(
          $('#footer .heartbeat'), {
            x: 'center',
            y: 'top'
          }, 
          $scope.statusMessage
        );
      });
    });
    
    $scope.$root.$on('rkStartLoading', function(event, data) {
      $timeout(function() {
        $('#footer .loading-indicator').stop().fadeIn(150).css('display', 'inline-block');
      });
    });
    
    $scope.$root.$on('rkStopLoading', function(event, data) {
      $timeout(function() {
        $('#footer .loading-indicator').stop().fadeOut(150);
      });
    });
    
    $scope.$root.$on('rkPlaybackStart', function(event, data) {
      var playbackIndicator = $('#footer .playback-indicator');
      $scope.playbackMessage = data.message;
      $scope.$apply();
      
      playbackIndicator.stop().fadeIn(500).css('display', 'inline-block');

      $timeout(function() {
        playbackIndicator.stop().fadeOut(1500);
      }, 15000);
    });
  }
]);