$(document).ready(function() {
  var pin = '';
  var pinBoxes = $('.pin-box');
  var currentBox = 0;

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
          setTimeout(function() {
            $('.loading-screen').removeClass('shake');},800);
            }
        }
     }
  });

});

