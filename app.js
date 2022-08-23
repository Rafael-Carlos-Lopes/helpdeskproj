const express=require('express');
const bodyParser=require('body-parser');
const mysql=require('mysql');
const handlebars=require('express-handlebars');
const app=express();
const urlencodeParser=bodyParser.urlencoded({extended:false});

//#region Config de Bases para conexao

//Descomentar e comentar o de baixo se for usar base local
// const sql=mysql.createPool({
//     host:'localhost',
//         user:'root',
//         password:'',
//         port:3306,
//         database: "nodejs"
// });

//Descomentar e comentar o de cima se for usar base de produção
const sql=mysql.createPool({
    user: 'b80a2a577bda7b',
    password: 'f6210a81',
    host: 'us-cdbr-east-06.cleardb.net',
    database: 'heroku_1f38baa8bb5cfae'
});
//#endregion

//variável para garantir que vai acessar a porta corretamente no heroku
let port=process.env.PORT || 3000;

// Template engine
app.engine('handlebars',handlebars.engine({defaultLayout:'main'}));
app.set('view engine','handlebars');

//maneira de acessar arquivos pelo use
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/img', express.static('img'));

//#region Rotas and Templates
app.get("/", function(req, res){
    res.render('index');
});

app.get("/inserir",function(req, res){res.render("inserir");});

app.get("/abrirchamado", function(req, res){
    res.render('abrirchamado');
})

app.get("/select/:id?",function(req, res){
    if(!req.params.id){
        sql.getConnection(function(err, connection){
            connection.query("select * from CHAMADOS order by id asc", function(err, results, fields){
                res.render('select', {data:results});
            });   
        });    
    }

    else{
        sql.getConnection(function(err, connection){
            connection.query("select * from CHAMADOS where id = ?",[req.params.id], function(err, results, fields){
                res.render('select', {data:results});
            });  
        });    
    }
});

app.post("/controllerForm",urlencodeParser,function(req,res){
    sql.getConnection(function(err, connection){
        connection.query("select id from CHAMADOS order by id desc limit 0,1", function(err, results, fields){
            
            //Código para incrementar o id dos chamados de 1 em 1;
            let maiorId;

            if(results[0] != null)
                maiorId = results[0].id;

            else
                maiorId = 0;

            connection.query("insert into CHAMADOS (ID, TITULO, CATEGORIA, DESCRICAO) values (?,?,?,?)",[(maiorId + 1),req.body.titulo,req.body.categoria,req.body.descricao]);

            res.render('controllerForm',{name:req.body.titulo});
        });   
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
//#endregion

//Iniciar servidor
app.listen(port, function(req, res){
    console.log('Servidor Iniciado');
});