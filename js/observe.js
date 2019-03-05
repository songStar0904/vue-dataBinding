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
class Dep {
	constructor () {
		this.subs = []
	}
	addDep (sub) {
		this.subs[0] = sub
	}
	removeSub (sub) {
		let index =  this.subs.indexOf(sub)
		if (index !== -1) {
			this.subs.splice(index, 1)
		}
	}
	notify () {
		this.subs.forEach(sub => {
			sub.update()
			console.log(sub)
		})
	}
}
Dep.target = null;
