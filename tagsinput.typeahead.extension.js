// Extension to module core

(function ( name, definition ) {
    var theModule = definition(),
        hasDefine = typeof define === 'function',
        hasExports = typeof module !== 'undefined' && module.exports;

    if ( hasDefine ) { // AMD Module
        define(theModule);
    } else if ( hasExports ) { // Node.js Module
        module.exports = theModule;
    } else { // Assign to common namespaces or simply the global object (window)


        // account for for flat-file/global module extensions
        var obj = null;
        var namespaces = name.split(".");
        var scope = (this.jQuery || this.ender || this.$ || this);
        for (var i = 0; i < namespaces.length; i++) {
            var packageName = namespaces[i];
            if (obj && i == namespaces.length - 1) {
                obj[packageName] = theModule;
            } else if (typeof scope[packageName] === "undefined") {
                scope[packageName] = {};
            }
            obj = scope[packageName];
        }

    }
})('tagsInput.plugins.typeahead', function (tagsInput) {
   var extensionName = 'typeahead';
   var pluginName = 'tagsInput.plugins.typeahead';
   var config = {
      events: {
         keypress: 'keypress.tagsInput.plugins.typeahead'
      }
   };

   var plugin = function() {
      var self = this;

      self.init = function(parent) {
         self.main = parent;

         self.main.core.$container.off(self.main.core.config.events.blur, self.main.core.$fakeInput, self.main.keypressEvent);
         console.log(self.main.core.config.events.blur);

         self.main.core.$fakeInput.typeahead(
            self.main.opts.plugins[extensionName].config,
            self.main.opts.plugins[extensionName].options
         );

         self.main.core.$fakeInput.bind('typeahead:select', function(ev, suggestion) {
            var result = self.main.addTag(suggestion, 'autocomplete');
            if (result) {
               self.main.core.$fakeInput.typeahead('val', '');
            }
            self.main.resetInput();
         });
      };
   };

   var t = $.fn.tagsInput('register', 'typeahead', plugin);
   // $.fn.tagsInput.typeahead = function() {
   //    console.log('hello world');
   // };


   //  // Define your module here and return the public API.
   //  // This code could be easily adapted with the core to
   //  // allow for methods that overwrite and extend core functionality
   //  // in order to expand the highlight method to do more if you wish.
   //  return {
   //      setGreen: function ( el ) {
   //          highlight(el, 'green');
   //      },
   //      setRed: function ( el ) {
   //          highlight(el, errorColor);
   //      }
   //  };

});
