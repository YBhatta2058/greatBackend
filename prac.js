const prom1 = new Promise((resolve,reject)=>{
    setTimeout(()=>{
        const value = "DATABASE";
        resolve(value)
        reject("Error occured while connecting to the database")
    })
})

prom1.then((val)=>console.log(val)).catch((err)=>console.log(err))