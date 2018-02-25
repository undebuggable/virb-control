module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            },
            dist: {
                // the files to concatenate
                src: ['src/**/*.js'],
                // the location of the resulting JS file
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
         uglify: {
             options: {
                 banner: '/*Paweł Owczarek*/\n/*<%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %>*/\n'
             },
             dist: {
                 files: {
                     'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                 }
             }
         },
         jshint: {
             // define the files to lint
             files: ['Gruntfile.js', 'src/**/*.js'],
             // configure JSHint (documented at http://www.jshint.com/docs/)
             options: {
                 // more options here if you want to override JSHint defaults
                 globals: {
                     jQuery: true,
                     console: true,
                     module: true
                 }
             }
         }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};
