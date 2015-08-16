rekodiApp.directive('rkTooltips', ['$timeout',
  function($timeout) {
  	return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        function applyTooltips() {
          $(element).find('[title]').jBox('Tooltip',  {
            animation: 'move',
            position: {
              x: 'center',
              y: 'bottom'
            }
          });
        }
        
        scope.$on('$includeContentLoaded', function () {
          $timeout(function() {
            applyTooltips();
          });
        });
        
        if(scope.$last === true) {
          $timeout(function() {
            applyTooltips();
          });
        }
      }
  	};
  }
]);
