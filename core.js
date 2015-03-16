;(function(root, factory) {
   if (typeof exports === 'object') {
      // CommonJS
      module.exports = factory(require('jquery'));
   }
   else if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module
      define(['jquery'], factory);
   } else {
      // Browser globals
      factory(root.jQuery);
   }
}(this, function($) {
   'use strict';

   var Plugin = {};
   Plugin.core = {
      document: $(document),
   };

   Plugin.Setup = function() {
      var self = this;

      this.opts = null;
      this.$ = null;
      this.$fakeInput = null;
      this.delimiter = [];
      this.elementData = {};
      this.$realInput = null;
      this.defaultOpts = {
         // Config
         interactive: true,
         defaultText: 'add a tag',
         minChars: 0,
         delimiter: [',', ';'],
         delimiterRegex: '/[\s,]+/',
         joinDelimiter: ',',
         unique: true,
         removeWithBackspace: true,

         // UI
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

      this.run = function() {
         // If we've already instanciated the element, return
         if (this.$.data('tagsinput-init-complete')) {
            return;
         }
         this.$.data('tagsinput-init-complete', true);

         // Configure the options
         this.extend();
         this.opts = $.extend(true, {}, this.defaultOpts, this.opts);

         this.init();
         this.listen();

         /*
         // finalize init
            this._listen()
                ._configure()
                ._xy()
                .init();
         */
         this.isInit = true;
         //
      };

      // Abstract methods
      this.init = function() {};
      this.extend = function() {};
      this.listen = function() {};
      this.exportTags = function() {};
   };

   Plugin.Main = function() {
      Plugin.Setup.call(this);
      var self = this;

      // Private members
      this._hide = function() {
         this.$.hide();
      };

      this._generateId = function() {
         var id = this.$.attr('id');
         if (!id || this.delimiter[id]) {
            id = 'tags' + new Date().getTime();
            this.$.attr('id', id);
         }

         return id;
      }

      this._updateDelimiterRegex = function() {
         var matchString = '';
         $.each(this.opts.delimiter, function(index, val) {
            matchString = matchString + val;
         });
         var regexString = '[\\s' + matchString + ']+';
         this.opts.delimiterRegex = new RegExp(regexString, 'i');
      }

      this._displayMarkup = function() {
         var id = this.$.attr('id');
         var markup = '<div id="' + id + '_tagsinput" class="tagsinput"><div id="' + id +'_addTag">';

         if (this.opts.interactive) {
            markup = markup + '<input id="' + id + '_tag" value="" data-default="' + this.opts.defaultText + '" />';
         }

         markup = markup + '</div><div class="tags_clear"></div></div>';
         $(markup).insertAfter(this.$);

         // Apply CSS options to the markup
         $(this.elementData.holder).css('width', this.opts.width);
         $(this.elementData.holder).css('min-height', this.opts.height);
         $(this.elementData.holder).css('height', '100%');
      }

      this._importTags = function(e, str) {
         console.log(123);
         var id = this.$.attr('id');
         $('#' + id + '_tagsinput .tag').remove();
         methods['importTags'](this.$, str);
      }

      this._updateTagsField = function(tags) {
         var id = this.$.attr('id');
         this.$.val(tags.join(this.opts.joinDelimiter));
      }

      this._checkDelimiter = function(e) {
         var delimiterFound = false;

         // Handle the enter key
         if (e.which === 13) {
            delimiterFound = true;
         }

         // Loop over the delimieters and see if we get a match
         $.each(e.data.delimiter, function(index, value) {
            if(e.which == value.charCodeAt(0)){
               delimiterFound = true
            }
         });

         return delimiterFound;
      }

      this._validateTagLength = function(data) {
         var valid = true;
         var $elem = $(data.fakeInput);
         var tagLength = $elem.val().length;

         // Tag is too short
         if (data.minChars > tagLength) {
            valid = false;
         }

         // Tag is too long
         if (data.maxChars && (data.maxChars < tagLength)) {
            valid = false;
         }

         return valid;
      }

      this._tagExists = function(e, tag) {
         var currentTarget = $(e.currentTarget);
         var id = currentTarget.attr('id');
         var tags = currentTarget.val().split(this.opts.delimiterRegex);

         return (jQuery.inArray(tag, tags) >= 0);
      };

      this._addTag = function(e, opts) {
         var self = this;
         var tagValue = opts.tag;
         delete opts.tag;

         opts = jQuery.extend({
            focus: false,
            callback: false
         }, opts);

         this.$.each(function() {
            var $self = $(this);
            var id = $self.attr('id');
            var tags = $self.val().split(self.opts.delimiterRegex);

            if (tags[0] === '') {
               tags = [];
            }

            // Trim the new tag before continuing
            tagValue = jQuery.trim(tagValue);

            // Check for uniqueness if this option is enabled
            var skipTag = false;
            if (self.opts.unique) {
               $self.trigger('tagExists', {tag: tagValue});
               if (skipTag) {
                  // @TODO: Move these into an elements holder
                  $('#' + id + '_tag').addClass('not_valid');
               }
            }

            // Add the tag
            if (tagValue !== '' && skipTag === false) {
               // Create the remove tag element
               var anchorTagAttrs = {
                  href: '#',
                  title: 'Remove tag',
                  text: 'x'
               };
               var anchorTag = $('<a>', anchorTagAttrs).click(function(e) {
                  return methods['removeTag', id, escape(tagValue)];
               });

               // Create the inner span element
               var innerSpan = $('<span>')
                  .text(tagValue)
                  .append('&nbsp;&nbsp;');

               // Create the outer span element
               var outerSpan = $('<span>')
                  .addClass('tag')
                  .append(innerSpan, anchorTag)
                  .insertBefore('#' + id + '_addTag');

               // Add the tag to the tag list
               tags.push(tagValue);

               // Clear the input box and set the focus based on the options
               $('#' + id + '_tag').val('');
               if (opts.focus) {
                  $('#' + id + '_tag').focus();
               } else {
                  $('#' + id + '_tag').blur();
               }

               // Update the hidden tags field
               self._updateTagsField(tags);

               // @TODO: Callbacks
               // if (options.callback && tags_callbacks[id] && tags_callbacks[id]['onAddTag']) {
               //    var f = tags_callbacks[id]['onAddTag'];
               //    f.call(this, tagValue);
               // }
               // if(tags_callbacks[id] && tags_callbacks[id]['onChange'])
               // {
               //    var i = tagslist.length;
               //    var f = tags_callbacks[id]['onChange'];
               //    f.call(this, $(this), tagslist[i-1]);
               // }
            }
         });
      };

      this._resetAutosize = function(e) {
         var $elem = $(e.currentTarget);

         var minWidth =  $elem.data('minwidth') || this.opts.minInputWidth || $elem.width();
         var maxWidth = $elem.data('maxwidth') || this.opts.maxInputWidth || ($elem.closest('.tagsinput').width() - this.opts.inputPadding);
         var val = '';
         var input = $elem;
         var testSubject = $('<tester/>').css({
            position: 'absolute',
            top: -9999,
            left: -9999,
            width: 'auto',
            fontSize: input.css('fontSize'),
            fontFamily: input.css('fontFamily'),
            fontWeight: input.css('fontWeight'),
            letterSpacing: input.css('letterSpacing'),
            whiteSpace: 'nowrap'
         });
         var testerId = $elem.attr('id')+'_autosize_tester';

         if(! $('#'+testerId).length > 0){
            testSubject.attr('id', testerId);
            testSubject.appendTo('body');
         }

         input.data('minwidth', minWidth);
         input.data('maxwidth', maxWidth);
         input.data('tester_id', testerId);
         input.css('width', minWidth);
      };

      this._removeTag = function(e, tag) {
         var self = this;
         var str;
         var currentTarget = $(e.currentTarget);
         tag = unescape(tag);

         currentTarget.each(function() {
            str = '';
            var id = $(this).attr('id');
            var old = $(this).val().split(self.opts.delimiterRegex);
            console.log(old);

            $('#' + id + '_tagsinput .tag').remove();
            for (var i = 0; i < old.length; i++) {
               if (old[i] !== tag) {
                  str = str + self.opts.delimiter[id] + old[i];
               }
            }

            currentTarget.trigger('importTags', str);

            // @TODO
            // if (tags_callbacks[id] && tags_callbacks[id]['onRemoveTag']) {
            //    var f = tags_callbacks[id]['onRemoveTag'];
            //    f.call(this, tag);
            // }
         });

         return false;
      };

      this.listen = function() {
         // Bind resetAutosize event
         $(this.elementData.fakeInput).bind('resetAutosize', $.proxy(self._resetAutosize, this));

         // Bind removeTag event
         this.$.bind('removeTag', $.proxy(self._removeTag, this));

         // Bind addTag event
         this.$.bind('addTag', $.proxy(self._addTag, this));

         // Bind imporTags event
         this.$.bind('imporTags', $.proxy(self._importTags, this));

         // Bind tagExists event
         this.$.bind('tagExists', $.proxy(self._tagExists, this));
      };

      this.init = function() {
         // Hide the element if the option is set
         if (this.opts.hide) {
            this._hide();
         }

         // Generate an ID for the element if it does not have one
         var id = this._generateId();

         // Create the delimiter data object
         this.elementData = jQuery.extend({
            pid            : id,
            realInput      : '#' + id,
            holder         : '#' + id + '_tagsinput',
            inputWrapper   : '#' + id + '_addTag',
            fakeInput      : '#' + id + '_tag'
         }, this.opts);
         this.delimiter[id] = this.elementData.delimiter;

         // Modify the delimiter regex if need be
         this._updateDelimiterRegex();

         // Setup and show the markup
         this._displayMarkup();

         if (this.opts.interactive) {
            $(this.elementData.fakeInput).bind('keypress', this.elementData, function(e) {
               // Check if the character typed is a delimiter
               if (self._checkDelimiter(e)) {
                  e.preventDefault();

                  // Validate the length of the tag and add if valid
                  if (self._validateTagLength(e.data)) {
                     var tag = $(e.data.fakeInput).val();
                     self.$.trigger('addTag', {tag: tag, focus: true, unique: (self.opts.unique)});
                     $(e.data.fakeInput).trigger('resetAutosize');
                  }
                  return false;
               } else if (e.data.autosize) {
                  $(e.data.fakeInput).trigger('resetAutosize');
               }
            });

            // Delete last tag on backspace
            if (this.opts.removeWithBackspace) {
               $(this.elementData.fakeInput).bind('keydown', function(e) {
                  if (e.keyCode == 8 && $(this).val() == '') {
                     e.preventDefault();
                     var last_tag = $(this).closest('.tagsinput').find('.tag:last').text();
                     var id = $(this).attr('id').replace(/_tag$/, '');
                     last_tag = last_tag.replace(/[\s]+x$/, '');
                     $('#' + id).trigger('removeTag', escape(last_tag));
                     $(this).trigger('focus');
                  }
               });
            }
         }
      };
   };

   $.fn.tagsInput = $.fn.tagsinput = function(opts) {
      return this.each(function() {
         var instance = new Plugin.Main();
         instance.opts = opts;
         instance.$ = $(this);
         instance.run();
         instance.$.data('tagsinput', instance);
      }).parent();
   }


   // var this.$;
   // var elementData = {};
   // var delimiter = [];
   // var delimiterRegex = '/[\s,]+/';
   // var tagsCallbacks = [];

   // // Default options
   // var options = {};
   // var defaults = {
   //    // Config
   //    interactive: true,
   //    defaultText: 'add a tag',
   //    minChars: 0,
   //    delimiter: [',', ';'],
   //    joinDelimiter: ',',
   //    unique: true,
   //    removeWithBackspace: true,

   //    // UI
   //    width: '300px',
   //    height: '100px',
   //    hide: true,
   //    placeholderColor: '#666666',
   //    autosize: true,
   //    comfortZone: 20,
   //    inputPadding: 6 * 2,

   //    // Autocomplete
   //    autocomplete: {
   //       selectFirst: true
   //    }

   //    // Hooks
   // };

   // // Create the jQuery plugin
   // $.fn.tagsInput = function(methodOrOptions) {
   //    // Call method if it exists
   //    if (methods[methodOrOptions]) {
   //       var args = Array.prototype.slice.call(arguments, 1);
   //       var id = $(this).attr('id');
   //       args.splice(0, 0, '#' + id);
   //       return methods[methodOrOptions].apply(this, args);
   //    }
   //    else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
   //       // Default to init
   //       return methods.init.apply(this, arguments);
   //    }
   //    else {
   //       $.error( 'jQueryTagsInput method "' +  methodOrOptions + '" does not exist' );
   //    }
   //    console.log(methods);
   //    return false;

   //    // Do a deep copy of the options
   //    options = $.extend(true, {}, defaults, options);

   //    console.log(options);

   //    return this.each(function() {
   //       var $this = $(this);
   //       // Create a new instance for each element in the matched jQuery set
   //       // Also save the instance so it can be accessed later to use methods/properties etc
   //       // e.g.
   //       //    var instance = $('.element').data('plugin');
   //       //    instance.someMethod();
   //       $this.data('tagsinput', new Plugin($this, options));
   //    });
   // };

   // // Expose defaults and Constructor (allowing overriding of prototype methods for example)
   // $.fn.tagsInput.defaults = defaults;
   // $.fn.tagsInput.Plugin = Plugin;
}));
