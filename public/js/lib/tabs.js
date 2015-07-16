var Tabs = function(wrapper) {
  this.load = function() {
    wrapper.find('[data-partial]').each(function() {
      var loThis = $(this);
      var templatePartial = 'partials/'+$(this).attr('data-partial')+'.html';

      $.ajax({
        url: templatePartial,
        success: function(data) {
          loThis.html(data);
        },
        error: function(error) {
          console.error(error);
        }
      });
    });
  };
  
  this.init = function() {
    var magicLine = wrapper.find('nav .magic-line:first');
    magicLine.css('left', wrapper.find('nav li.active:first').position().left).data('origLeft', magicLine.position().left).data('origWidth', magicLine.width());
    var tabsContainer = wrapper.find('.tabs:first').attr('data-tab', 0);

    wrapper.find('nav li').on('click', function(e) {
      e.preventDefault();

      wrapper.find('nav li.active:first').removeClass('active');
      $(this).addClass('active');
      tabsContainer.attr('data-tab', $(this).index());

      var leftPos = $(this).position().left;
      var newWidth = $(this).width();

      magicLine.stop().animate({
        left: leftPos,
        width: newWidth
      }, 500);
    });
    
    this.load();
  };
  
  this.init();
};

module.exports = Tabs;