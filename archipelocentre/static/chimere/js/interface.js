$(function(){

    if (has_search){
        $('a[href=#categories]').click(function(){
            show_panel(display_categories);
        });
        $('a[href=#search-box]').click(function(){
            show_panel(display_search);
        });
        $('a[href=#search-box]').click();
    } else {
        $("#categories").fadeIn();
    }
    highlight_selected_categories();
    $('.subcategory label').click(highlight_selected_categories);
    $('#categories-lnk, #search-lnk').click(function(){
        if($('.navbar-toggle').css('display') !='none'){
            $(".navbar-toggle").click();
        }
    });
    $('#hide-panel').click(hide_panel);
    $('#show-panel').click(show_panel);
    $('#close-detail').click(function(){
        $('#detail').fadeOut();
    });
});

function display_categories(){
    $('a[href=#categories]').parent().parent().children().removeClass('active');
    $('a[href=#categories]').parent().addClass('active');
    $("#search-box").fadeOut(400,
            function(){ $("#categories").fadeIn(); });
}

function display_search(){
    $('a[href=#search-box]').parent().parent().children().removeClass('active');
    $('a[href=#search-box]').parent().addClass('active');
    $("#categories").fadeOut(400,
            function(){ $("#search-box").fadeIn(); $('#id_q').focus(); });
}

function show_panel(fct){
    if(!fct) fct = function(){};
    if($('#panel').css('display') == 'none'){
        $('#show-panel').fadeOut(200, function(){
            $('#hide-panel').fadeIn(500);
            $("#panel").fadeIn(500);
            $("#panel").fadeIn(500, fct);
        });
    } else {
        fct();
    }
}

function hide_panel(){
    if($('#panel').css('display') != 'none'){
        $('#hide-panel').fadeOut(500);
        $("#panel").fadeOut(500, function(){
            $('#show-panel').fadeIn();
        });
    }
}

function highlight_selected_categories(){
    $('.subcategory input').each(function(){
        var lbl = $(this).parent();
        if($(this).is(':checked')){
            lbl.addClass('selected');
        }else{
            lbl.removeClass('selected');
        }
    });
}
