var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var serveStatic = require('serve-static');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoStore = require("connect-mongo")(session);
var logger = require('morgan');
var port = process.env.PORT || 3000;
var app = express();//启动服务器

var dbUrl = "mongodb://127.0.0.1/imooc";

mongoose.connect(dbUrl);

app.set("views", "./app/views/pages");//设置视图的根目录
app.set("view engine", "jade");//设置模板引擎

app.use(require('body-parser').urlencoded({extended: true}));//将表单数据格式化
//app.use(express.static(path.join(__dirname, "bower_components")));//静态资源获取

app.use(cookieParser());
app.use(session({
    secret: 'imooc',
    resave: false,
    key: "",
    saveUninitialized: true,
    cookie: {maxAge: 80000},
    store: new mongoStore({
    	url: dbUrl,
    	collection: "sessions"
    })
}));

//配置报错信息
if("development" === app.get("env")) {//如果是开发环境
	app.set("showStackError", true);
	app.use(logger("This is a customer format. :method :url :status"));
	app.locals.pretty = true;//代码可读性
	mongoose.set("debug", true);//调试
}

require("./config/routes")(app);

//app.use(serveStatic('./public'));
app.use(express.static(path.join(__dirname, "public")));

app.locals.moment = require("moment");
app.listen(port);

console.log("server start on port " + port);

