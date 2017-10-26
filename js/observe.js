
function observe(data){
	if(!data || typeof data !== 'object'){
		return ;
	}
	Object.keys(data).forEach(function(key){
		defineReactive(data, key, data[key]);
	});
}
function defineReactive(data, key, val){
	observe(val);
	var dep = new Dep();
	Object.defineProperty(data, key, {
		enumerable: true, // 可枚举
		configurable: false, // 不能再define
		get: function(){
			Dep.target && dep.addDep(Dep.target);
			return val;
		},
		set: function(newVal){
			console.log('监听成功', val + '-->' + newVal);
			val = newVal;
			dep.notify();
		}
	})
}
function Dep(){
	this.subs = [];
}
Dep.prototype = {
	addDep: function (sub){
		this.subs[0] = (sub);
	},
	notify: function(){
		console.log(this.subs)
		this.subs.forEach(function(sub){
			sub.update();
		})
	},
	removeSub: function(sub){
		var index = this.subs.indexOf(sub);
		if (index !== -1) {
			this.subs.splice(index, 1);
		}
	}
}
Dep.target = null;