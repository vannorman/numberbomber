var pin = [0,0,0,0];
var currentBox = 0;
var pinBoxes = $('.pin-box');
$(document).ready(function() {
    if (Settings.debug){
        $('.loading-screen').hide();
        return;
    }
    $('.pin-box input').focus( function() {
        let index = $(this).parent().index();
        currentBox = index;
        $(this).val('');
        pin[index]=0;

    });
    
    $('.pin-box input').keyup(function () { 
        this.value = this.value.replace(/[^0-9\.]/g,'');
    });


    document.addEventListener("keydown", KeyCheck);  //or however you are calling your method
    $('.pin-box input').on('input', function() {

    //backspace key?

    let value = parseInt($(this).val());
    let index = $(this).parent().index();
    if (!isNaN(value)) {
      pin[index] = value;
      currentBox++;
      if (currentBox < pinBoxes.length) {
        $(pinBoxes[currentBox]).addClass('selected');
        $(pinBoxes[currentBox - 1]).removeClass('selected');
        $(pinBoxes[currentBox]).find('input').focus();
      } else {
        if (pin.every((el, ix) => el === [1,2,3,4][ix])){ 
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


   $(pinBoxes[currentBox]).find('input').focus();
    

});

function ClearPin(){
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

function KeyCheck(event)
{
   var KeyID = event.keyCode;
   switch(KeyID)
   {
      case 8:
    //      alert("backspace");
        $(pinBoxes[currentBox]).removeClass('selected').find('input').val('');
        if (currentBox > 0) currentBox--;

        $(pinBoxes[currentBox]).addClass('selected').find('input').focus();
      break;
      case 46:
      alert("delete");
      break;
      default:
      break;
   }
}

