describe('jquery.tagsinput', function() {
   testPlugin('<input type="text" value="tag1,tag2" />', function() {
      it('has a default ID', function() {
         expect(this.$element.attr('id').substring(0, 4)).toEqual('tags');
      });
   });
});
