var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var _ = require("underscore");
var serveStatic = require('serve-static');
var Movie = require("./models/movie");
var User = require("./models/user");
var cookieParser = require('cookie-parser');
var session = require('express-session');
var port = process.env.PORT || 3000;
var app = express();//启动服务器

mongoose.connect("mongodb://127.0.0.1/imooc");

app.set("views", "./views/pages");//设置视图的根目录
app.set("view engine", "jade");//设置模板引擎

app.use(require('body-parser').urlencoded({extended: true}));//将表单数据格式化
//app.use(express.static(path.join(__dirname, "bower_components")));//静态资源获取

app.use(cookieParser());
app.use(session({
    secret: 'imooc'
}));

app.use(serveStatic('./public'));
app.locals.moment = require("moment");
app.listen(port);

console.log("server start on port " + port);

//signup
app.post("/user/signup", function(req, res) {
	var _user = req.body.user;

	User.find({name: _user.name}, function(err, user) {
		if(err) {
			console.log(err);
		}

		if(user.length !== 0) {
			return res.redirect("/");
		}else {
			var user = new User(_user);
			user.save(function(err, user) {
				if(err) {
					console.log(err);
				}
				res.redirect("/admin/userlist");
			});
		}
	});
});

//signin
app.post("/user/signin", function(req, res) {
	var _user = req.body.user;
	var name = _user.name;
	var password = _user.password;

	User.findOne({name: name}, function(err, user) {
		if(err) {
			console.log(err);
		}

		if(user === null) {
			return res.redirect("/");
		}

		user.comparePassword(password, function(err, isMatch) {
			if(err) {
				console.log(err);
			}

			if(isMatch) {
				req.session.user = user;
				return res.redirect("/");
			}else {
				console.log("Password is not matched");
			}
		});
	});
});

app.get("/", function(req, res) {
	console.log("user is session ");
	console.log(req.session.user);
	Movie.fetch(function(err, movies) {
		if(err) {
			console.log(err);
		}

		res.render("index", {
			title: "首页",
			movies: movies
		});
	});
});

app.get("/movie/:id", function(req, res) {
	var id = req.params.id;

	Movie.findById(id, function(err, movie) {
		res.render("detail", {
			title: "详情页",
			movie: movie
		});
	});
	
});

app.get("/admin/movie", function(req, res) {
	res.render("admin", {
		title: "后台录入页",
		movie: {
			title: "",
			doctor: "",
			country: "",
			year: "",
			poster: "",			
			flash: "",
			summary: "",					
			language: ""
		}
	});
});

//admin update movie
app.get("/admin/update/:id", function(req, res) {
	var id = req.params.id;

	if(id) {
		Movie.findById(id, function(err, movie) {
			res.render("admin", {
				title: "后台更新页",
				movie: movie
			});
		});
	}
});

//admin post movie
app.post("/admin/movie/new", function(req, res) {
	var id = req.body.movie._id;
	var movieObj = req.body.movie;

	if(id !== "undefined") {
		Movie.findById(id, function(err, movie) {
			if(err) {
				console.log(err);
			}

			_movie = _.extend(movie, movieObj);
			_movie.save(function(err, movie){
				if(err) {
					console.log(err);
				}

				res.redirect("/movie/" + movie._id);
			});
		}); 
	}else {
		_movie = new Movie({
			doctor: movieObj.doctor,
			title: movieObj.title,
			country: movieObj.country,
			language: movieObj.language,
			year: movieObj.year,
			poster: movieObj.poster,
			summary: movieObj.summary,
			flash: movieObj.flash
		});

		_movie.save(function(err, movie){
			if(err) {
				console.log(err);
			}

			res.redirect("/movie/" + movie._id);
		});
	}
});

app.get("/admin/list", function(req, res) {
	Movie.fetch(function(err, movies) {
		if(err) {
			console.log(err);
		}

		res.render("list", {
			title: "列表页",
			movies: movies
		});
	});
});


//list delete movie
app.delete("/admin/list", function(req, res) {
	var id = req.query.id;
	console.log(id);
	if(id) {
		Movie.remove({_id: id}, function(err, movie) {
			if(err) {
				console.log(err);
			}else {
				res.json({success: 1});
			}
		});
	}
});

//userlist page
app.get("/admin/userlist", function(req, res) {
	User.fetch(function(err, users) {
		if(err) {
			console.log(err);
		}

		res.render("userlist", {
			title: "用户列表页",
			users: users
		});
	});
});