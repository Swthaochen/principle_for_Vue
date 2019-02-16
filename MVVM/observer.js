class Observer{
    constructor(data) {
        this.observe(data);
    }
    observe(data) {
        console.log(data)
        // 要对这个data数据 将原有的属性改成get和set形式
        if(!data || typeof data !== 'object'){
            return;
        }
        // 要将数据一一劫持 先获取data的key和value
        Object.keys(data).forEach(key=>{
            this.defineReactive(data, key, data[key]);
            this.observe(data[key]);
        })
    }
    // 定义响应式
    defineReactive(obj, key, value){
        var that = this;
        let dep = new Dep();    // 每个变化的数据都会对应一个数组。这个数组是存放所有更新的操作

        // 在获取某个值的时候
        Object.defineProperty(obj,key,{
            enumerable: true,
            configurable: true,
            get() { //当取值的时候调用的方法
                Dep.target && dep.addSub(Dep.target)
                return value;
            },
            set(newValue) { //当给data中的属性设置值的适合 更改获取的属性的值
                if(newValue != value){
                    // 这里的this不是实例
                    that.observe(newValue);
                    value = newValue;
                    dep.notify();  // 通知所有人数据更新了
                }
            }
        })
    }
}

class Dep {
    constructor() {
        this.subs = [];
    }
    addSub(watcher) {
        this.subs.push(watcher);
    }
    notify() {
        this.subs.forEach(watcher=>watcher.update());
    }
}