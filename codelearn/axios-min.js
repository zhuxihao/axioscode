function Axios(config){
    this.defaults = config
    // this.CancelToken = CancelToken()
    this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
    }
    
}

Axios.prototype.request = function(config){
//请求发送
    //
    //创建一个 promise 对象
    let promise = Promise.resolve(config)
    let chains = [dispatchRequest,undefined] //undefined 占位
    //调用 then 方法指定回调
        //处理拦截器
         //请求拦截器 将请求拦截器的回调 压入 chains 的前面，request.handles = []
         // console.log(this.interceptors.request.handlers)
         this.interceptors.request.handlers.forEach(item =>{
              chains.unshift(item.fulfilled,item.rejected)
          })
            //响应拦截器处理
            this.interceptors.response.handlers.forEach(item =>{
                chains.push(item.fulfilled,item.rejected)
            })

            //遍历
            while(chains.length > 0){
                promise = promise.then(chains.shift(),chains.shift())
            }
            return promise
        // let result = promise.then(chains[0],chains[1])
        // //返回 promise 的结果
        // return result
}

 //dispatchRequest 函数
 function dispatchRequest(config){
    //调用适配器发送请求
    return xhrAdapter(config).then(response=>{
        // console.log(response)
        //可对数据进行一些处理
        return response
    },error=>{
        // console.log(error)
        throw error
    })
}
// adapter 适配器
function xhrAdapter(config){
    console.log('xhrAdapter 函数执行')
    return new Promise((resolve,reject)=>{
        //发送 AJAX 请求
        let xhr = new XMLHttpRequest();
        //初始化
        xhr.open(config.method,config.url)
        //发送
        xhr.send()
        //绑定事件
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                if(xhr.status >=200 && xhr.status <300){
                    //成功的状态
                    resolve({
                        //配置对象
                        config: config,
                        //响应体
                        data: xhr.response,
                        //响应头
                        headers:xhr.getAllResponseHeaders(),
                        //请求对象
                        request:xhr,
                        //响应状态码
                        status:xhr.status,
                        //响应状态字符串
                        statusText:xhr.statusText
                    })
                }else{
                    //失败的状态
                    reject(new Error('请求失败，失败的状态码为' + xhr.status))
                }
            }
        }
        if(config.cancelToken){
            config.cancelToken.promise.then(value =>{
                xhr.abort()
            })
        }
    })
}







Axios.prototype.get = function(config){
    console.log('发送 AJAX 请求 get')
    return this.request(config)
}
Axios.prototype.post = function(config){
    console.log('发送 AJAX 请求 post')
    return this.request(config)
}
//取消请求部分
Axios.prototype.CancelToken = function CancelToken(executor){
    var resolvePromise

 this.promise = new Promise((resolve) => {
      resolvePromise = resolve
    })

   executor(function(){
     console.log('响应取消了')
     resolvePromise()
  })
}
 //取消请求部分结束
function createInstance(config){
    //实例化一个对象
    let context = new Axios(config)//context.get() context.post() 但是不能当做函数使用
    //创建请求函数
    let instance = Axios.prototype.request.bind(context)//instance 是一个函数，并且可以instance({}) 但不能instance.get X
    //将Axios.prototype对象中的方法添加到instance函数对象中
    Object.keys(Axios.prototype).forEach(key =>{
        instance[key] = Axios.prototype[key].bind(context)
    })
    //为 instance 函数对象添加属性 default 与 interceptors
    Object.keys(context).forEach(key =>{
        instance[key] = context[key]
    })
    // console.dir(instance)
    return instance
}
let axios = createInstance()

//拦截器管理器构造函数
function InterceptorManager(){
    this.handlers = []
}
InterceptorManager.prototype.use = function(fulfilled,rejected){
    this.handlers.push({
        fulfilled,
        rejected
    })
}


 //设置请求拦截器
axios.interceptors.request.use(function one(config){
    console.log('请求拦截器成功 1号')
    return config
},function one(error){
    console.log('请求拦截器失败')
    return Promise.reject(error)
})
axios.interceptors.request.use(function two(config){
    console.log('请求拦截器成功 2号')
    return config
},function two(error){
    console.log('请求拦截器失败')
    return Promise.reject(error)
})

//设置响应拦截器
axios.interceptors.response.use(function one(response){
    console.log('响应拦截器成功 1号')
    return response
},function one(error){
    console.log('响应 拦截器失败')
    return Promise.reject(error)
})
//设置响应拦截器
axios.interceptors.response.use(function two(response){
    console.log('响应拦截器成功 2号')
    return response
},function two(error){
    console.log('响应 拦截器失败')
    return Promise.reject(error)
})


// axios.cancelToken = CancelToken()

// module.exports = axios;

//简单实现全局暴露 axios
window.axios = axios;