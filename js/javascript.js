(function readyJS(win,doc){
    if(doc.querySelectorAll('.deletar')){
        for(let i=0; i < doc.querySelectorAll('.deletar').length; i++){
            doc.querySelectorAll('.deletar')[i].addEventListener('click',function(event){
                if(confirm("Deseja mesmo apagar este dado?")){
                    return true;
                }else{
                    event.preventDefault();
                }
            });
        }
    }
})(window,document);

//Cria mensagem de criação de cadastro sucedido sem mudar a url na tela de criar chamado
$(function () {
    $("#formAbrirChamado").on("submit", function (event) {
        var Dados=$(this).serialize();
        var titulo = this[0].value;
        var categoria = this[1].value;
        var descricao = this[2].value;
        $.post("/controllerForm",{
                titulo: String(titulo),
                categoria: String(categoria),
                descricao: String(descricao),
                success:function(){
                    $('.resultado').show();
                }
             },
             function (data, status) {
                console.log(data);
             });
             event.preventDefault();
        });   
 });
