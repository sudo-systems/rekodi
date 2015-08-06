rekodiApp.controller('rkMusicCtrl', ['$scope', '$element', '$timeout', 'rkKodiWsApiService', 'rkTooltipsService',
  function($scope, $element, $timeout, rkKodiWsApiService, rkTooltipsService) {
    $scope.library = {};
    var kodiWsApiConnection = null;
    
    $scope.getLibrary = function() {
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
    };
  }
]);