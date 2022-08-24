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

require("jsdom").env("", function(err, window) {
    if (err) {
        console.error(err);
        return;
    }

    $("#formAbrirChamado").on('submit', function(event){
        event.preventDefault();
        var Dados=$(this).serialize();
    
        $.ajax({
            url: 'controllerForm.handlebars',
            type:'post',
            dataType:'html',
            data: Dados,
            success:function(Dados){
                $('.resultado').show.html(Dados);
            }
        });
    });
});
