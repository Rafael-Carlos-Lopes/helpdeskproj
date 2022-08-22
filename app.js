const express=require('express');
const bodyParser=require('body-parser');
const mysql=require('mysql');
const handlebars=require('express-handlebars');
const app=express();
const urlencodeParser=bodyParser.urlencoded({extended:false});
// const sql=mysql.createConnection({
//     host:'localhost',
//     user:'root',
//     password:'',
//     port:3306
// });
// sql.query("use nodejs");

const sql=mysql.createPool({
    user: "b25d2e9de70ab5",
    password: "e7dfe4ce",
    host: "us-cdbr-east-06.cleardb.net",
    database: "heroku_90ab69443ba2f73"
});
let port=process.env.PORT || 3000;
// Template engine
app.engine('handlebars',handlebars.engine({defaultLayout:'main'}));
app.set('view engine','handlebars');

//maneira de acessar arquivos pelo use
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/img', express.static('img'));

//Routes and Templates
app.get("/", function(req, res){
    // res.send("Teste inicial");
    // res.sendFile(__dirname+"/index.html");
    // console.log(req.params.id);
    res.render('index');
});

//maneira de acessar arquivos pelo sistema de rotas
// app.get("/javascript", function(req, res){res.sendFile(__dirname+'/js/javascript.js');});
// app.get("/style", function(req, res){res.sendFile(__dirname+'/css/style.css');});

app.get("/inserir",function(req, res){res.render("inserir");});

app.get("/abrirchamado", function(req, res){
    res.render('abrirchamado');
})

app.get("/select/:id?",function(req, res){
    if(!req.params.id){
        sql.getConnection(function(err, connection){
            connection.query("select * from user order by id asc", function(err, results, fields){
                res.render('select', {data:results});
            });   
        });    
    }

    else{
        sql.getConnection(function(err, connection){
            connection.query("select * from user where id = ?",[req.params.id], function(err, results, fields){
                res.render('select', {data:results});
            });  
        });    
    }
});

app.post("/controllerForm",urlencodeParser,function(req,res){
    sql.getConnection(function(err, connection){
        connection.query("insert into user values (?,?,?)",[req.body.id,req.body.name,req.body.age]);
            res.render('controllerForm',{name:req.body.name});
    });  
});

app.get('/deletar/:id',function(req,res){
    sql.getConnection(function(err, connection){
        connection.query("delete from user where id=?",[req.params.id]);
            res.render('deletar');
    });
});

app.get("/update/:id",function(req,res){
    sql.getConnection(function(err, connection){
        connection.query("select * from user where id=?",[req.params.id],function(err,results,fields){
            res.render('update',{id:req.params.id,name:results[0].name,age:results[0].age});
        });
    });
});

app.post("/controllerUpdate",urlencodeParser,function(req,res){
    sql.getConnection(function(err, connection){
        connection.query("update user set name=?,age=? where id=?",[req.body.name,req.body.age,req.body.id]);
            res.render('controllerUpdate');
    });     
});

function TestaBotao(){
    // sql.getConnection(function(err, connection){
    //     connection.query("UPDATE user SET age = 35 WHERE id = 2;");
    // });
    console.log("teste");
}


//Start server
app.listen(port, function(req, res){
    console.log('servidor está rodando');
});