$(document).ready(function(){
// iniciando o datatable
  $('#myreservas').DataTable({
    // responsive: true
  });

  $('#siteStatus').change(function() 
  {
    if(this.checked == true)
    {
      // alert('site online');
      let data = {
        status: 1
      }
    
      $.ajax({
        type: "GET",
        url: "/siteconfig",
        data: data,
        dataType: 'json',
        success: (ok) => {
          // console.log('listar...')
          console.log(ok);  
          
        },
        error: (res) => {
          console.log(res);
          
        }
      });

    }else{

      // alert('site offline');
      let data = {
        status: 0
      }
    
      $.ajax({
        type: "GET",
        url: "/siteconfig",
        data: data,
        dataType: 'json',
        success: (ok) => {
          // console.log('listar...')
          console.log(ok);  
          
        },
        error: (res) => {
          console.log(res);
          
        }
      });
    }
  });

})

const realFile = document.getElementById('real_file');
const fakeFilebtn = document.getElementById('fakefile');

if(realFile && fakeFilebtn){
  fakeFilebtn.addEventListener("click", function() {
    realFile.click();
    
    realFile.onchange = function () {
      document.getElementById('file_form').submit()
      
    };
  })
}


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



$('#changePlano').change(function () {
  // alert('plano selecionado');

  var id = $(this).children(":selected").val();
  alert('valor do id: ' + id);
  var picklocal = document.getElementById('pilocal')
  var local = picklocal.options[picklocal.selectedIndex].value;
  alert('local: ' + local)
  
  if(!id && !local){
    console.log('O select esta sem um valor ou é: ' + id + ' && ' + local)
  }
  let data = {
    plano: id,
    local: local
  }

  $.ajax({
    type: "GET",
    url: "/getdados",
    data: data,
    dataType: 'json',
    success: (ok) => {
      console.log('listar...');
      console.log(ok);

      let dada = document.getElementById('detalhesR')
      dada.innerHTML = `
      <div class="row">
      <div class="col-md-4">
        <div class="planoDetail">
          <p class="pd"><span>Plano:</span> ${ok.plano}</p>
          <p class="pd"><span>Megas:</span> ${ok.megas} MB</p>
          <p class="pd"><span>Preço:</span> ${ok.preco}$00</p>
          <p ></p>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-6">
            <p class="pd"><span>Despositivo N°:</span> ${ok.deviceid}</p>
            <p class="pd"><span>Nome:</span> ${ok.devicenome} </p>
            <p class="pd"><span>Numero:</span> ${ok.devicenum} </p>
          </div>
          <div class="col-md-6">
            <img id="reinfo" src="${ok.devicefoto}" alt="">
          </div>
        </div>
      </div>
    </div>
      `;
    },
    error: (res) => {
      console.log(res);
      
    }
  });

});