module.exports = function(grunt) {
	grunt.initConfig({
		watch: {
			jade: {
				files: ["views/**"],
				options: {
					livereload: true
				}
			},
			js: {
				files: ["public/js/**", "models/**/*.js", "schemas/**/*.js"],
				tasks: ["jshint"],
				options: {
					livereload: true
				}
			}
		},

		nodemon: {
			dev: {
				options: {
					file: "app.js",
					args: [],
					ignoredFiles: ["README.md", "node_modules/**", ".DS_Store"],
					watchedExtensions: ["js"],
					watchedFolders: ["./"],
					debug: true,
					delayTime: 1,
					env: {
						PORT: 3000
					},
					cwd: __dirname
				}
			}
		},

		concurrent: {
			tasks: ["nodemon", "watch"],
			options: {
				logConcurrentOutput: true
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-watch");//有文件添加修改删除，重新执行任务
	grunt.loadNpmTasks("grunt-nodemon");//实时监听app.js入口文件，重新执行任务
	grunt.loadNpmTasks("grunt-concurrent");//如sass/less编译后，重新执行任务

	grunt.option("force", true);//避免因语法错误而中断服务
	grunt.registerTask("default", ["concurrent"]);
};