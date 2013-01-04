module.exports = function(grunt) {

  // Configure Grunt
  grunt.initConfig({

    requirejs: {
      compile: {
        options: {
          mainConfigFile: "build.js"
        }
      }
    },
    // minify the optimized library file
    min: {
      "dist/fluid-grid.min.js": "dist/fluid-grid.js"
    }
  });

  // Load external tasks
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Make task shortcuts
  grunt.registerTask('default', 'requirejs min');

};