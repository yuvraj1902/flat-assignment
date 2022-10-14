const express = require('express');
const mysql = require("mysql")
const dotenv = require('dotenv')
const uuidv1=require('uuidv1')
const bcrypt = require("bcrypt")
const app = express();
dotenv.config({ path: './.env'})


const db = mysql.createConnection({
    host     : process.env.DATABASE_HOST,
    port : process.env.DATABASE_PORT,
    database : process.env.DATABASE,
    user     : process.env.DATABASE_ROOT,
    password : process.env.DATABASE_PASSWORD,
});


db.connect((error) => {
    if(error) {
        console.log(error)
    } else {
        console.log("MySQL connected!")
    }
})

const port=process.env.port || 5000;
app.listen(port,()=>{
    console.log(`Server is running on ${port}`);
})
app.use(express.json());

app.get("/auth/users",(req,res)=>{
    let sql="Select * from user"   
    let query=db.query(sql,(err,user)=>{
        if(err) {
        return res.status(404).json({
            error:"No User found in database"
        })
    }
    res.json(user);
    })
    
})

const isEmailExists=(req,res,next)=>{
   const email=req.body.email;
    
   db.query("select * from user where email=?",[email],(err,user)=>{
        if(err){
            return res.status(500).json({
                error:"Internal server error"
            })
        }
        if(user.length>0){
            return res.status(409).json({
                error:"email already exists"
            })
        }
        next();
    })
    
   
}
app.post("/auth/signup",isEmailExists,(req,res)=>{
    const name=req.body.name;
    const email=req.body.email;
    const password=req.body.password;
    const contact=req.body.contact;
    if(!name || !email || !password || !contact){
        res.status(400).json({
            error:"Filled the information completely"
        })
    }
    
    
    const hash= bcrypt.hashSync(password,10)
    db.query("insert into user(name,email,password,contact) values(?,?,?,?)",[name,email,hash,contact],(err,user)=>{
        if(err){
            res.status(500).json({
                error:"internal server error"
            })
        }
        res.json("register successfully");
    })
})

app.post("/auth/login",(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;
    
    if(email && password){
   
     db.query("Select password FROM user WHERE email = ?",[email],(err,result) => {
        if(err){
            return res.status(500).json({
                error:"Internal server error"
            });
        }
        if(result.length<=0){
            return res.status(400).json({
                error:"Enter the email correctly"
            })
        }
        const decry=bcrypt.compareSync(password,result[0].password);
        if(decry){
            res.status(200).json({
                message:"Login successful"
            })
        }else{
            res.status(400).json({
                error:"Password doesn't match. Enter the password correctly"
            })
        }
       
    })
}else{
            res.status(404).json({error:'email and password field cannot be leave empty'});
        }
        
    })  
    




app.delete("/auth/users/:id",(req,res)=>{
    const id=req.params.id; 
    let query=db.query("DELETE FROM user WHERE id=?",[id],(err,user)=>{
        if(err) {
        return res.status(500).json({
            error:"Internal Server Error"
        })
    }
    if(user.length>0){
        return res.status(400).json({
            error:"Enter the correct url"
        })
    }
    res.json({
        message:"Deleted successfully"
    });
    })
    
})

//module.exports=db;