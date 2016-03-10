jQuery(function($) {
    $('div.inline-group tbody').sortable({
        /*containment: 'parent',
        zindex: 10, */
        update: function() {
            $(this).find('tr').each(function(i) {
                if ($(this).find('input[id$=name]').val()) {
                    $(this).find('input[id$=order]').val(i+1);
                }
            });
        }
    });
    $('div.inline-group tbody tr').css('cursor', 'move');
    $('div.inline-group').each(function(){
        var par = $(this);
        par.find('tbody tr td').each(
            function (idx){
                if($(this).is('*.field-order')){
                    $(this).hide();
                    par.find('thead th:nth-child('+idx+')').hide();
                }
            });
    });
});
