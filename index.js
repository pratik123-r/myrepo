const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const session = require('express-session');
const cookieParser = require('cookie-parser')

var mc= require('mongodb').MongoClient;
var URL = 'mongodb://localhost:27017';

app.use(session({secret: 'R.M.Club2000',saveUninitialized: true,resave: true}));
app.use(bodyParser());
app.use(cookieParser());
const url = require('url');
const jwt = require('jsonwebtoken');

const secretJWTKey = 'R.M.Club2000';

var MySessionVariable;


app.get('/',(req,res)=>{
    res.render("SignIn");
});

app.get('/SignIn',(req,res)=>{
    res.render("SignIn");
});

app.post('/SignIn',(req,res)=>{
    
    if(req.body.Emailid && req.body.password)
    {
         MySessionVariable=req.session;
         MySessionVariable.Emailid=req.body.Emailid;
         MySessionVariable.password=req.body.password;

        var username=req.body.Emailid;
        console.log(username);
        const MyJWTToken = jwt.sign({ username }, secretJWTKey, {
            algorithm: 'HS256',
            expiresIn: 500
        });
        console.log(MyJWTToken);
        res.cookie('CookieTokenVariable', MyJWTToken, { maxAge: 500 * 1000 });
        //res.send("Valid User.");
        res.send(MyJWTToken);
    }
    else
    {
        res.send('Invalid Username OR Password..!!');
    }
});

app.get("/SignInValidateAPI",(req,res)=>{
    mc.connect(URL,(err,db)=>{
      console.log("Connected successfully to server...");
      
      const dbo = db.db("project");
     
      const collection = dbo.collection('student');

      collection.find({}).toArray(function(err, docs) {
        var returnValue="";
        for (var i = 0; i < docs.length; i++)
        {
          if (returnValue == "")
          {
            returnValue = returnValue+"["+ JSON.stringify(docs[i]);
          }
          else
          {
            returnValue = returnValue + ", " + JSON.stringify(docs[i]);
          }
        }
        if(returnValue===""){
          returnValue="[]";
        }else
          returnValue=returnValue+"]";
          res.set(200).json(returnValue);
          console.log("Sending Data To Ajax...");
      
        });
        db.close();
    });
});

app.get('/MemberHome',(req,res)=>{
    const MySetCookieToken = req.cookies.CookieTokenVariable;
    
    if (!MySetCookieToken) {
        res.redirect("/SignIn");
      }
    
      var User
      try {
        User = jwt.verify(MySetCookieToken, secretJWTKey);
      } 
      catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
  
          res.redirect("/SignIn");
        }
        res.redirect("/SignIn");
      }
    
      res.send(`Welcome, ${User.username}!`);
  
      res.render("MemberHome");
});

app.listen(2000,()=>{console.log("....PORT LISTENING ON 2000....");});

app.set('view engine', 'ejs');