/**
 * @Author   songStar
 * @DateTime 2017-10-27
 * @version  v1.0
 * @param    {[type]}
 * @return   {[type]}
 */
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
			console.log(dep)
		}
	})
}
function Dep(){
	this.subs = [];
}
Dep.prototype = {
	addDep: function (sub){
		this.subs[0] = sub
	},
	notify: function(){
		this.subs.forEach(function(sub){
			sub.update();
			console.log(sub)
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