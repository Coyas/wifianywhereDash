$(document).ready(function(){
// iniciando o datatable
$('#myreservas').DataTable({
  // responsive: true
});



})

$('#devolver').click(function(){

  // swal({
  //   title: "Confirmado!",
  //   text: "Despositivo Devolvido",
  //   icon: "success",
  //   button: "continuar",
  // });

})

$('#lang').change(function () {
  // alert('test')
  var id = $(this).children(":selected").val();
  alert(id);
  let data = {
    lang: id
  }

  $.ajax({
    type: "GET",
    url: "/getcategoria",
    data: data,
    dataType: 'json',
    success: (ok) => {
      // console.log('listar...')
      // console.log(ok[0].nome);  
      
      let select = document.getElementById('categoria');
      $('select#categoria').children().remove();

      ok.forEach(c => {
        console.log(c);  
        let opt = document.createElement('option');
        select.appendChild(opt);
        opt.setAttribute('value', c.id);
        opt.innerText = c.nome;
      })
    },
    error: (res) => {
      console.log(res);
      
    }
  });
  
})
