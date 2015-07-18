rekodiApp.controller('rkFooterCtrl', ['$scope', '$timeout',
  function($scope, $timeout) {
    $scope.connected = false;
    $scope.statusMessage = 'offline';
    $scope.playbackMessage = '';
    
    $scope.$root.$on('rkWsConnectionStatusChange', function(event, data) {
      $timeout(function() {
        $scope.connected = data.connected;
        $scope.statusMessage = data.statusMessage;
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
      $scope.playbackMessage = data.message;
      
      $timeout(function() {
        $('#footer .playback-indicator').stop().fadeIn(500).css('display', 'inline-block');
        
        setTimeout(function() {
          $('#footer .playback-indicator').stop().fadeOut(1500);
        }, 20000);
      });
    });
  }
]);