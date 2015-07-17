'use strict';

angular.module('rekodiApp')
  .controller('rkNowPlayingCtrl', [
    '$scope', 
    function($scope) {
      $scope.test = 'Now playing';
    }
  ]);