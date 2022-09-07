const express=require('express');
const bodyParser=require('body-parser');
const mysql=require('mysql');
const handlebars=require('express-handlebars');
const app=express();
const urlencodeParser=bodyParser.urlencoded({extended:false});
const sessions = require('express-session');

//#region comnfiguracao de sessao
//um segundo mult. por 60 para virar minuto, depois hora
const umaHora = 1000 * 60 * 60;
app.use(sessions({
    secret: "thisismysecretkeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: umaHora },
    resave: false 
}));

app.use(bodyParser.urlencoded({extended: true}));
//#endregion

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

//Primeira tela
app.get("/", function(req, res){
    if(req.session.matricula)
        res.render('home', {tipo:req.session.tipo});
    else
        res.render('login');
});

//Login com sucesso ou falha
app.post("/",(req,res) => {
    sql.getConnection(function(err, connection){
        connection.query("select * from usuarios where matricula = ? and senha = ?",[req.body.matricula, req.body.senha], function(err, results, fields){
            if(results[0] != null){
                req.session.matricula = results[0].matricula;
                req.session.tipo = results[0].tipo;
                console.log(req.session.tipo);
                res.render('home', {tipo:req.session.tipo});
            }
            else
                res.render('login', {textoErro: "Usuário ou senha inválido(s)."});
        });   
    });    
});

//Deslogar
app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});

//tela de abrir novo chamado
app.get("/chamados", function(req, res){
    if(req.session.matricula)
        res.render('chamados');
    else
        res.redirect('/');
});

//tela que retorna os chamados
app.get("/consultaChamados/:id?",function(req, res){
    if(req.session.matricula){
        if(!req.params.id){
            sql.getConnection(function(err, connection){
                connection.query("select * from chamados order by id asc", function(err, results, fields){
                    res.render('consultaChamados', {data:results});
                });   
            });    
        }

        else{
            sql.getConnection(function(err, connection){
                connection.query("select * from chamados where id = ?",[req.params.id], function(err, results, fields){
                    res.render('consultaChamados', {data:results});
                });  
            });    
        }
    }

    else{
        res.redirect('/');
    }
});

//função para criar chamado novo
app.post("/controllerAbrirChamado",urlencodeParser,function(req,res){
    sql.getConnection(function(err, connection){
        connection.query("select id from chamados order by id desc limit 0,1", function(err, results, fields){
            
            //Código para incrementar o id dos chamados de 1 em 1;
            let maiorId;

            if(results[0] != null)
                maiorId = results[0].id;

            else
                maiorId = 0;

            connection.query("insert into chamados (id, titulo, categoria, descricao, status) values (?,?,?,?,?)",[(maiorId + 1),req.body.titulo,req.body.categoria,req.body.descricao, "Espera"]);

            res.render('controllerAbrirChamado');
        });   
    });  
});

app.get("/criarUsuario", function(req, res){
    if(req.session.matricula){
        if(req.session.tipo == "administrador")
            res.render('criarUsuario');
        else
            res.redirect('/');
    }
    else
        res.redirect('/');
});

//função para criar chamado novo
app.post("/controllerCriarUsuario",urlencodeParser,function(req,res){
    sql.getConnection(function(err, connection){
            connection.query("insert into usuarios (matricula, senha, tipo) values (?,?,?)",[req.body.matricula,req.body.matricula,"aluno"]);

            res.render('controllerCriarUsuario');
    });  
});
//#endregion

//#region provavelmente deletar
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