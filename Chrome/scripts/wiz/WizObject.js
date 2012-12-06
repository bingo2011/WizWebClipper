/**
 * @author rechie
 */

/**
 * 文件夹信息
 */

// 'use strict';
var CategoryInfo = {
	createNew : function(name, location) {
		var category = {};
		category.name = name;
		category.location = location;
		category.getLocation = function() {
			return this.location;
		};
		category.getName = function() {
			return this.name;
		};
		return category;
	}
}

/**
 * 标签信息
 */
var Tag = function(name) {
	Tag.prototype.name = name;
}
Tag.prototype.setTagGuid = function(tagGuid) {
	Tag.prototype.tagGuid = tagGuid;
}
Tag.prototype.setParentGuid = function(parentGuid) {
	Tag.prototype.parentGuid = parentGuid;
}


var HashMap = function() {
	/** Map 大小 **/
	var size = 0;
	/** 对象 **/
	var entry = new Object();

	/** 存 **/
	this.put = function(key, value) {
		if (!this.containsKey(key)) {
			size++;
		}
		entry[key] = value;
	}
	/** 取 **/
	this.get = function(key) {
		return this.containsKey(key) ? entry[key] : null;
	}
	/** 删除 **/
	this.remove = function(key) {
		if (this.containsKey(key) && (
		delete entry[key] )) {
			size--;
		}
	}
	/** 是否包含 Key **/
	this.containsKey = function(key) {
		return ( key in entry);
	}
	/** 是否包含 Value **/
	this.containsValue = function(value) {
		for (var prop in entry) {
			if (entry[prop] == value) {
				return true;
			}
		}
		return false;
	}
	/** 所有 Value **/
	this.values = function() {
		var values = new Array();
		for (var prop in entry) {
			values.push(entry[prop]);
		}
		return values;
	}
	/** 所有 Key **/
	this.keys = function() {
		var keys = new Array();
		for (var prop in entry) {
			keys.push(prop);
		}
		return keys;
	}
	/** Map Size **/
	this.size = function() {
		return size;
	}
	/* 清空 */
	this.clear = function() {
		size = 0;
		entry = new Object();
	}
	/**
	 * 模糊查询，返回value数组
	 */
	this.fuzzySearch = function(fuzzyKey) {
		var values = new Array();
		var reg = new RegExp(fuzzyKey);
		for (var key in entry) {
			if (reg.test(key)) {
				values.push(entry[key]);
			}
		}
		return values;
	}
}