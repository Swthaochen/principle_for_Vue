class Compile{
    constructor(el,vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        if(this.el){
            // 1.先把这些真实DOM移入内存中 fragment
            let fragment = this.node2fragment(this.el);
            // 2.编译，提取想要的元素节点v-model和文本节点{{}}
            this.compile(fragment);
            // 3.把编译好的fragment
            this.el.appendChild(fragment);
        }
    }
    // 写一些辅助的方法
    isElementNode(node) {
        return node.nodeType == 1;
    }
    compileElement(node) {
        // 带v-model
        let attrs = node.attributes;
        Array.from(attrs).forEach(attr=>{
            // 判断属性是不是包含v-
            let attrName = attr.name
            if(this.isDirective(attrName)){
                // 取到对应的值放到节点中
                let expr = attr.value;
                let [, type] = attrName.split('-')
                // node vm.$data
                CompileUtil[type](node,this.vm,expr);
            }
        })
    }
    compileText(node) {
        // 带{{}}
        let expr = node.textContent;
        let reg = /\{\{([^}]+)\}\}/g;
        if(reg.test(expr)){
            // node 
            CompileUtil['text'](node,this.vm,expr);
            
        }

    }

    isDirective(name) {
        return name.includes('v-')
    }

    compile(fragment) {
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach(node=>{
            if(this.isElementNode(node)){
                // 是元素节点,还需要继续深入检查
                // console.log('element', node);
                // 这里需要编译元素
                this.compileElement(node);
                this.compile(node);
            } else {
                // 这里需要编译文本
                this.compileText(node);
            }
        })
    }
    // 核心的方法
    node2fragment(el) { //需要将el的内容放在内存中
        //文档碎片
        let fragment = document.createDocumentFragment();
        let firstChild;
        while(firstChild = el.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment;
    }

}

CompileUtil = {
    getVal(vm, expr) {  //获取实例上的数据
        expr = expr.split('.')
        return expr.reduce((prev,next)=>{
            return prev[next]
        },vm.$data)
    },
    getTextVal(vm,expr) {
        return expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            return this.getVal(vm, arguments[1]);
        })
    },
    text(node,vm,expr) { // 文本处理
        let updateFn = this.updater['textUpdater'];
        let value = this.getTextVal(vm,expr);
        expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            new Watcher(vm, arguments[1],(newValue)=>{
                // 如果数据变化了，文本节点需要重新获取依赖的属性  更新文本中的内容
                updateFn && updateFn(node,this.getTextVal(vm, expr));
            });
        })
        updateFn && updateFn(node, value)
    },
    setVal(vm,expr,value) { // [message, a]
        expr = expr.split('.');
        return expr.reduce((prev,next,currentIndex)=>{
            if(currentIndex === expr.length-1){
                return prev[next] = value;
            }
            return prev[next]
        },vm.$data)
    },
    model(node,vm,expr) { // 输入框处理
        let updateFn = this.updater['modelUpdater'];
        // 这里应该加一个监控 数据变化了调用这个watch的回调函数
        new Watcher(vm, expr,(newValue)=>{
            // 当值变化后会调用cb 将新值传过来
            updateFn && updateFn(node, this.getVal(vm,expr))
        });
        node.addEventListener('input',(e)=>{
            let newValue = e.target.value;
            this.setVal(vm,expr,newValue);
        })
        updateFn && updateFn(node,this.getVal(vm,expr))
    },
    updater: {
        //文本更新
        textUpdater(node, value) {
            node.textContent = value;
        },
        //输入框更新
        modelUpdater(node, value) {
            node.value = value;
        }
    }
}