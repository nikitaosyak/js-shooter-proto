
module.exports = function(grunt) {
    grunt.initConfig({
        connect: {
            server: {
                options: {
                    keepalive: true,
                    port: 8080,
                    base: './src/'
                }
            }
        }
    })
    grunt.loadNpmTasks('grunt-contrib-connect');    
    grunt.registerTask('default', ['connect']);
}
