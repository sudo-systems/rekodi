var Config = function() {
  this.app = {
    language: 'en'
  };
  
  this.eventClient = {
    url: 'donda.nl',
    port: 9777,
    retryInterval: 5000
  };
  
  this.api = {
    url: 'donda.nl',
    port: 9090,
    retryInterval: 5000
  };
};

module.exports = Config;