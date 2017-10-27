/**
 * @Author   songStar
 * @DateTime 2017-10-27
 * @version  v1.0
 * @param    {[type]}
 * @param    {[type]}
 * @param    {Function}
 */
function Watcher(vm, exp, fn){
	this.fn = fn;
	this.vm = vm;
	this.exp = exp;
	this.value = this.get();
	if (typeof fn == 'function') {
		this.getter = fn
	}
}
Watcher.prototype = {
	update: function() {
		this.run(); // 属性值变化收到通知
	},
	get: function() {
		Dep.target = this;
		var value = this.vm[this.exp];
		Dep.target = null;
		return value;
	},
	run: function() {
		var value = this.get();
		var oldVal = this.value;
		if (value !== oldVal) {
			this.value = value;
			this.fn.call(this.vm, value, oldVal);
		}
	}
}