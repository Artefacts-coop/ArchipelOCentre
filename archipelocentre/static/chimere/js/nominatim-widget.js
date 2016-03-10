var default_nominatim_lbl = '';
var nominatim_widget_options = {
    source: function (request, response) {
       $.ajax({
              url: nominatim_url,
              data: {
                  format: "json",
                  q: request.term,
              },
              dataType:'json',
              success: function ( data ) {
                  response ( $.map(data, function(item) {
                      return {
                          label: item.display_name,
                          value: item.display_name,
                          lat: item.lat,
                          lon: item.lon
                        }
                      }));

                  }
              })
    },
    minLength: 6,
    delay: 1000,
    select: function ( event, ui ) {
        $('#'+$(this).attr('id')+'_lat').val(ui.item.lat);
        $('#'+$(this).attr('id')+'_lon').val(ui.item.lon);
        $('#'+$(this).attr('id')+'_label').html(ui.item.label);
        $('#chimere_'+$(this).attr('id').substring(10)+'_label').html(
                                                        ui.item.label);
        $('#'+$(this).attr('id')).val(default_nominatim_lbl);
        jQuery("#map").chimere("routingInputChange", $(this).attr('id'));
        return false;
    },
    open: function() {
        $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
    },
    close: function() {
        $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
    }
}

$(function(){
    $(".nominatim-widget").autocomplete(nominatim_widget_options);
});
