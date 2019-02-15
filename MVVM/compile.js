class Compile{
    constructor(el,vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        if(this.el){
            // 1.先把这些真实DOM移入内存中 fragment
            let fragment = this.node2fragment(this.el);
            // 2.
            this.compile(fragment)
            // 3.
        }
    }
    // 写一些辅助的方法
    isElementNode(node) {
        return node.nodeType === 1;
    }

    compile(fragment) {
        let childNodes = fragment.childNodes;
        console.log(childNodes);
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