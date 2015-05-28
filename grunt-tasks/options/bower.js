module.exports = {
   install: {
      options: {
         targetDir: './lib',
         layout: 'byType',
         install: true,
         verbose: true,
         cleanTargetDir: false,
         cleanBowerDir: true,
         bowerOptions: {
            forceLatest: true
         }
      }
   }
};
