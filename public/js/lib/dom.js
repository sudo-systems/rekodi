var Dom = function() {
  this.elements = {};
  
  this.set = function(elementsObject) {
    this.elements = elementsObject;
  };
};

module.exports = Dom;