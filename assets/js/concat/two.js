function setCuantificacionAvancesGestionesCobranza(dates, datesObject)
{
	$.each($(".f-g-cobro"), function( index, value ) {
		cellValue = $(value).text().trim();
		if(cellValue != ""){
			if(dates.indexOf(cellValue) != -1 ){
				datesObject[cellValue] = datesObject[cellValue] + 1;
			}
		}
	});

	return datesObject;
}

// sen email, show results in modal
$('form#form').submit(function(event){
	event.preventDefault();
	$("#sendMail").modal({
		keyboard: false, // Prevent Bootstrap Modal from disappearing when clicking outside or pressing escap
		backdrop: 'static'
	});
	$('p.loading').removeClass('hidden');
	$('div#sendMail .btn-default').prop('disabled', true);
	$("#sendMail").modal('show');
	var
		$form = $( this ),
		$button = $( this ).find('button')
	;
	var parameters = JSON.parse('['+$('input#parameters').val()+']');
	var accounts = '';
	$.each(parameters, function( index, value ) {
		accounts += '<li>'+ value.Name+'</li>';
	});
	$('ul.accounts').html(accounts);
	$.ajax({
		type    	: 'POST',
		url     	: $form.attr( "action" ),
		data    	: $form.serialize(),
		dataType  	: 'JSON',
		encode    	: true
	}).done(function(data){
		$('p.loading').addClass('hidden');
		$('div#sendMail .btn-default').prop('disabled', false);
		if(data.code == 500){
			$('ul.accounts').html("<li><strong>El servidor no responde</strong></li>");
		} else {
			var html = '';
			$.each(data.message, function( accountid, column ) {
				html += '<li>'+ column.name;
				if(jQuery.type(column.shipping) == 'array'){
					html += '<ul> Se genero correctamente el archivo <strong>ESTADO DE CUENTA COSTAMAR';
					html += 'ID:' + accountid + '.xlsx</strong>';
					html += ', se enviara por mensaje a los siguientes correos:';
					$.each(column.shipping, function( index, items ) {
						$.each(items, function( email, message ) {
							html += '<li>'+ email + ' : <strong>' + message+ '</strong></li>';
						});
					});
					html += '</ul>';
				} else if(jQuery.type(column.shipping) == 'string'){
					html += '<ul>' + column.shipping + '</ul>';
				}
				html += '</li>';
			});
			$('ul.accounts').html(html);
		}
	}).fail(function(data){
		$('p.loading').removeClass('hidden');
	});

});