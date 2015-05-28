describe('jquery.tagsinput', function() {
   describe('it creates a valid instance', function() {
      testPlugin('<input type="text" />', function() {
         it('has a default ID', function() {
            expect(this.$element.attr('id').substring(0, 4)).toEqual('tags');
         });

         it('has a default ADD text', function() {
            var inputId = this.$element.attr('id');
            expect(this.$sandbox.find('#' + inputId + '_tag').attr('data-default')).toEqual('add a tag');
         });

         it("should hide input", function() {
            expect(this.$element.css('display')).toBe('none');
         });

      });

      testPlugin('<input type="text" value="tag1,tag2" />', function() {
         it('should have 2 tags', function() {
            expect(this.$element.val()).toEqual('tag1,tag2');
         });

         it("should hide input", function() {
            expect(this.$element.css('display')).toBe('none');
         });
      });
   });

   describe('should add a tag', function() {
      testPlugin('<input type="text" />', function() {
         // @TODO: Move to methods tests
         it('that is not a duplicate', function() {
            this.$element.addTag('test-tag');
            expect(this.$element.val()).toEqual('test-tag');
         });

         it('when pressing ENTER', function() {
            this.$element.val('some_tag');
            this.$element.trigger($.Event('keypress', { which: 13 }));
            expect(this.$element.val()).toEqual('some_tag');
         });

         it('when pressing COMMA', function() {
            this.$element.val('some_tag');
            this.$element.trigger($.Event('keypress', { which: 44 }));
            expect(this.$element.val()).toEqual('some_tag');
         });

         it('when adding boolean false', function() {
            this.$element.addTag(false, {unique: true});
            expect(this.$element.val()).toEqual('false');
         });

         it('when adding boolean true', function() {
            this.$element.addTag(true, {unique: true});
            expect(this.$element.val()).toEqual('true');
         });
      });
   });

   describe('should not add tags', function() {
      testPlugin('<input type="text" />', function() {
         it('when adding same item twice', function() {
            this.$element.addTag('some_tag', {unique: true});
            this.$element.addTag('some_tag', {unique: true});
            expect(this.$element.val()).toEqual('some_tag');
         });

         it('when adding an empty string', function() {
            this.$element.addTag('', {unique: true});
            expect(this.$element.val()).toEqual('');
         });

         it('when adding whitespace string', function() {
            this.$element.addTag(' ', {unique: true});
            expect(this.$element.val()).toEqual('');
         });

         it('when adding undefined', function() {
            this.$element.addTag(undefined, {unique: true});
            expect(this.$element.val()).toEqual('');
         });

         it('when adding null', function() {
            this.$element.addTag(null, {unique: true});
            expect(this.$element.val()).toEqual('');
         });
      });
   });

   describe('should import tags', function() {
      testPlugin('<input type="text" />', function() {
         it('should have 1 tag', function() {
            this.$element.importTags('some_tag');
            expect(this.$element.val()).toEqual('some_tag');
         });

         it('should have 2 tags', function() {
            this.$element.importTags('some_tag, second_tag');
            expect(this.$element.val()).toEqual('some_tag,second_tag');
         });
      });
   });

   describe('should remove tags', function() {
      testPlugin('<input type="text" value="some_tag, some_other_tag" />', function() {
         it('when the tag is present', function() {
            this.$element.removeTag('some_tag');
            expect(this.$element.val()).toEqual('some_other_tag');
         });

         it('when the tag is not present', function() {
            this.$element.removeTag('another_tag');
            expect(this.$element.val()).toEqual('some_tag,some_other_tag');
         });

         it('when clicking on a tag\'s "x"', function() {
            this.$sandbox.find('.tag:first-child a').trigger($.Event('click'));
            expect(this.$element.val()).toEqual('some_other_tag');
         });
      });
   });

   describe('should check if a tag exists', function() {
      testPlugin('<input type="text" />', function() {
         it('when the tag is present', function() {
            this.$element.addTag('some_tag');
            expect(this.$element.tagExist('some_tag')).toBe(true);
         });

         it('when the tag is not present', function() {
            this.$element.addTag('some_tag');
            expect(this.$element.tagExist('some_other_tag')).toBe(false);
         });
      });
   });
});
