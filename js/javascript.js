(function readyJS(win, doc) {
    if (doc.querySelectorAll('.deletar')) {
        for (let i = 0; i < doc.querySelectorAll('.deletar').length; i++) {
            doc.querySelectorAll('.deletar')[i].addEventListener('click', function (event) {
                if (confirm("Deseja mesmo apagar este dado?")) {
                    return true;
                } else {
                    event.preventDefault();
                }
            });
        }
    }
})(window, document);

//Cria mensagem de criação de cadastro sucedido sem mudar a url na tela de criar chamado
$(function () {
    $("#formAbrirChamado").on("submit", function (event) {
        var titulo = this[0].value;
        var categoria = this[1].value;
        var descricao = this[2].value;
        $.post("/controllerAbrirChamado", {
            titulo: String(titulo),
            categoria: String(categoria),
            descricao: String(descricao),
            success: function () {
                $('.resultado').show();
            }
        });
        event.preventDefault();
    });

    $("#formCriarUsuario").on("submit", function (event) {
        var matricula = this[0].value;
        var nome = this[1].value;
        var cpf = this[2].value;
        var email = this[3].value;
        var telefone = this[4].value;
        $.post("/controllerCriarUsuario", {
            matricula: String(matricula),
            nome: String(nome),
            cpf: String(cpf),
            email: String(email),
            telefone: String(telefone),
            success: function () {
                $('.resultado').show();
            }
        });
        event.preventDefault();
    });

    var tipo = $('#tipo')[0];

    if(tipo != undefined){
        if(tipo.attributes[2].value != "administrador"){
            $('#opcaoCriarUsuario').addClass('opcaoCriarUsuario');         
        }
    }
});

function checker(){
    var result = confirm('Deseja Encerrar a Sessão?');
    if (result == false){
        event.preventDefault();
    }
}