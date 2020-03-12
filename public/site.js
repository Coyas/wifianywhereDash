$(document).ready(function() {
  // iniciando o datatable
  $('#myreservas').DataTable({
    // responsive: true
  });

  $('#siteStatus').change(function() {
    if (this.checked == true) {
      // alert('site online');
      let data = {
        status: 1,
      };

      $.ajax({
        type: 'GET',
        url: '/siteconfig',
        data: data,
        dataType: 'json',
        success: ok => {
          // console.log('listar...')
          console.log(ok);
        },
        error: res => {
          console.log(res);
        },
      });
    } else {
      // alert('site offline');
      let data = {
        status: 0,
      };

      $.ajax({
        type: 'GET',
        url: '/siteconfig',
        data: data,
        dataType: 'json',
        success: ok => {
          // console.log('listar...')
          console.log(ok);
        },
        error: res => {
          console.log(res);
        },
      });
    }
  });

  // definir o valor padrao da caixa de detalhes
  var id = $('#changePlano')
    .children(':selected')
    .val();
  // alert('valor do id: ' + id);
  var picklocal = document.getElementById('pilocal');
  var local = picklocal.options[picklocal.selectedIndex].value;
  // alert('local: ' + local)

  if (!id && !local) {
    console.log('O select esta sem um valor ou é: ' + id + ' && ' + local);
  }
  let data = {
    plano: id,
    local: local,
  };

  $.ajax({
    type: 'GET',
    url: '/getdados',
    data: data,
    dataType: 'json',
    success: ok => {
      console.log('listar...');
      console.log(ok);

      let dada = document.getElementById('detalhesR');

      planos(ok, dada);
      // setTimeout(() => planos(ok, dada), 3000);
    },
    error: res => {
      console.log(res);
    },
  });
});

const realFile = document.getElementById('real_file');
const fakeFilebtn = document.getElementById('fakefile');

if (realFile && fakeFilebtn) {
  fakeFilebtn.addEventListener('click', function() {
    realFile.click();

    realFile.onchange = function() {
      document.getElementById('file_form').submit();
    };
  });
}

$('#devolver').click(function() {
  // swal({
  //   title: "Confirmado!",
  //   text: "Despositivo Devolvido",
  //   icon: "success",
  //   button: "continuar",
  // });
});

$('#lang').change(function() {
  // alert('test')
  var id = $(this)
    .children(':selected')
    .val();
  // alert(id);
  let data = {
    lang: id,
  };

  $.ajax({
    type: 'GET',
    url: '/getcategoria',
    data: data,
    dataType: 'json',
    success: ok => {
      // console.log('listar...')
      // console.log(ok[0].nome);

      let select = document.getElementById('categoria');
      $('select#categoria')
        .children()
        .remove();

      ok.forEach(c => {
        console.log(c);
        let opt = document.createElement('option');
        select.appendChild(opt);
        opt.setAttribute('value', c.id);
        opt.innerText = c.nome;
      });
    },
    error: res => {
      console.log(res);
    },
  });
});

$('#changePlano').change(function() {
  // alert('plano selecionado');

  var id = $(this)
    .children(':selected')
    .val();
  // alert('valor do id: ' + id);
  var picklocal = document.getElementById('pilocal');
  if (!picklocal) {
    console.log('nullo');
    var local = picklocal.options[picklocal.selectedIndex].value;
  }

  // alert('local: ' + local)

  if (!id && !local) {
    console.log('O select esta sem um valor ou é: ' + id + ' && ' + local);
  }
  let data = {
    plano: id,
    local: local,
  };

  $.ajax({
    type: 'GET',
    url: '/getdados',
    data: data,
    dataType: 'json',
    success: ok => {
      console.log('listar...');
      console.log(ok);

      let dada = document.getElementById('detalhesR');
      let dada2 = document.querySelector('#detalhesR');
      dada2.style.padding = '7%';

      dada.innerHTML = `
      <!-- o div detalhes vem aqui -->
        <div class="loader-wrapper">
          <div class="sandwatch-holder">
            <div class="sandwatch-top"></div>
            <div class="sandwatch-bottom"></div>
          </div>
          Loading...
        </div>

      `;

      setTimeout(() => planos(ok, dada), 3000);
    },
    error: res => {
      console.log(res);
    },
  });
});

// cont planos

function planos(ok, dada) {
  const pickdate = document.querySelector('input[name=pickupdate]').value;
  const dropdate = document.querySelector('input[name=returnday]').value;
  // console.log(pickdate)
  // console.log(dropdate)

  switch (ok.caso) {
    case 1:
      dada.innerHTML = `
      <div class="row">
      <div class="col-md-4">
        <div class="planoDetail">
          <p class="pd"><span>Pick-up Date</span> ${pickdate}</p>
          <p class="pd"><span>Plano:</span> ${ok.plano}</p>
          <p class="pd"><span>Megas:</span> ${ok.megas} MB</p>
          <p class="pd"><span>Preço:</span> &euro;${ok.preco}</p>
          <p ></p>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-6">
            <p class="pd"><span>Pick-up Date</span> ${dropdate}</p>
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
    <div class="row my-3">
      <div class="col-md-12 text-center">
      <p id="warn"> Será cobrado &euro;3 por cada dia de aluguer e somado ao valor do pacote </p>
      </div>
    </div>
      `;
      break;
    case 2:
      dada.innerHTML = `
        <div class="row">
        <div class="col-md-4">
          <div class="planoDetail">
            <p class="pd"><span>Pick-up Date</span> ${pickdate}</p>
            <p class="pd"><span>Plano:</span> ${ok.plano}</p>
            <p class="pd"><span>Megas:</span> ${ok.megas} MB</p>
            <p class="pd"><span>Preço:</span> &euro;${ok.preco}</p>
            <p ></p>
          </div>
        </div>
        <div class="col-md-8">
          <p class="pd"><span>Pick-up Date</span> ${dropdate}</p>
          <p id="detal"> ${ok.device}</p>
        </div>
      </div>
      <div class="row my-3">
        <div class="col-md-12 text-center">
        <p id="warn"> Será cobrado &euro;3 por cada dia de aluguer e somado ao valor do pacote </p>
        </div>
      </div>
        `;
      break;
    case 3:
      dada.innerHTML = `
        <div class="row">
        <div class="col-md-4">
          <p class="pd"><span>Pick-up Date</span> ${pickdate}</p>
          <p  id="detal"> ${ok.plano} </p>
        </div>
        <div class="col-md-8">
          <div class="row">
            <div class="col-md-6">
              <p class="pd"><span>Pick-up Date</span> ${dropdate}</p>
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
      <div class="row my-3">
        <div class="col-md-12 text-center">
        <p id="warn"> Será cobrado &euro;3 por cada dia de aluguer e somado ao valor do pacote </p>
        </div>
      </div>
        `;
      break;
    case 4:
      dada.innerHTML = `
        <div class="row">
        <div class="col-md-4">
          <p id="detal">${ok.plano}</p>
        </div>
        <div class="col-md-8">
          <p> ${ok.device}</p>
        </div>
      </div>
      <div class="row my-3">
        <div class="col-md-12 text-center">
          <p id="warn"> Será cobrado &euro;3 por cada dia de aluguer e somado ao valor do pacote </p>
        </div>
      </div>
        `;
      break;
    default:
      console.log(
        'que opcao de mostrar detalhes é essa ( dafault valor/caso )'
      );
  }
}

$(document).ready(function() {
  $('.slide-banners').slick({
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 3,
  });
});
