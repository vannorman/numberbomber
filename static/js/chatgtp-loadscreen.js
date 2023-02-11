var pin = '';
var currentBox = 0;
var pinBoxes = $('.pin-box');
$(document).ready(function() {

  $('.pin-box input').on('input', function() {
    var value = $(this).val();
    if (!isNaN(value)) {
      pin += value;
      currentBox++;
      if (currentBox < pinBoxes.length) {
        $(pinBoxes[currentBox]).addClass('selected');
        $(pinBoxes[currentBox - 1]).removeClass('selected');
        $(pinBoxes[currentBox]).find('input').focus();
      } else {
        if (pin === '1234') {
          $('.loading-screen').hide();
        } else {
          $('.loading-screen').addClass('shake');
           ClearPin();

          setTimeout(function() {
            $('.loading-screen').removeClass('shake');},800);
            }
        }
     }
  });

});

function ClearPin(){
    pin = '';
    currentBox = 0;
    for(let i=0;i<pinBoxes.length;i++) {
       $(pinBoxes[i]).find('input').val(''); 
       if (i == 0){
            $(pinBoxes[i]).find('input').focus();
            $(pinBoxes[i]).addClass('selected');
       }
       else {
            $(pinBoxes[i]).removeClass('selected');
        }
    }

}

