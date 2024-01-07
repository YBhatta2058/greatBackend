const fun1 = ()=>{
    console.log("Hello world")
}

const fun2 = (fun) => fun();

fun2(fun1)