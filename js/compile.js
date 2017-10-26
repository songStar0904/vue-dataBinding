
function Compile(el, vm){
	console.log(this)
	this.vm = vm;
	this.$el = this.isElementNode(el) ? el : document.querySelector(el);
	if(this.$el){
		this.fragment = this.nodeFragment(this.$el);
		this.init();
		this.$el.appendChild(this.fragment);
	}
}
Compile.prototype = {
	init: function (){
		this.compileElement(this.fragment);
	},
	nodeFragment: function(el){
		var fragment = document.createDocumentFragment(), child;
		while (child = el.firstChild) {
			fragment.appendChild(child)
		}
		return fragment;
	},
	compileText: function(node, exp) {
		compileUtil.text(node, this.vm, exp);
	},
	isDirective: function(attr) {
		return attr.indexOf('v-') == 0;
	},			
	isEventDirective: function(dir) {
		return dir.indexOf('on') === 0;
	},
	isElementNode: function(node) {
        return node.nodeType == 1;
    },
	isTextNode: function(node) {
        return node.nodeType == 3;
    },
	compileElement: function(el){
		var childNodes = el.childNodes, self = this;
		console.log(childNodes);
		[].slice.call(childNodes).forEach(function(node){
			var text = node.textContent,
			    reg = /\{\{(.*)\}\}/;
			if (self.isElementNode(node)) {
				self.compile(node);
			} else if (self.isTextNode(node) && reg.test(text)) {
				// console.log(node, RegExp.$1);
				self.compileText(node, RegExp.$1);
			}
			// 遍历编译子节点
			if (node.childNodes && node.childNodes.length) {
				self.compileElement(node);
			}
		})
	},
	compile: function(node){
		var nodeAttrs = node.attributes, self = this;
		console.log(node);
		[].slice.call(nodeAttrs).forEach(function(attr){
			// 规定v-xx指令
			var attrName = attr.name;
			console.log(attrName)
			if (self.isDirective(attrName)) {
				var exp = attr.value;
				console.log(exp)
				var dir = attrName.substring(2); //text/model...
				if (self.isEventDirective(dir)) {
					// 事件指令 如v-on:click
					compileUtil.eventHandler(node, self.vm, exp, dir);
				} else {
					// 暂时只做v-text,v-model
					compileUtil[dir] && compileUtil[dir](node, self.vm, exp);
				}
			}
		})
	}
};
// 指令处理集合
var compileUtil = {
	text: function(node, vm, exp) {
		console.log(node, vm, exp)
		this.bind(node, vm, exp, 'text');
	},
	model: function(node, vm, exp) {
		this.bind(node, vm, exp, 'model');

		var self = this,
		    val = this.getVMVal(vm, exp);
		node.addEventListener('input', function(e){
			var newVal = e.target.value;
			if (val === newVal) {
				return ;
			}

			self.setVMval(vm, exp, newVal);
			val = newVal;
		})
	},
	// 事件处理
	eventHandler: function(node, vm, exp, dir) {
		var eventType = dir.split(':')[1],
		    fn = vm.options.methods && vm.options.methods[exp];
		    console.log('vm:  '+ vm.options.methods[exp])
		if (eventType && fn) {
			node.addEventListener(eventType, fn.bind(vm), false);
		}
	},
	getVMVal: function(vm, exp){
		var val = vm;
		exp = exp.split('.');
		exp.forEach(function(k){
			val = val[k];
		})
		console.log('val = '+val);
		return val;
	},
	setVMval: function(vm, exp, newVal){
		var val = vm;
		exp = exp.split('.');
		exp.forEach(function(k, i){
			// 非最后一个key，更新val
			if (i < exp.length - 1) {
				val = val[k];
			} else {
				val[k] = newVal;
			}
		})
	},
	bind: function(node, vm, exp, dir){
		console.log('dir=' +dir, 'vm='+vm)
		var updaterFn = updater[dir + 'Updater'];
		// 第一次初始化视图
		updaterFn && updaterFn(node, vm[exp]);
		new Watcher(vm, exp, function(val, oldVal){
			updaterFn && updaterFn(node, val, oldVal);
		})
	}
};
var updater = {
	textUpdater: function(node, val){
		node.textContent = typeof val == 'undefined' ? '' : val;
	},
	modelUpdater: function(node, val, oldVal) {
		node.value = typeof val == 'undefined' ? '' : val;
	}
}