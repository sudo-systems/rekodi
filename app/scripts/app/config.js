angular.module('rekodiApp')
  .config([function() {
      
    $(document).ready(function() {
      console.log('test');
      
      $('[title]').jBox('Tooltip',  {
        animation: 'move'
      });
    });
  }]);