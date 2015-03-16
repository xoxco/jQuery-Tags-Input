/*!jQuery TagsInput */
/**
 * SOME TITLE
 *
 * Version: 2.0.0
 * Requires: jQuery v1.7+
 *
 * Copyright (c) 2015 Luckner Jr Jean-Baptiste
 * Under MIT License (http://www.opensource.org/licenses/mit-license.php)
 */

 // https://github.com/aterrien/jQuery-Knob/blob/master/js/jquery.knob.js

(function(factory) {
   if (typeof exports === 'object') {
      // CommonJS
      module.exports = factory(require('jquery'));
   } else if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module
      define(['jquery'], factory);
   } else {
      // Browser globals
      factory(jQuery);
   }
}(function($) {
   'use strict';

   var tagsInput = {};
   tagsInput.Core = {};

   // Object
   tagsInput.Obj = function(options) {
      var plugin = this;

      plugin.options          = null;
      plugin.$                = null;
      plugin.$realInput       = null;
      plugin.$fakeInput       = null;
      plugin.autocomplete     = null;
      plugin.defaultText      = null;
      plugin.elementData      = {};
      plugin.delimiter        = [];
      plugin.delimiterRegex   = '/[\s,]+/';
      plugin.tagsCallbacks    = [];

      plugin.defaultOptions = {
         // Config
         interactive: true,
         defaultText: 'add a tag',
         minChars: 0,
         delimiter: [',', ';'],
         joinDelimiter: ',',
         unique: true,
         removeWithBackspace: true,

         // UI
         // height: 100,
         // width: 300,
         width: '300px',
         height: '100px',
         hide: true,
         placeholderColor: '#666666',
         autosize: true,
         comfortZone: 20,
         inputPadding: 6 * 2,

         // Autocomplete
         autocomplete: {
            selectFirst: true
         }

         // Hooks
      };

      plugin.methods = {
         add: function() {
            console.log('add');
         }
      };

      plugin.run = function(element) {
         // Merge options
         plugin.options = $.extend(true, {}, plugin.defaultOptions, options);
         console.log(plugin.options);
      };
   };

   $.fn.tagsInput = function(methodOrOptions) {
      var instance = new tagsInput.Obj();

      if (instance.methods[methodOrOptions]) {
         var args = Array.prototype.slice.call(arguments, 1);
         var id = $(this).attr('id');
         args.splice(0, 0, '#' + id);
         return instance.methods[methodOrOptions].apply(this, args);
      }
      else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
         // Default to init
         return instance.run.apply(this, arguments);
      }
      else {
         $.error( 'jQueryTagsInput method "' +  methodOrOptions + '" does not exist' );
      }

      // this.each(function() {
      //    var instance = new tagsInput.Obj();
      //    instance.run(this);
      // });

      return {
         hello: function() {
            console.log('hello');
         }
      };
   }

}));
