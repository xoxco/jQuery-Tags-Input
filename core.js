/*
 * 'Highly configurable' mutable plugin boilerplate
 * Author: @markdalgleish
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */

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
   var pluginName = 'tagsInput';

   // Create our namespace
   var PluginBase = {};

   // =========================== Plugin Core
   PluginBase.Core = {
      isInit : true,
      opts : null,
      $ : null,
      $fakeInput: null,
      $realInput: null,
      delimiter : [],
      elementData : {},
      itemsArray: [],
      config: {
         tags: '.tag'
      },
      defaultOpts : {
         // Config
         defaultText: 'add a tag',
         minChars: 0,
         // delimiter: [',', ';'],
         delimiter: [','],
         delimiterRegex: '/[\s,]+/',
         alphaNumRegex: /\w+|[áéíóúÁÉÍÓÚñÑ,/]+/,
         joinDelimiter: ',',
         unique: true,
         removeWithBackspace: true,
         readOnly: false,
         maxTags: null, // @TODO
         maxChars: null,   // @TODO
         caseSensitive: false,   // @TODO

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
         },

         // @TODO: Hooks

         // General Hooks
         afterInit: function() {},

         // Add Tag Hooks
         beforeAddTag: function() {},
         onAddTag: function() {},
         afterAddTag: function() {},

         // Remove Tag Hooks
         beforeRemoveTag: function() {},
         onRemoveTag: function() {},
         afterRemoveTag: function() {}
      }
   };

   // =========================== Plugin Setup
   PluginBase.Setup = function() {
      var Plugin = this;

      // Define our abstract functions
      Plugin.addTag = function() {};
      Plugin.removeTag = function() {};
      Plugin.removeAll = function() {};
      Plugin.importTags = function() {};
      Plugin.updateTagsField = function() {};
      Plugin.tagExists = function() {};
      Plugin.destroy = function() {};
      Plugin.items = function() {};

      Plugin.run = function(options) {
         // If we've already instanciated the element, return
         if (Plugin.core.$.data('tagsinput-init-complete')) {
            return;
         }
         Plugin.core.$.data('tagsinput-init-complete', true);

         // Configure the options
         Plugin.opts = $.extend(true, {}, Plugin.core.defaultOpts, options);

         // Plugin.listen();
         Plugin.init();

         // We're done init so set the flag
         Plugin.isInit = false;
      };
   };

   // =========================== Plugin Main
   PluginBase.Main = function() {
      PluginBase.Setup.call(this);
      var Plugin = this;
      this.core = PluginBase.Core;

      // ====================================================
      // PRIVATE METHODS
      // ====================================================

      var _importTags = function(tags, options) {
         var id = Plugin.core.$.attr('id');
         Plugin.core.$.val('');
         var tags = tags.split(Plugin.opts.delimiterRegex);
         if (tags.length) {
            $.each(tags, function(index, tagValue) {
               _addTag.call(Plugin, tagValue, {});
            });
         }

         // @TODO: onAdd event, onChange?
      };

      var _addTag = function(tagValue, options) {
         // Trim the new tag before continuing
         tagValue = jQuery.trim(tagValue);

         options = jQuery.extend({
            focus: false,
            callback: false
         }, options);

         Plugin.core.$.each(function() {
            var id = Plugin.core.$.attr('id');
            // Determine if we're trying to import a string of tags or an array
            // if (typeof tags === 'string') {
            //    // tags = Plugin.core.$.val().split(Plugin.opts.delimiterRegex);
            //    tags = tags.split(Plugin.opts.delimiterRegex);
            //    if (tags[0] === '') {
            //       tags = [];
            //    }
            // }

            var tags = $(this).val().split(Plugin.opts.delimiterRegex);
            if (tags[0] === '') {
               tags = [];
            }

            // Check for uniqueness if this option is enabled
            var skipTag = false;
            if (options.unique) {
               skipTag = _tagExists.call(this, tagValue);
               if (skipTag) {
                  // @TODO: Move these into an elements holder
                  $('#' + id + '_tag').addClass('not_valid');
               }
            }

            // Add the tag
            if (tagValue !== '' && skipTag === false) {
               // Create the remove tag element
               var anchorTagAttrs = {};
               if (Plugin.opts.readOnly !== true) {
                  anchorTagAttrs = {
                     href: '#',
                     title: 'Remove tag',
                     text: 'x'
                  };
               }

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
               $(Plugin.elementData.fakeInput).val('');
               if (options.focus) {
                  $(Plugin.elementData.fakeInput).focus();
               } else {
                  $(Plugin.elementData.fakeInput).blur();
               }

               // Update the hidden tags field
               _updateTagsField.call(Plugin, tags);

               // Set the tags array
               Plugin.itemsArray = tags;

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

      var _removeTag = function(tag) {
         var str;
         tag = unescape(tag);

         Plugin.core.$.each(function() {
            str = '';
            var $self = $(this);
            var id = $self.attr('id');
            var old = $self.val().split(Plugin.opts.delimiterRegex);
            console.log(old);

            $('#' + id + '_tagsinput .tag').remove();
            for (var i = 0; i < old.length; i++) {
               if (old[i] !== tag) {
                  str = str + Plugin.core.delimiter[id] + old[i];
               }
            }

            _importTags.call(Plugin, str);

            // @TODO
            // if (tags_callbacks[id] && tags_callbacks[id]['onRemoveTag']) {
            //    var f = tags_callbacks[id]['onRemoveTag'];
            //    f.call(this, tag);
            // }
         });
      };

      var _removeAll = function() {
         // Reset the items array
         Plugin.itemsArray = [];

         // Empty the hidden input
         $(Plugin.elementData.realInput).val('');

         // Remove the actual tag from the DOM
         $(Plugin.core.config.tags).remove();
      };

      var _tagExists = function(tag) {
         var id = Plugin.core.$.attr('id');
         var tags = $(Plugin.elementData.realInput).val().split(Plugin.opts.delimiterRegex);

         return (jQuery.inArray(tag, tags) >= 0);
      };

      var _generateId = function() {
         var id = Plugin.core.$.attr('id');

         // If the element does not have an ID, generate a new one
         if (!id || Plugin.core.delimiter[id]) {
            id = 'tags' + new Date().getTime();
            Plugin.core.$.attr('id', id);
         }

         return id;
      };

      var _hide = function() {
         Plugin.core.$.hide();
      };

      var _displayMarkup = function() {
         var id = Plugin.core.$.attr('id');
         var markup = '<div id="' + id + '_tagsinput" class="tagsinput"><div id="' + id +'_addTag">';

         if (Plugin.opts.readOnly !== true) {
            markup = markup + '<input id="' + id + '_tag" value="" data-default="' + Plugin.opts.defaultText + '" />';
         }

         markup = markup + '</div><div class="tags_clear"></div></div>';
         $(markup).insertAfter(Plugin.core.$);

         // Apply CSS options to the markup
         $(Plugin.core.elementData.holder).css('width', Plugin.opts.width);
         $(Plugin.core.elementData.holder).css('min-height', Plugin.opts.height);
         $(Plugin.core.elementData.holder).css('height', '100%');
      };

      var _updateDelimiterRegex = function() {
         var matchString = '';
         $.each(Plugin.opts.delimiter, function(index, val) {
            matchString = matchString + val;
         });
         var regexString = '[\\s' + matchString + ']+';
         Plugin.opts.delimiterRegex = new RegExp(regexString, 'i');
      };

      var _validateTagLength = function(tag) {
         var valid = true;
         var tagLength = tag.length;

         // Tag is too short
         if (Plugin.opts.minChars > tagLength) {
            valid = false;
         }

         // Tag is too long
         if (Plugin.opts.maxChars && (Plugin.opts.maxChars < tagLength)) {
            valid = false;
         }

         return valid;
      };

      var _checkDelimiter = function(e) {
         if (e.which == 13) {
            return true;
         }

         for (var delimiter in Plugin.core.delimiter) {
            if (e.which == delimiter.charCodeAt(0)) {
               return true;
            }
         }

         return false;
      };

      var _updateTagsField = function(tagsArray) {
         var id = Plugin.core.$.attr('id');
         $(Plugin.elementData.realInput).val(tagsArray.join(Plugin.opts.joinDelimiter));
      };

      var _resetInput = function() {
         var $fakeInput = $(Plugin.elementData.fakeInput);
         $fakeInput.val( $fakeInput.attr('data-default') );
         $fakeInput.css('color', Plugin.opts.placeholderColor);
      };

      var _doAutosize = function() {
         var $fakeInput = $(Plugin.elementData.fakeInput);
         var minWidth = $fakeInput.data('minwidth');
         var maxWidth = $fakeInput.data('maxwidth');
         var val = '';
         var input = $fakeInput;
         var testSubject = $('#' + $fakeInput.data('tester_id'));


         if (val === (val = input.val())) {return;}

         // Enter new content into testSubject
         var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
         testSubject.html(escaped);

         // Calculate new width + whether to change
         var testerWidth = testSubject.width();
         var newWidth = (testerWidth + Plugin.opts.comfortZone) >= minWidth ? testerWidth + Plugin.opts.comfortZone : minWidth;
         var currentWidth = input.width();
         var isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth) || (newWidth > minWidth && newWidth < maxWidth);

         // Animate width
         if (isValidWidthChange) {
            input.width(newWidth);
         }
      };

      var _resetAutosize = function() {
         var $fakeInput = $(Plugin.elementData.fakeInput);
         var minWidth =  $fakeInput.data('minwidth')
            || Plugin.opts.minInputWidth
            || $fakeInput.width();

         var maxWidth = $fakeInput.data('maxwidth')
            || Plugin.opts.maxInputWidth
            || ($fakeInput.closest('.tagsinput').width() - Plugin.opts.inputPadding);

         var val = '';
         var input = $fakeInput;
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
         var testerId = $fakeInput.attr('id')+'_autosize_tester';

         if(! $('#'+testerId).length > 0){
            testSubject.attr('id', testerId);
            testSubject.appendTo('body');
         }

         input.data('minwidth', minWidth);
         input.data('maxwidth', maxWidth);
         input.data('tester_id', testerId);
         input.css('width', minWidth);
      };

      // ====================================================
      // PUBLIC METHODS
      // ====================================================

      Plugin.init = function() {
         console.log(Plugin.opts);
         // Hide the element if the option is set
         if (Plugin.opts.hide) {
            _hide.call(Plugin);
         }

         // Generate an ID for the element if it does not have one
         var id = _generateId.call(Plugin);

         // Create the delimiter data object
         Plugin.elementData = jQuery.extend({
            pid            : id,
            realInput      : '#' + id,
            container      : '#' + id + '_tagsinput',
            inputWrapper   : '#' + id + '_addTag',
            fakeInput      : '#' + id + '_tag'
         }, Plugin.opts);

         Plugin.core.delimiter[id] = Plugin.elementData.delimiter;

         // Modify the delimiter regex if need be
         _updateDelimiterRegex.call(Plugin);

         // Setup and show the markup
         _displayMarkup.call(Plugin);

         // Get the jquery objects for our elements
         Plugin.core.$realInput = $(Plugin.elementData.realInput);
         Plugin.core.$fakeInput = $(Plugin.elementData.fakeInput);
         Plugin.core.$container = $(Plugin.elementData.container);

         // Import initial tags if we have any
         var realInputValue = Plugin.core.$realInput.val()
         if (realInputValue !== '') {
            _importTags.call(Plugin, realInputValue);
         }

         if (Plugin.opts.readOnly !== true) {
            // Set the default text and color
            _resetInput.call(Plugin);

            // Setup the autosize listener
            _resetAutosize.call(Plugin);

            // Set the focus on the field when clicking on the container
            $(Plugin.elementData.holder).bind('click', function(e) {
               Plugin.core.$fakeInput.focus();
            });

            // When the field is focused, empty it if it contains the prompt text
            Plugin.core.$fakeInput.bind('focus',function(e) {
               if (Plugin.core.$fakeInput.val() === Plugin.core.$fakeInput.attr('data-default')) {
                  $(Plugin.elementData.fakeInput).val('');
               }
               Plugin.core.$fakeInput.css('color','#000000');
            });

            Plugin.core.$fakeInput.bind('keypress', function(e) {
               var $self = $(this);
               // Check if the character typed is a delimiter
               if (_checkDelimiter.call(Plugin, e)) {
                  e.preventDefault();

                  // Validate the length of the tag and add if valid
                  var tag = $self.val();
                  if (_validateTagLength.call(Plugin, tag)) {
                     _addTag.call(this, tag, {focus: true, unique: (Plugin.opts.unique)});
                     // $self.trigger('resetAutosize');
                     _resetAutosize.call(Plugin);
                     // @TODO: Need to add this as a trigger in "listen"
                  }
                  return false;
               } else if (Plugin.opts.autosize) {
                  // Plugin.core.$fakeInput.trigger('resetAutosize');
                  _doAutosize.call(Plugin);
                     // @TODO: Need to add this as a trigger in "listen"
               }
            });

            // Autocomplete
            if (Plugin.autocomplete) {
               // @TODO: autocomplete
            } else {
               // if a user tabs out of the field, create a new tag
               // this is only available if autocomplete is not used.
               Plugin.core.$fakeInput.bind('blur', function(event) {
                  var defaultText = $(this).attr('data-default');

                  // If the field is not empty and does not equal the default text
                  var currentValue = Plugin.core.$fakeInput.val();
                  if (currentValue !== '' && currentValue !== defaultText) {
                     // If the text passes length validation, add it
                     if (_validateTagLength.call(Plugin, currentValue)) {
                        _addTag.call(this, tag, {focus: true, unique: (Plugin.opts.unique)});
                     }
                  } else {
                     // Reset the default text and color
                     _resetInput.call(this);
                  }
                  return false;
               });
            }

            // Delete last tag on backspace
            if (Plugin.opts.removeWithBackspace) {
               $(Plugin.elementData.fakeInput).bind('keydown', function(e) {
                  var $self = $(this);
                  if (e.keyCode == 8 && $self.val() == '') {
                     e.preventDefault();
                     var last_tag = $self.closest('.tagsinput').find('.tag:last').text();
                     var id = $self.attr('id').replace(/_tag$/, '');
                     last_tag = last_tag.replace(/[\s]+x$/, '');

                     // Remove the tag
                     _removeTag.call(this, escape(last_tag));
                     $self.trigger('focus');
                  }
               });
            }

            // Remove the focus from the field
            Plugin.core.$fakeInput.blur();

            // Remove the not_valid class when user changes the value of the fake input
            if (Plugin.opts.unique) {
               Plugin.core.$fakeInput.keydown(function(e) {
                  if(e.keyCode == 8 || String.fromCharCode(e.which).match(Plugin.opts.alphaNumRegex)) {
                     $fakeInput.removeClass('not_valid');
                  }
               });
            }
         } // End settings.readOnly
      };

      Plugin.addTag = function(tags) {
         _addTag.call(this, tags);
      };

      Plugin.items = function() {
         return Plugin.itemsArray;
      };

      Plugin.removeAll = function() {
         _removeAll();
      };

      Plugin.destroy = function() {
         console.log(Plugin.core);
         Plugin.core.$container.remove();
         Plugin.core.$realInput.show();
         Plugin.core.$realInput.removeData('tagsInput');
      };

      Plugin.importTags = function(tags, options) {
         if (options.removeAll) {
            _removeAll();
         }
         // _addTag.call(this, tags);
         // console.log(test2);
      };
   };

   $.fn.tagsInput = $.fn.tagsinput = function(methodOrOptions, methodArgs, methodOpts) {
      var results = [];

      this.each(function() {
         // Use an existing plugin instance from the element if we have one. If not, create a new instance
         var elementDataInstance = $(this).data('tagsInput');
         var instance = (elementDataInstance === undefined) ? new PluginBase.Main() : elementDataInstance;
         methodOpts = methodOpts || {};

         // Calling an existing method
         if (typeof methodOrOptions === 'string' && instance[methodOrOptions]) {
            var args = Array.prototype.slice.call(arguments, 1);
            var id = $(this).attr('id');
            args.splice(0, 0, methodArgs);
            args.splice(1, 0, methodOpts);
            var retVal = instance[methodOrOptions].apply(instance, args);

            if (retVal !== undefined) {
               results.push(retVal);
            }
            // return instance[methodOrOptions].apply(instance, args);
         } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            // Default to init
            instance.core.$ = $(this);
            instance.run(methodOrOptions);

            // Set the element's plugin data
            instance.core.$.data('tagsInput', instance);
         } else {
            $.error( 'jQueryTagsInput method "' +  methodOrOptions + '" does not exist' );
         }
      }).data(pluginName);

      // If we made a function call, return the results
      if (typeof methodOrOptions === 'string') {
         return results.length > 1 ? results : results[0];
      } else {
         return results;
      }
   };
}));
