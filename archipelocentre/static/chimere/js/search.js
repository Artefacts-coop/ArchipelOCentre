function load_search_box(){
    if (!search_url) return;
    $.ajax({url: search_url}).done(function( data ) {
        $("#search-box").html(data);
    });
}

function haystack_search(evt, page){
    search_result = new Array();
    $('#categories').find('#ul_categories > li > input').attr("checked", false);
    if (!$('#id_q').val()) return false;

    var c_url = search_url + "?q=" + $('#id_q').val();
    if (page){
        c_url += '&page=' + page;
    }
    $.get(c_url).done(function( data ) {
        $('.ac-results').remove();
        $('#search-result').html(data).show('slow');
    });
    return false;
}

// disable enter 
$(window).keydown(function(event){
    if ($("#haystack-search").length && event.keyCode == 13) {
      event.preventDefault();
      $("#haystack-search").click();
      return false;
    }
});

