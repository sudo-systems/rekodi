rekodiApp.controller('rkFooterCtrl', ['$scope', '$element', '$timeout', 'rkTooltipsService',
  function($scope, $element, $timeout, rkTooltipsService) {
    $scope.connected = false;
    $scope.statusMessage = 'offline';
    $scope.loadingMessage = 'loading...';
    $scope.connectionMessage = '';
    $scope.playbackMessage = '';
    $scope.playlistMessage = '';

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
        $('#footer .indicator').hide();
        $('#footer .indicator.loading').stop().fadeIn(150).css('display', 'inline-block');
      });
    });
    
    $scope.$root.$on('rkStopLoading', function(event, data) {
      $timeout(function() {
        $('#footer .indicator').hide();
        $('#footer .indicator.loading').stop().fadeOut(150);
      });
    });
    
    $scope.$root.$on('rkStartConnecting', function(event, data) {
      $timeout(function() {
        $('#footer .indicator').hide();
        $scope.connectionMessage = data.message;
        $('#footer .indicator.connecting').stop().addClass('blink').removeClass('error').fadeIn(150).css('display', 'inline-block');
      });
    });
    
    $scope.$root.$on('rkStopConnecting', function(event, data) {
      $('#footer .indicator').hide();
      $scope.connectionMessage = data.message;
      $('#footer .indicator.connecting').stop().removeClass('blink').fadeIn(150).css('display', 'inline-block');
      
      if(!data.connected) {
        $('#footer .indicator.connecting').addClass('error');
      }
      else {
        $('#footer .indicator.connecting').removeClass('error');
      }
      
      $timeout(function() {
        $('#footer .indicator.connecting').stop().fadeOut(1500);
      }, 15000);
    });
    
    $scope.$root.$on('rkPlaybackStart', function(event, data) {
      $scope.playbackMessage = data.message;
      $scope.$apply();
      
      $('#footer .indicator').hide();
      $('#footer .indicator.playback').stop().fadeIn(500).css('display', 'inline-block');

      $timeout(function() {
        $('#footer .indicator.playback').stop().fadeOut(1500);
      }, 15000);
    });
    
    $scope.$root.$on('rkAddedToPlaylist', function(event, data) {
      $scope.playlistMessage = data.message;
      $scope.$apply();
      
      $('#footer .indicator').hide();
      $('#footer .indicator.playlist').stop().fadeIn(500).css('display', 'inline-block');

      $timeout(function() {
        $('#footer .indicator.playlist').stop().fadeOut(1500);
      }, 15000);
    });
    
    $scope.$root.$on('rkServerError', function(event, data) {
      $scope.errorMessage = data.message;
      $scope.$apply();
      
      $('#footer .indicator').hide();
      $('#footer .indicator.error').stop().fadeIn(500).css('display', 'inline-block');

      $timeout(function() {
        $('#footer .indicator.error').stop().fadeOut(1500);
      }, 15000);
    });
  }
]);