rekodiApp.factory('rkTooltipsService', ['$rootScope', '$timeout', 
  function($rootScope, $timeout) {
    function apply(element, position) {
      var options = {
        animation: 'move'
      };
      
      if(!position) {
        position = {
          x: 'center',
          y: 'bottom'
        };
      }
      
      options.position = position;

      $timeout(function() {
        element.find('[title]').jBox('Tooltip',  options);
      });
    };
    
    function applySingle(element, position, content) {
      var options = {
        animation: 'move'
      };
      
      if(!position) {
        position = {
          x: 'center',
          y: 'bottom'
        };
      }
      
      options.position = position;
      
      if(content) {
        options.content = content;
      }

      $timeout(function() {
        var jboxElement = element.jBox('Tooltip',  options);
      });
    }

    return {
      apply: apply,
      applySingle: applySingle
    };
  }
]);