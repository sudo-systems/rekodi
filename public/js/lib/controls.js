var Controls = function(app) {
  this.init = function() {
    $('#player #controls li').on('click', function() {
      app.eventClient.link.remotePress($(this).attr('data-button'));
    });
  };
};

module.exports = Controls;