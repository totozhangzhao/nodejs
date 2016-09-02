var mongoose = require("mongoose");
mongoose.Promise = require('bluebird');
var bcrypt = require("bcrypt");//专门为密码存储设计的算法
var SALT_WORK_FACTOR = 10;

var UserSchema = new mongoose.Schema({
	name: {
		unique: true,
		type: String
	},
	password: String,
	//0普通用户
	//1邮箱验证用户
	//2高级用户

	//>10 admin
	//>50 super admin
	role: {
		type: Number,
		default: 0
	},//角色
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
});
//每次存储数据前
UserSchema.pre("save", function(next) {
	if(this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now();
	}else {
		this.meta.updateAt = Date.now();
	}
	
	var user = this;
	
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		
		if(err) return next(err);

		bcrypt.hash(user.password, salt, function(err, hash) {

			if(err) return next(err);

			user.password = hash;

			next();
		});
	});//生成随机的盐
	//next();
});

UserSchema.methods = {
	comparePassword: function(_password, cb) {
		var user = this;

		bcrypt.compare(_password, user.password, function(err, isMatch) {
			if(err) return cb(err);
			cb(null, isMatch);
		});
	}
};

UserSchema.statics = {
	//取出数据库中所有数据
	fetch: function(cb) {
		return this
			.find({})
			.sort("meta.updateAt")//按更新时间排序
			.exec(cb);
	},
	//查询单条数据
	findById: function(id, cb) {
		return this
			.findOne({_id: id})
			.exec(cb);
	}
};

module.exports = UserSchema;










