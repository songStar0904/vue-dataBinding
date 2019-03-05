/**
 * @Author    songStar
 * @DateTime  2017-10-26
 * @version   v1.0
 * @param     {绑定的el}
 * @param     {Vue对象}
 * 因为遍历解析的过程有多次操作dom节点，为提高性能和效率，
 * 会先将跟节点el转换成文档碎片fragment进行解析编译操作，解析完成，再将fragment添加回原来的真实dom节点中
 */

class Compile {
	constructor(el, vm) {
		this.vm = vm
		this.$el = this.isElementNode(el) ? el : document.querySelector(el)
		if (this.$el) {
			this.fragment = this.nodeFragment(this.$el)
			this.init()
			this.$el.appendChild(this.fragment)
		}
	}
	init() {
		this.compileElement(this.fragment)
	}
	nodeFragment(el) {
		let fragment = document.createDocumentFragment(), child
		while (child = el.firstChild) {
			fragment.appendChild(child)
		}
		return fragment
	}
	compileText(node, exp) {
		compileUtil.text(node, this.vm, exp)
	}
	// 规范v-on
	getAttrName(atterName) {
		let tag = atterName[0]
		switch (tag) {
			case '@':
				atterName = atterName.replace(/@/, 'v-on:')
				break
			case ':':
				atterName = atterName.replace(/:/, 'v-bind')
				break
		}
		return atterName
	}
	// 是否是v-指令
	isDirective(attr) {
		return attr.indexOf('v-') === 0
	}
	// 是否是v-on 绑定事件
	isEventDirective(dir) {
		return dir.indexOf('on') === 0
	}
	// 是否为元素节点
	isElementNode(node) {
		return node.nodeType === 1
	}
	// 是否为子父节点
	isTextNode(node) {
		return node.nodeType === 3
	}
	// 解析el中可操作dom
	compileElement(el) {
		let childNodes = el.childNodes
		console.log(childNodes);
		[].slice.call(childNodes).forEach(node => {
			let text = node.textContent, reg = /\{\{(.*)\}\}/
			if (this.isElementNode(node)) {
				this.compile(node)
			} else if (this.isTextNode(node) && reg.test(text)) {
				this.compileText(node, RegExp.$1)
			}
			// 遍历编译子节点
			if (node.childNodes && node.childNodes.length) {
				this.compileElement(node)
			}
		})
	}
	compile(node) {
		let nodeAttrs = node.attributes
		console.log(node, nodeAttrs);
		[].slice.call(nodeAttrs).forEach(attr => {
			// 规范v-xx指令
			let attrName = this.getAttrName(attr.name)
			if (this.isDirective(attrName)) {
				let exp = attr.value,
					dir = attrName.substring(2) // text/model
				if (this.isEventDirective(dir)) {
					// 事件指令 如v-on:click
					compileUtil.eventHandler(node, this.vm, exp, dir)
				} else {
					// 暂时只做了v-text,v-model
					compileUtil[dir] && compileUtil[dir](node, this.vm, exp)
				}
			}
		})
	}
}
// 指令处理集合
var compileUtil = {
	text: function (node, vm, exp) {
		// console.log(node, vm, exp)
		this.bind(node, vm, exp, 'text');
	},
	model: function (node, vm, exp) {
		this.bind(node, vm, exp, 'model');
		var val = this.getVMVal(vm, exp);
		// 监听input输入事件
		node.addEventListener('input', (e) => {
			var newVal = e.target.value;
			if (val === newVal) {
				return;
			}

			this.setVMval(vm, exp, newVal);
			// val = newVal;
		})
	},
	// 事件处理
	eventHandler: function (node, vm, exp, dir) {
		var eventType = dir.split(':')[1],
			fn = vm.options.methods && vm.options.methods[exp];
		if (eventType && fn) {
			node.addEventListener(eventType, fn.bind(vm), false);
		}
	},
	// 获得 vue中data里的exp值 注意：exp不能有. 否则返回undefined
	getVMVal: function (vm, exp) {
		var val = vm;
		exp = exp.split('.');
		exp.forEach(function (k) {
			val = vm[k];
		})
		return val;
	},
	// 设置vue中data里的exp值为input改变的值
	setVMval: function (vm, exp, newVal) {
		var val = vm;
		exp = exp.split('.');
		exp.forEach(function (k, i) {
			// 非最后一个key，更新val
			if (i < exp.length - 1) {
				val = val[k];
			} else {
				val[k] = newVal;
			}
		})
	},
	bind: function (node, vm, exp, dir) {
		console.log('dir=' + dir)
		// 绑定跟新触发的相对应事件
		var updaterFn = updater[dir + 'Updater'];
		// 第一次初始化视图
		updaterFn && updaterFn(node, vm[exp]);
		new Watcher(vm, exp, function (val, oldVal) {
			updaterFn && updaterFn(node, val, oldVal);
		})
	}
};
// 更新函数
var updater = {
	textUpdater: function (node, val) {
		node.textContent = typeof val == 'undefined' ? '' : val;
	},
	modelUpdater: function (node, val, oldVal) {
		node.value = typeof val == 'undefined' ? '' : val;
	}
}