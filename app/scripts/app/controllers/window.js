'use strict';

angular.module('rekodiApp')
  .controller('rkWindowCtrl', [
    '$scope', 
    function($scope) {
      $scope.test = 'Window controls';
    }
  ]);