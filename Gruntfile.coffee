module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"

    # Clean task:
    clean:
      dist: ["./dist"]

    # Concat task:
    concat:
      options:
        separator: "\n\n\n"
        banner: grunt.file.read "build/banner.txt"
        footer: grunt.file.read "build/footer.txt"
      dist:
        src: ["src/core.js", "src/config.js", "src/algorithm/*.js", "src/effect/*.js"]
        dest: "./dist/<%= pkg.name.replace('-','.') %>.js"

    # Uglify task:
    uglify:
      options:
        banner: grunt.file.read "build/banner.min.txt"
      build:
        src: "<%= concat.dist.dest %>"
        dest: "./dist/<%= pkg.name.replace('-','.') %>.min.js"

    # Copy task:
    copy:
      dist:
        src: "./dist/*"
        dest: "../gh-pages/build/"
      
    # Jshint task:
    jshint:
      files: ["src/**/*.js"],
      options:
        globals:
          jQuery: true,
          console: true,
          module: true,
          document: true
        expr: true,
        strict: true,
        latedef: true

  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-contrib-jshint"

  grunt.registerTask "test",    ["jshint"]
  grunt.registerTask "default", ["clean", "jshint", "concat", "uglify", "copy"]