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
    uglify: {
    	compile: {
    		src: 'dist/fluid-grid.js',
    		dest: 'dist/fluid-grid.min.js'
        }
    }
  });

  // Load external tasks
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  
  // Make task shortcuts
  grunt.registerTask('default', ['requirejs:compile', 'uglify:compile']);

};