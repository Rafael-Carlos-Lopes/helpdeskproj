const express=require('express');
const bodyParser=require('body-parser');
const mysql=require('mysql');
const handlebars=require('express-handlebars');
const app=express();
const urlencodeParser=bodyParser.urlencoded({extended:false});
const sessions = require('express-session');
const session = require('express-session');

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
    if(req.session.matricula){
        sql.getConnection(function(err, connection){
        connection.query("select count(*) as quantChamados from chamados where idSolicitador = ?",[req.session.matricula],function(err,results,fields){
            req.session.quantChamados = results[0].quantChamados;
            res.render('home', {tipo:req.session.tipo, quantChamados:req.session.quantChamados});
        });
    });
    }
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
                connection.query("select count(*) as quantChamados from chamados where idSolicitador = ?",[req.session.matricula],function(err,results,fields){
                    req.session.quantChamados = results[0].quantChamados;
                    res.render('home', {tipo:req.session.tipo, quantChamados:req.session.quantChamados});
                });
            }
            else
                res.render('login', {textoErro: "Usuário ou senha inválido(s)."});
        });   
    });    
});

//Deslogar
app.get('/logout',(req,res) => {
    req.session.destroy();
    res.render('login', {textoLogout: "Deslogado com sucesso!"});
});

//tela de abrir novo chamado
app.get("/chamados", function(req, res){
    if(req.session.matricula)
        res.render('chamados', {tipo:req.session.tipo});
    else
        res.redirect('/');
});

//tela que retorna os chamados
app.get("/consultaChamados/:id?",function(req, res){
    if(req.session.matricula){
        if(!req.params.id){
            sql.getConnection(function(err, connection){
                if(req.session.tipo == 'administrador'){
                    connection.query("select * from chamados order by id asc", function(err, results, fields){
                        res.render('consultaChamados', {data:results, tipo:req.session.tipo});
                    });
                }

                else{
                    connection.query("select * from chamados where idSolicitador = ?",[req.session.matricula], function(err, results, fields){
                        res.render('consultaChamados', {data:results, tipo:req.session.tipo});
                    });
                }
            });    
        }

        else{
            sql.getConnection(function(err, connection){
                connection.query("select * from chamados where id = ?",[req.params.id], function(err, results, fields){
                    res.render('detalhesChamado', {data:results, tipo:req.session.tipo});
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
            var matriculaSolicitador = req.session.matricula;
            //Código para incrementar o id dos chamados de 1 em 1;
            let maiorId;

            if(results[0] != null)
                maiorId = results[0].id;

            else
                maiorId = 0;

            connection.query("insert into chamados (id, titulo, categoria, descricao, status, idSolicitador) values (?,?,?,?,?,?)",[(maiorId + 1),req.body.titulo,req.body.categoria,req.body.descricao,"Espera",req.session.matricula]);

            res.render('controllerAbrirChamado');
        });   
    });  
});

//Tela de criar usuário, somente acessada pelo administrador
app.get("/criarUsuario", function(req, res){
    if(req.session.matricula){
        if(req.session.tipo == "administrador")
            res.render('criarUsuario', {tipo:req.session.tipo});
        else
            res.redirect('/');
    }
    else
        res.redirect('/');
});

//função para criar usuario novo
app.post("/controllerCriarUsuario",urlencodeParser,function(req,res){
    sql.getConnection(function(err, connection){
            connection.query("insert into usuarios (matricula, senha, tipo, nome, cpf, email, telefone) values (?,?,?,?,?,?,?)",[req.body.matricula,req.body.matricula,"aluno",req.body.nome,req.body.cpf,req.body.email,req.body.telefone]);
            res.render('controllerCriarUsuario');
    });  
});

//tela de configurações
app.get("/configuracoes", function(req, res){
    if(req.session.matricula)
        res.render('configuracoes', {tipo:req.session.tipo});
    else
        res.redirect('/');
});

//função para alterar senha
app.post("/controllerAlterarSenha",urlencodeParser,function(req,res){
    sql.getConnection(function(err, connection){
        if(req.body.novaSenha == req.body.senhaConfirmada){
            connection.query("select * from usuarios where matricula = ? and senha = ?",[req.session.matricula, req.body.senha], function(err, results, fields){
                if(results[0] != null){
                    connection.query("update usuarios set senha = ? where matricula = ?",[req.body.novaSenha, req.session.matricula], function(err, results, fields){
                        res.render('configuracoes', {textoAviso: "Senha alterada com sucesso."});
                    });
                }
                else
                    res.render('configuracoes', {textoAviso: "Senha inválida."});
            });
        }
        else
            res.render('configuracoes', {textoAviso: "Senha confirmada não é igual à nova senha."});
    });  
});

//função para editar chamados
app.post("/controllerEditarChamado",urlencodeParser,function(req,res){
    sql.getConnection(function(err, connection){
            connection.query("update chamados set titulo = ?, status =?, descricao = ? where id = ?",[req.body.titulo,req.body.status,req.body.descricao,req.body.idchamado]);
            res.render('controllerEditarChamado');
    });  
});

//tela de alterar dados pessoais
app.get("/alterarDados", function(req, res){
    if(req.session.matricula){
        sql.getConnection(function(err, connection){
            connection.query("select * from usuarios where matricula = ?",[req.session.matricula], function(err, results, fields){
                res.render('alterarDados',{data: results, tipo:req.session.tipo});
            });
        });    
    }
    else
        res.redirect('/');
});

//função para alterar dados pessoais
app.post("/controllerAlterarDados",urlencodeParser,function(req,res){
    sql.getConnection(function(err, connection){
            connection.query("update usuarios set nome = ?, email = ?, telefone = ? where matricula = ?",[req.body.nome,req.body.email,req.body.telefone,req.session.matricula]);
            res.render('controllerAlterarDados');
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