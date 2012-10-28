$(function(){
  $.fn.fly.bubbles();

  window.setTimeout(function() {
    $.fn.fly.bubbles();
  }, 1000);
});
