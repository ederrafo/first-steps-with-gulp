$(document).ready(function(){
  var fares = [];
  if ($("#allFares").is(':checked')) {
      $('.chkTarifa>input').attr("disabled", true);
  }

  $('.chkTarifa>input').each(function() {
    if($(this).is(':checked')) {
      fares.push($(this).val());
    }
  });
	
	$("#allFares").on('click', function() {
	   var $inputFares = $('.chkTarifa>input');
	   fares = []
       if($(this).is(':checked')) {
       		 var fareTypes = [];
       		 $($inputFares).each(function() {
			       fareTypes.push($(this).val());
			     });
       		 $('#fareType').val(fareTypes.join(","));
           	$inputFares.prop('checked', false);
            $inputFares.attr("disabled", true);
       } else {
       		$('#fareType').val("");
       		$($inputFares).attr("disabled", false);
       }
    });
	
    $("input[name='chkTarifa']").on('click', function() {
    	
    	if($(this).is(':checked')) {
    		fares.push($(this).val());
    	}else {
    		var index = fares.indexOf($(this).val());
    		if (index > -1) {
			    fares.splice(index, 1);
			}
    	}
    	$('#fareType').val(fares.join(","));
    });

});