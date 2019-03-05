/**
 * @Author   songStar
 * @DateTime 2017-10-27
 * @version  v1.0
 * @param    {[type]}
 * @param    {[type]}
 * @param    {Function}
 */
class Watcher {
	constructor (vm, exp, fn) {
		this.fn = fn
		this.vm = vm
		this.exp = exp
		this.value = this.get()
		if (typeof fn == 'function') {
			this.getter = fn
		}
	}
	update () {
		this.run() // 属性值变化收到通知
	}
	get () {
		Dep.target = this
		let value = this.vm[this.exp]
		Dep.target = null
		return value
	}
	run () {
		let value = this.get()
		let oldVal = this.value
		if (value !== oldVal) {
			this.value = value
			this.fn.call(this.vm, value, oldVal)
		}
	}
}