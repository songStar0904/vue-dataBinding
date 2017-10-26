
// var data = {name: 'sx'};
// observe(data);
// data.name = 'songstar';
function Vue(options){
	this.options = options;
	this.data = options.data, self = this;
	Object.keys(this.data).forEach(function(key){
		self.proxy(key);
	});
	observe(this.data, this);
	this.compile = new Compile(options.el || document.body, this);
}
Vue.prototype = {
	proxy: function(key){
		var self = this;
		Object.defineProperty(self, key, {
			configurable: false,
			enumerable: true,
			get: function (){
				return self.data[key];
			},
			set: function(val){
				self.data[key] = val;
			}
		})
	}
}