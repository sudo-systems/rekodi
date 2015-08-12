rekodiApp.directive('rkTooltips', [
  function() {
  	return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        $(document).ready(function() {
          $(element).find('[title]').jBox('Tooltip',  {
            animation: 'move',
            position: {
              x: 'center',
              y: 'bottom'
            }
          });
        });
      }
  	};
  }
]);
