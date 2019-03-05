
// var data = {name: 'sx'};
// observe(data);
// data.name = 'songstar';
/**
 * @Author   songStar
 * @DateTime 2017-10-26
 * @version  v1.0
 * @param    {Vue参数}
 */
class Vue {
	constructor (options) {
		console.log(options)
		this.options = options
		this.data = options.data
		Object.keys(this.data).forEach(key => {
			this.proxy(key)
		})
		observe(this.data, this)
		this.compile = new Compile(options.el || document.body, this)
	}
	proxy (key) {
		Object.defineProperty(this, key, {
			configurable: false,
			enumerable: true,
			get: () => {
				return this.data[key]
			},
			set: (val) => {
				this.data[key] = val
			}
		})
	}
}