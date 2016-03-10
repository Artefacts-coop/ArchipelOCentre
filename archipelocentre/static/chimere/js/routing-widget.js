var step_label = "Step";
var add_step = null;

$(document).ready(function() {
    var itinerary_step_number = 0;
    $("#add_step_link").click(function(){
        $('#main-map').chimere('add_step_fx');
        return false;
    });
    $('#search_routing').button({'disabled':true});
    $('#routing_button').click(function(){
        $('#chimere_itinerary_panel').dialog('open');
    });
    $('#chimere_itinerary_modify').click(function(){
        $('#chimere_itinerary').hide();
        $('#chimere_itinerary_form').show();
    });
    $('#chimere_itinerary_new').click(function(){
        $('#map').chimere('routingClear');
    });
    $('#search_routing').click(function(){
        $('#map').chimere('route');
    });

    var detached_speeds = Array();
    function filter_speed(transport){
        $("#id_speed_div").show();
        for (i=0;i<detached_speeds.length;i+=1){
            $("#id_speed_div ul").append(detached_speeds[i]);
        }
        detached_speeds = Array();
        $("#id_speed_div input[type=radio]").each(function(){
            if(!$(this).val().match(transport) && $(this).val()){
                detached_speeds.push($(this).parent().parent().detach());
            }
        });
        $('#id_speed_div').val('');
        if($("#id_speed_div input[type=radio]").length == 1){
            $("#id_speed_div").hide();
        }
    }
    $('#id_transport label').click(function(){
        checked_item = $("#"+$(this).attr('for'));
        filter_speed(checked_item.val());
    });
    filter_speed($('#id_transport :checked').val());
});
