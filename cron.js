let cron = require('node-cron')
let Momento = require('moment')
const mysql = require('mysql')

 

// 24 horas >> 0 0 0/24 1/1 * ? *
cron.schedule('* * * * *', () => {
  console.log('running a task every minute')
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'terrasystem',
    database : 'adonisIntro'
  });

    connection.connect();

    let dados = {}
 
    connection.query('SELECT * from bookings', function (error, results, fields) {
    if (error) throw error;
        console.log('bookings: ', results.lenght)

        for(let i=0;i< results.lenght;i++){
            dados = {
                user_id: results[i].user_id,
                pickupdate: results[i].pickupdate
            }
        }
    });
    
    connection.end();
    console.log('dados: ')
    console.log(dados)

   for(let a = 0;a<){
        // Inicializamos o objeto Date() com data e horário atual
        const date1 = new Date();
        // Inicializamos uma data no passado
        const date2 = new Date(results[0].pickupdate)
    
        // Verificamos se primeira data é igual, maior ou menor que a segunda
        if (date1.getTime() === date2.getTime()) {
            console.log('As datas são iguais')
            console.log('ultimo dia para pickupdate é hoje')
        }
        else if (date1.getTime() > date2.getTime()) {//se data de hoje é menor que pickupdate
            console.log(date1.toString() + ' maior que ' + date2.toString())
            console.log('A pickupdate foi ultrapassada, reserva terminada por no showup')
            // insert data in devolver
            connection.connect()
        
            connection.query('UPDATE bookings SET devolver = ? WHERE id = ?', [new Date(), dados.user_id], function (error, results, fields) {
            if (error) throw error;
                console.log('pickupdate: ', results)
            });
            
            connection.end()
        }
        else {
            console.log(date1.toString() + ' menor que ' + date2.toString());
            console.log('A pickupdate ainda por atingir, reserva em dia')
        }
   }
   
});