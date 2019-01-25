$(document).ready(function() {

    //active option

    var utilTkt = {
      "provider": "",
      "baseUrl": "http://admin.costamaragencias.com/",  // for production change this to => http://admin.costamaragencias.com/ -develop => http://localhost/costamaragencias/
      "lang" : "es/",
      "indicatorBTFare" : $("#indicatorBTFare")
    };

    if(window.location.pathname.indexOf("/en") != -1) {
        utilTkt.lang = "en/";
    }

    if($('#indicatorBTFare').val() == "1") {
        $('#radBTFare').prop('checked', true);
    }
    if($('#txtFlybus').val() == '1'){
        $('#radFLYBUSFare').prop('checked', true);
    }

    $("input[name='radFareType']").on('click', function() {
        $('#txtFlybus').val("0");
       if($(this).attr('id') == 'radBTFare' && $(this).is(':checked')) {
           utilTkt.indicatorBTFare.val(1);
           //$('.content-payment-general').hide();
       } else if($(this).attr('id') == 'radFLYBUSFare' && $(this).is(':checked')){
           utilTkt.indicatorBTFare.val(1);
           $('#txtFlybus').val("1");
       } else {
           utilTkt.indicatorBTFare.val(0);
           //$('.content-payment-general').show();
       }
    });

	if($.trim($('#providerTemp').val()) != "") {

        utilTkt.provider = $.trim($('#providerTemp').val());

		$('#selectprovider option[value='+utilTkt.provider+']').prop('selected', true);

        if($('.alert-error').length > 0) {
            $('html, body').animate({
                // scrollTop: $(".alert-error").offset().top
            }, 1000);
        }

        if($('.content-emission').length > 0) {
            $('html, body').animate({
                // scrollTop: $("#btnSendEmission").offset().top
            }, 1000);
        }
        
	}

    /* is kiu */
    if(utilTkt.provider == "119") {
        var tktKiuFares = {
            "additionalCommission" : $.trim($('input[name="additionalCommission"]').val()),
            "commissionAgy" : $('input[name="commission"]').val(),
            "airline" : $('input[name="airlineIdFromSegmentGroup"]').val(),
            "baseFare" :  $('input[name="baseFare"]').val()
        }
        tktKiuFares.newCommissionOnCredit = calculateCommissionByAirline(tktKiuFares.airline, tktKiuFares.commissionAgy, tktKiuFares.additionalCommission, tktKiuFares.baseFare);
    }


    // error code validation
    if($('input[name="errorCode"]').length > 0 && $('input[name="errorCode"]').val() == "RP") {
        //$('#mdl-errorcode-rp').modal('show');
        $('#mdl-errorcode-rp').modal({backdrop: 'static', keyboard: false})  
        $('input[name="repriceStatus"]').val(true);
    }

    /* handle click confirm button error code RP */
    $('#btnsendrp').on('click', function(e){
        e.preventDefault();
        $('#frmTicketing').submit();
    });

    if($('.result-emission-general').length>0) {
        $('html, body').animate({
            // scrollTop: $(".result-emission-general").offset().top
        }, 1000);
    }


    /* get info*/
	$('#frmTicketing').submit(function(e) {
		
		var formValues = $(this).serializeArray();

		/* validacion */
		if(!validationFormGetInfo(formValues)) {
			e.preventDefault();
		} else {
                /* loading */
                $(this).find('.clsbuscar').css("pointer-events", "none");
                $(".alert-error").alert('close');
                $('.clsbuscar').prop('disabled', true);
                $('.spngetinfo').addClass('show-spngetinfo');

                $(document).bind('keypress keydown keyup', function(e) {
                    if(e.which === 82 && e.ctrlKey) {    // Ctrl +R key code
                        return false;
                    }
                });

                $(document).bind('keydown', function(e) {   //F5 Key code
                    var event = window.event || e;
                    if (event.keyCode == 116) {
                        event.keyCode = 0;
                        return false;
                    }
                });
            //}
		}


	});

    /* emission */
    $("#frmIssue").submit(function(event) {

        /* validacion tarjeta */
        var contentCC = $('.container-cc input');
        var formOfPayment = $.trim($("#selectwaytopay").val());
        var paxCheckedAndNotDisabled = $('input[name="toIssue[]"]').filter(function () {
            return !this.disabled && this.checked;
        });

        var amountCreditDefaultAgy = parseFloat($('input[name="creditAvailable"]').val().replace(",","")).toFixed(2);
        var amountCreditAuthorizedAgy = 0;
        if($('input[name="authorizationAmount"]').val() !== undefined && $('input[name="authorizationAmount"]').val() != null) {
            amountCreditAuthorizedAgy = parseFloat($('input[name="authorizationAmount"]').val().replace(",","")).toFixed(2);
        }
        var totalAmountCreditTempAuthorized = parseFloat(amountCreditAuthorizedAgy);
        var totalAmountOfPnr = "";
        if($('input[name="totalAmount"]').length){
            totalAmountOfPnr = parseFloat($('input[name="totalAmount"]').val().replace(",","")).toFixed(2);
        }
        var resultFieldCardValidation = validateFieldsCard(contentCC, formOfPayment);
        var resultFieldsAmountPaymentMX = validateFieldAmountsPaymentMultiple(formOfPayment);
        var resultPaxCheckedValidation = validatePaxChecked(paxCheckedAndNotDisabled);
        var resultFieldsDocumentValidation = validateFieldDocuments();
        var resultDateFormatValidation = validateDateFormat();
        var resultAmountApprovedValidationForCash = false;
        if(formOfPayment == "CA") {
            resultAmountApprovedValidationForCash = validateCreditAvailableForCash(amountCreditDefaultAgy, totalAmountCreditTempAuthorized, totalAmountOfPnr);
        }
        var resultAmountApprovedValidationForMX = false;
        if(formOfPayment == "MX") {
            resultAmountApprovedValidationForMX = validateCreditApprovedForMX(amountCreditDefaultAgy);
        }


        if(resultPaxCheckedValidation.status) {
            alert(resultPaxCheckedValidation.message);
            event.preventDefault();
        }else if(resultFieldsDocumentValidation.status) {
            alert(resultFieldsDocumentValidation.message);
            event.preventDefault();
        }else if(resultDateFormatValidation.status) {
            alert(resultDateFormatValidation.message);
            event.preventDefault();
        }else if(resultFieldsAmountPaymentMX.status) {
            alert(resultFieldsAmountPaymentMX.message);
            event.preventDefault();
        }else if(formOfPayment == "") {
            alert("Por favor seleccione una forma de pago.");
            event.preventDefault();
        }else if(resultFieldCardValidation.status) {
            alert(resultFieldCardValidation.message);
            event.preventDefault();
        }else if(resultAmountApprovedValidationForCash.status) {
            alert('¡ALERTA!' + resultAmountApprovedValidationForCash.message);
            event.preventDefault();
        }else if(resultAmountApprovedValidationForMX.status) {
            alert(resultAmountApprovedValidationForMX.message);
            event.preventDefault();
        }else if($('#fareEndorsement').length>0 && $.trim($('#fareEndorsement').val()) == "") {
            alert("Por favor ingrese un Nro de boleta o factura.");
            event.preventDefault();
        }else {

            $('#cover-block').show();
            $('#cover-block').addClass('cover-block');
            $('.content-spinner').addClass('show-spnemission');

            $(document).bind('keypress keydown keyup', function(e) {
                if(e.which === 82 && e.ctrlKey) {    // Ctrl +R key code
                    return false;
                }
            });

            $(document).bind('keydown', function(e) {   //F5 Key code
                var event = window.event || e;
                if (event.keyCode == 116) {
                    event.keyCode = 0;
                    return false;
                }
            });
        }
    });

    function validateCreditAvailableForCash(amountCreditDefaultAgy, creditAmountAuthorizedAgy, totalAmountPnr){
        var statusEmission = false;
        var message = "Tu línea de crédito disponible no es suficiente.";
        if(creditAmountAuthorizedAgy == 0) {
            if(parseFloat(amountCreditDefaultAgy) < parseFloat(totalAmountPnr)){
                statusEmission = true;
            }
        }else{
            if(parseFloat(creditAmountAuthorizedAgy) < parseFloat(totalAmountPnr)){
                statusEmission = true;
            }
        }

        var obj = {"status":statusEmission,"message":message};
        return obj;
    }

    function validateCreditApprovedForMX(creditAmountAgy) {
        var statusEmission = false;
        var message = "El monto ingresado en cash supera tu línea de crédito disponible , además en este caso no aplica un monto autorizado.";
        var amountInCash = parseFloat($('input[name="multipleAmountCash"]').val());
        if(parseFloat(creditAmountAgy) < parseFloat(amountInCash)) {
            statusEmission = true;
        }
        var obj = {"status":statusEmission,"message":message};
        return obj;
    }

    function validateFieldsCard(contentCC, formOfPayment) {
        var statusEmission = false;
        var message = "Por favor completa los campos obligatorios de la tarjeta de crédito.";
        if(formOfPayment == "CC" || formOfPayment == "MX") {
            for(var i = 0; i< contentCC.length; i++) {
                if($.trim(contentCC[i].value) == "") {
                    statusEmission = true;
                    break;
                }
            }

            if($.trim($('input[name="bankName"]').val()) == "") {
                statusEmission = true;
            }
            var monyea = $.trim($('input[name="month"]').val()) + $.trim($('input[name="year"]').val());
            var long = monyea.length;
            if (long != 4){
                statusEmission = true;
            }
        }

        var obj = {"status":statusEmission,"message":message};
        return obj;
    }

    function validateFieldAmountsPaymentMultiple(formOfPayment) {
        var statusEmission = false;
        var message = "";
        
        if(formOfPayment == "MX"){
            if($.trim($('input[name="multipleAmountCredit"]').val()) == ""){
                message = "Ingresa un monto para pagar con tarjeta de crédito.";
                statusEmission = true;
            }else if($.trim($('input[name="multipleAmountCash"]').val()) == ""){
                message = "Ingresa un monto para pagar en cash.";
                statusEmission = true;
            }
        }
        var obj = {"status":statusEmission,"message": message};
        return obj;
    }

	function validationFormGetInfo(formValues) {
		var status = true;
		if($.trim(formValues[5].value) == "") {
			alert("Por favor ingrese un apellido.");
			status = false;
		}else if( "4" in formValues && $.trim(formValues[4].value) == "") {
			alert("Por favor ingrese un pnr.");
			status = false;
		}
		return status;
	}

    /* emission */

    $(document).on('change','#selectwaytopay', function() {

        var wayToPay = this.value;

        if(wayToPay == "CC") {
            $('.content-auth').hide();
            if($("#providerForSend").val()=="119"){
                $(".cls-applcode").show();
            }
            if($("#btnSendEmission").length >0){
                $('html, body').animate({
                    // scrollTop: $("#btnSendEmission").offset().top
                }, 500);
            }
            $('.cls-info-cc').show();
            $('.content-payment-multiple').hide();
            $('.content-bankname').show();
            $('#cardNumber').val('');
            $('#cardNumber').focus();
            $('.credit-card img').css('opacity','0.4');
            if(utilTkt.provider == "119") {
                if($(this).next().text() != "true"){
                    $('input[name="commission"]').val(tktKiuFares.newCommissionOnCredit);
                } else {
                    $('input[name="commission"]').val(tktKiuFares.commissionAgy);
                }
            }


        } else if(wayToPay == "MX") {
            $('.content-auth').hide();
            if($("#providerForSend").val()=="119"){
                $(".cls-applcode").show();
            }
            $('.cls-info-cc').show();
            $('.content-payment-multiple').show();
            $('.content-bankname').show();
            $('html, body').animate({
                // scrollTop: $("input[name='multipleAmountCredit']").offset().top
            }, 500);
            $('#cardNumber').val('');
            $('#cardNumber').focus();
            $('.credit-card img').css('opacity','0.4');
            $('.content-stallmentsCC').find('select').prop('disabled',true);
            $('.content-stallmentsCC').hide();
            if(utilTkt.provider == "119") {
                $('input[name="commission"]').val(tktKiuFares.commissionAgy);
            }
        } else { //CA
            $('.content-auth').show();
            $(".cls-applcode input").val("");
            $(".cls-applcode").hide();
            $('.cls-info-cc').hide();
            $('.content-payment-multiple').hide();
            $('.content-bankname').hide();
            $('.content-stallmentsCC').find('select').prop('disabled',true);
            $('.content-stallmentsCC').hide();
            if(utilTkt.provider == "119") {
                finalCommission = tktKiuFares.newCommissionOnCredit;
                if(parseFloat(tktKiuFares.commissionAgy) > parseFloat(tktKiuFares.newCommissionOnCredit)) {
                    finalCommission = tktKiuFares.commissionAgy;
                }
                $('input[name="commission"]').val(finalCommission);
            }
        }
    });


    /* indicator wsp */
    if($('#indicatorwsp').length > 0) {
        $('#frmTicketing').find('input[name="chkBTFare"]').prop("disabled",true);
        $('#selectprovider option[value=106]').prop('selected', true);
        $('#pnr').val($('input[name="pnrForSendWSP"]').val());

        $('html, body').animate({
            // scrollTop: $('.custom-div-tbl-pax').offset().top
        }, 1000);
    }

    /* begins form of payment wsp */
    $(document).on('change','#selectwaytopayWS', function() {

        var wayToPay = this.value;
        if(wayToPay == "CC") {
            $('html, body').animate({
                // scrollTop: $("#btnSendEmissionWS").offset().top
            }, 500);
            $('.cls-info-cc').show();
            $('.content-payment-multiple').hide();
        } else if(wayToPay == "MX") {
            $('.cls-info-cc').show();
            $('.content-payment-multiple').show();
            $('html, body').animate({
                // scrollTop: $("input[name='multipleAmountCredit']").offset().top
            }, 500);
            $('.content-stallmentsCC').find('select').prop('disabled',true);
            $('.content-stallmentsCC').hide();
        } else {
            $('.cls-info-cc').hide();
            $('.content-payment-multiple').hide();
            $('.content-stallmentsCC').find('select').prop('disabled',true);
            $('.content-stallmentsCC').hide();
        }
    });
    /* ends form of payment wsp */

    /* begins form of payment btfare */
    $(document).on('change','#selectwaytopayBTFare', function() {

        var wayToPay = this.value;
        if(wayToPay == "CC") {
            $('html, body').animate({
                // scrollTop: $("#btnSendEmissionBtFare").offset().top
            }, 500);
            $('.cls-info-cc').show();
            $('.content-payment-multiple').hide();
        } else if(wayToPay == "MX") {
            $('.cls-info-cc').show();
            $('.content-payment-multiple').show();
            $('html, body').animate({
                // scrollTop: $("input[name='multipleAmountCredit']").offset().top
            }, 500);
            $('.content-stallmentsCC').find('select').prop('disabled',true);
            $('.content-stallmentsCC').hide();
        } else {
            $('.cls-info-cc').hide();
            $('.content-payment-multiple').hide();
            $('.content-stallmentsCC').find('select').prop('disabled',true);
            $('.content-stallmentsCC').hide();
        }
    });
    /* ends form of payment btfare */

    /* begins worldspan pax */

    var idRowPax = 0;
    $(document).on('click','.clsws-add-pax', function(event) {
        idRowPax++;
        $row = '<tr id="paxrow'+idRowPax+'">' +
        '<td><input type="text" name="lastNameP[]" class="form-control"></td>' +
        '<td><input type="text" name="firstName[]" class="form-control"></td>' +
        '<td><input type="text" name="birthDay[]" class="form-control" placeholder="yyyy-MM-dd"></td>' +
        '<td><select name="sex[]" class="form-control">' +
        '<option value="M">M</option>'+
        '<option value="F">F</option>'+
        '</select></td>'+
        '<td><select name="type[]" class="form-control">' +
        '<option value="ADT">ADT</option>'+
        '<option value="CHD">CHD</option>'+
        '<option value="INF">INF</option>'+
        '</select></td>'+
        '<td><select name="typeDocument[]" id="selecttypedocumentWS" class="form-control" >'+
        '<option value="ID">DNI</option>'+
        '<option value="RUC">RUC</option>'+
        '<option value="PP">Pasaporte</option>'+
        '<option value="FC">Carnet de Extranjeria</option>'+
        '<option value="NN">Otros</option>'+
        '</select></td>'+
        '<td><input style="" class="form-control" type="text" name="nroDocument[]" value=""></td>' +
        '<td><button type="button" class="btn btn-default" id="btndelete-row" onclick="deletePax('+idRowPax+')"><i class="fa fa-minus"></i></button></td>' +
        '</tr>';
        debugger;
        $('.customtbl-tkt > tbody:last-child').append($row);
    });


    window.deletePax = function(id){
        $('#paxrow'+id).remove();
    };
    /* ends worldspan pax*/


    $(document).on('blur', '#cardNumber', function(){
        var urlCard = $('#urlAux').val()+"/apirest/getClonedCards/"+$('#cardNumber').val();
        var isValid = 0;
        $.ajax({
            url: urlCard,
            dataType: 'json',
            type: 'GET',
            success : function(response) {
                isValid = response;
                if(isValid == 1) {
                    alert("El número de tarjeta está registrado en nuestro sistema como Chargeback.");
                    $('#cardNumber').val("");
                }
            }
        });
    });

    $(document).on('keyup', '#cardNumber', function() {
        $('.credit-card img').css('opacity','0.4');
        $('#typeCard').val("");
        var listCards = $('.credit-card img');
        var type = helperTkt.getCreditCardType($.trim($('#cardNumber').val()));
        var existsInstallmentCCPayment = $('input[name="acceptInstallmentCCPayment"]').val();
        var formOfPayment = $.trim($("#selectwaytopay").val());
        if(acceptsInstallmentCCPayment(existsInstallmentCCPayment, type, formOfPayment)) {
            $('.content-stallmentsCC').find('select').prop('disabled',false);
            $('.content-stallmentsCC').show();
        }else{
            $('.content-stallmentsCC').find('select').prop('disabled',true);
            $('.content-stallmentsCC').hide();
        }
        $('#typeCard').val(type);
        if($('#typeCardWS').length>0) {
            $('#typeCardWS').val(type);
        }
        for (var i = 0; i < listCards.length; i++) {
            if(listCards[i].alt == type){
                $('#'+listCards[i].id).css('opacity', '1');
                break;
            }
        };
    });

    function acceptsInstallmentCCPayment(existsInstallmentCCPayment, typeCC, formOfPayment) {
        return (existsInstallmentCCPayment == "true" && typeCC == "VI" && formOfPayment == "CC");
    }

    $('input[name="multipleAmountCredit"]').keyup(function() {

        var amountCredit = $.trim($(this).val());
        if(amountCredit == ""){
            $('.content-payment-multiple input').val("");
        }else{
            if(!helperTkt.isValidAmount(amountCredit)) {
                alert("El monto es incorrecto.");
                $('.content-payment-multiple input').val("");
            } else if(exceedsTotalAmount(amountCredit)) {
                alert("El valor excede al total de la tarifa.");
                $('.content-payment-multiple input').val("");
            } else {
                var totalAmount = $('input[name="totalAmount"]').val().replace(',', '');
                if(helperTkt.isValidAmount(totalAmount)){
                    var amountCash = parseFloat(totalAmount) - parseFloat(amountCredit);
                    $('input[name="multipleAmountCash"]').val(parseFloat(amountCash.toFixed(2)));
                }else{
                    alert("Necesita ingresar el Total de la Tarifa.");
                }
            }
        }
    });

    $('input[name="totalAmount"]').keyup(function(){
       if(!helperTkt.isValidAmount($.trim($(this).val()))) {
           alert("El monto es incorrecto");
           $(this).val('');
       }
    });

    $('input[name="multipleAmountCash"]').keyup(function() {   
        var amountCash = $.trim($(this).val());
        if(amountCash == "") {
            $('.content-payment-multiple input').val("");
        }else{
            if(!helperTkt.isValidAmount(amountCash)) {
                alert("El monto es incorrecto.");
                $('.content-payment-multiple input').val("");
            }else if(exceedsTotalAmount(amountCash)) {
                alert("El valor excede al total de la tarifa.");
                $('.content-payment-multiple input').val("");
            }else{
                var totalAmount = $('input[name="totalAmount"]').val().replace(',', '');
                var amountCredit = parseFloat(totalAmount) - parseFloat(amountCash);
                $('input[name="multipleAmountCredit"]').val(parseFloat(amountCredit.toFixed(2))); 
            }
        }
    });
    


    function exceedsTotalAmount(amount) {
        var status = false;
        if($('input[name="totalAmount"]').val() != undefined){
            var totalAmount = $('input[name="totalAmount"]').val().replace(',', '');
            if(parseFloat(amount) > parseFloat(totalAmount) ){
                status = true;
            }
        }
        return status;
    }

    function validatePaxChecked(element) {
        var statusEmission = false;
        var message = "No tiene pasajeros seleccionados o todos los pasajeros cuentan con tickets.";
        if(element.length==0) {
            statusEmission = true;
        }
        var obj = {"status":statusEmission,"message": message};
        return obj;
    }

    function validateFieldDocuments() {
        var statusEmission = false;
        var message = "Por favor complete los campos del pasajero, por ejemplo: Documentos de identidad, Foid/País, Fecha de Nac. o género.";

        $('#tblpassengers tbody>tr').each(function () {
            var ischeck = $(this).find('input[type="checkbox"]').is(':checked');
            if(ischeck){
                var $fieldInputs = $(this).find('input[type="text"]');
                $fieldInputs.each(function(){
                    if(!$(this).is('[readonly]')){
                        if($.trim($(this).val()) == "") {
                            statusEmission = true;
                            return false;
                        }
                    }
                    if($(this).attr('name') == "foidCountry[]") {
                        if($.trim($(this).val()).length < 2){
                            statusEmission = true;
                            message = "El país debe tener 2 caracteres.";
                        }
                    }
                    
                })
            }
        })

        var obj = {"status":statusEmission,"message": message};
        return obj;
    }

    $('input[name="nroDocument[]"]').on("change, keyup", function() {
        var dni = $.trim($(this).val());
        $(this).parent().parent().find('input[type="checkbox"]').val(dni);
    });


    /* button for worldspan */
    $(document).on('click', '#btnSendEmissionWS', function() {
        $('#cover-block').show();
        $('.content-spinner').find('label').text("Estamos procesando la solicitud, por favor espere...");
        $('#cover-block').addClass('cover-block');
        $('.content-spinner').addClass('show-spnemission');
    });

    /* button for bt fare */
    $(document).on('click', '#btnSendEmissionBtFare', function(e) {
        var contentCC = $('.container-cc input');
        var formOfPayment = $.trim($("#selectwaytopayBTFare").val());
        var resultFieldCardValidation = validateFieldsCard(contentCC, formOfPayment);
        if($('.customtbl-tkt>tbody').find('tr').length == 0) {
            alert("Necesita agregar al menos un pasajero");
            return false;
        }else if($.trim($('input[name="totalAmount"]').val()) == "" || $.trim($('input[name="fee"]').val()) == "") {
            alert("Por favor ingrese el monto total de la tarifa y fee");
            return false;
        }else if(resultFieldCardValidation.status) {
            alert(resultFieldCardValidation.message);
            return false;
        }else{
            $('#cover-block').show();
            $('.content-spinner').find('label').text("Estamos procesando la solicitud, por favor espere...");
            $('#cover-block').addClass('cover-block');
            $('.content-spinner').addClass('show-spnemission');
        }
    });


    $('input[name="toIssue[]"]').on('click', function() {

        if(!$(this).is(':checked')) {
            $(this).parent().parent().css("background-color","#ECECEC");
            $(this).parent().parent().find('input[type="text"]').prop("disabled", true);
            $(this).parent().parent().find('input[type="hidden"]').prop("disabled", true);
            $(this).parent().parent().find('select').prop("disabled", true);
        }else{
            $(this).parent().parent().css("background-color","transparent");
            $(this).parent().parent().find('input').prop("disabled", false);
            $(this).parent().parent().find('select').prop("disabled", false);
        }
    });

    function validateDateFormat() {
        var statusEmission = false;
        var message = "El formato de fecha no es válido.";

        var pattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        if($('input[name="birthDay[]"]').length>0) {
            $('input[name="birthDay[]"]').each(function () {
                var ischeck = $(this).parent().parent().find('input[type="checkbox"]').is(':checked');
                if(ischeck) {
                    if(!pattern.test($.trim($(this).val()))) {
                        statusEmission = true;
                        return false;
                    }
                }
            });
        }

        var obj = {"status":statusEmission, "message": message};
        return obj;
    }


    if($('select[name="typeDocument[]"]').val() == "NN" && $('#providerForSend').val() == "119" ) {
        $('#tblpassengers').find('input[name="nroDocument[]"]').prop('disabled', true);
    }

    $('select[name="typeDocument[]"]').on('change',function(){
        if($(this).val() == "NN" && utilTkt.provider == "119" ) {
            $(this).parent().parent().find('input[name="nroDocument[]"]').prop("disabled", true);
        }else{
            $(this).parent().parent().find('input[name="nroDocument[]"]').prop("disabled", false);
        }
    });

    function calculateCommissionByAirline(airline, commissionAgy, additionalCommission, baseFare) {
        var commissionFixed = 0;
        var commissionPercentage = 0;
        if(airline == "2I") {
            commissionPercentage = 0.03;
        }else if(airline == "P9") {
            commissionPercentage = 0.05;
        }else if(airline == "W4" && parseFloat(commissionAgy) != 0) {
            commissionPercentage = 0.07;
        }else if(airline == "Z8") {
            commissionPercentage = 0.03;
        }

        var newCommission = (parseFloat(commissionPercentage) + parseFloat(additionalCommission)).toFixed(2);
        var commissionResult = parseFloat(baseFare) * parseFloat(newCommission);
        var commissionWithIgv = commissionResult * 1.18;
        commissionFixed = commissionWithIgv.toFixed(2);

        if(airline == "" || commissionPercentage == 0) {
            commissionFixed = commissionAgy;
        }

        return commissionFixed;

    }

    $('select[name="foidTypeDocument[]"]').on('change', function(){
        var typeDoc = this.value;

        if($.trim($('#providerTemp').val()) == "113") {
            if(typeDoc == "PP") {
                $(this).parent().next().find('input[name="foidCountry[]"]').remove();                
                $inputCountry = '<input type="text" maxlength="2" name="foidCountry[]" class="" style="width: 32px; margin-top: 5px;" autocomplete="off">';
                $spanCountry = '<span style="display: inline;margin-left: 5px !important;">País</span>';
                $(this).parent().next().append($inputCountry);
                $(this).parent().next().append($spanCountry);
            }else{
                
                $(this).parent().next().find('input[name="foidCountry[]"]').remove();
                $(this).parent().next().find('span').remove();
                $inputCountry = '<input type="hidden" maxlength="2" name="foidCountry[]" autocomplete="off">';
                $(this).parent().next().append($inputCountry);
            }
        }   
        
    });

    $('input[name="nroDocument[]"]').keypress(function (e) {
        var typeDocument = $(this).parent().prev().find('select').val();
        var regex = "^[0-9\-]+$";
        if(onlyAlfanumeric(typeDocument)) {
            regex = "^[a-zA-Z0-9\-]+$";
        }
        var allowedChars = new RegExp(regex);
        var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (allowedChars.test(str)) {
            return true;
        }
        e.preventDefault();
        return false;
    }).keyup(function() {
        var typeDocument = $(this).parent().prev().find('select').val();
        var regex = "[^0-9\-]";
        if(onlyAlfanumeric(typeDocument)) {
            regex = "[^a-zA-Z0-9\-]";
        }
        var forbiddenChars = new RegExp(regex, 'g');
        if (forbiddenChars.test($(this).val())) {
            $(this).val($(this).val().replace(forbiddenChars, ''));
        }
    }); 

    function onlyAlfanumeric(typeDocument) {
        var result = false;
        if(typeDocument == "PP" || typeDocument == "FC" || typeDocument == "NN") {
            result = true;
        }
        return result;
    }

    /*
    $('#frmTicketing :radio').click(function() {
        var $checkBoxBTFare = $(this);
        var btnBuscar = $('#frmTicketing').find('button[type="submit"]');
        var inputPnr = $('#pnr');
        if ($checkBoxBTFare.is(':checked')) {
            btnBuscar.removeClass('clsbuscar');
            btnBuscar.addClass('clsbuscar-codebt');
            $('#lastName').prop('disabled', true);
            inputPnr.removeAttr('maxlength');
        } else {
            btnBuscar.removeClass('clsbuscar-codebt');
            btnBuscar.addClass('clsbuscar');
            $('#lastName').prop('disabled', false);
            $('.content-packages').empty();
            inputPnr.attr('maxlength','6');
        }
    });*/


    /*function showFormOfBTFare() {
        $('.result-emission-general').remove();
        $('#frmIssue').remove();
        $('.cls-result-btfare').remove();
        var codeBT = $.trim($('#pnr').val());
        var data = {
            "path" : utilTkt.baseUrl+utilTkt.lang+"ticketing/emission",
            "cards" : [{id:"vi",alt:"VI",src: utilTkt.baseUrl+"img/creditcards/visa_32.png"},
                {id:"mc",alt:"MC",src:utilTkt.baseUrl+"img/creditcards/mastercard_32.png"},
                {id:"ds",alt:"DS",src:utilTkt.baseUrl+"img/creditcards/discover_32.png"},
                {id:"dc",alt:"DC",src:utilTkt.baseUrl+"img/creditcards/diners_club_32.png"},
                {id:"ax",alt:"AX",src:utilTkt.baseUrl+"img/creditcards/american_express_32.png"}],
            "code" : codeBT
        };
        $.get(utilTkt.baseUrl+"js/templatesticketing/infopackages.mustache.html?v1.9.2", function(template, status){
            var output = Mustache.render(template, data);
            $(".content-packages").html(output);
        });

        $('html, body').animate({
            scrollTop: $(".clsbuscar-codebt").offset().top
        }, 1000);
    }*/



});