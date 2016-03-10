django.jQuery(function($) {
    var importer_form_filter = {
        OSM:new Array('field-filtr', 'field-default_name', 'field-categories',
                      'field-source', 'field-overwrite',
                      'field-automatic_update', 'field-default_status'),
        KML:new Array('field-source', 'field-source_file', 'field-default_name',
                      'field-filtr', 'field-zipped', 'field-origin',
                      'field-license', 'field-categories', 'field-overwrite',
                      'field-get_description', 'field-automatic_update',
                      'field-default_status'),
        SHP:new Array('field-source', 'field-source_file', 'field-default_name',
                      'field-zipped', 'field-origin', 'field-srid',
                      'field-license', 'field-categories', 'field-overwrite',
                      'field-automatic_update', 'field-default_status'),
        RSS:new Array('field-source', 'field-default_name', 'field-origin',
                      'field-srid', 'field-license', 'field-categories',
                      'field-overwrite', 'field-get_description',
                      'field-automatic_update', 'field-default_status'),
        CSV:new Array('field-source', 'field-source_file', 'field-default_name',
                      'field-origin', 'field-srid', 'field-license',
                      'field-categories', 'field-overwrite',
                      'field-get_description', 'field-automatic_update',
                      'field-default_status'),
        XSLT:new Array('field-source', 'field-source_file',
                      'field-source_file_alt', 'field-default_name',
                      'field-origin', 'field-srid', 'field-license',
                      'field-categories', 'field-overwrite',
                      'field-get_description', 'field-default_localisation',
                      'field-automatic_update', 'field-default_status'),
        XXLT:new Array('field-source', 'field-source_file',
                      'field-source_file_alt', 'field-default_name',
                      'field-origin', 'field-srid', 'field-license',
                      'field-categories', 'field-overwrite',
                      'field-get_description', 'field-default_localisation',
                      'field-automatic_update', 'field-default_status')
    }
    var osm_map_initialized;
    var edit_map_initialized;
    function refresh_importer_form(){
        $('.form-row').not('.field-importer_type').hide();
        $('#importerkeycategories_set-group').hide();
        $('#key_categories-group').hide();
        var importer_val = $('.field-importer_type select').val();
        if (!importer_val) return;
        var form_filters = importer_form_filter[importer_val];
        for (k=0; k<form_filters.length;k++){
            $('.form-row.'+form_filters[k]).show();
        }
        if (importer_val == 'KML'){
            $('.help-kml').show();
        } else {
            $('.help-kml').hide();
        }
        if (importer_val == 'OSM'){
            $('.form-row.field-filtr').addClass('field-map');
            $('#map_edit_area').show();
            if(!$('#id_source').val()){
                $('#id_source').val(default_xapi);
            }
            $('#id_filtr').attr('readonly', true);
            $('.help-osm').show();
            $('.input-osm').show();
            if (!osm_map_initialized){
                init_map_form();
                osm_map_initialized = true;
            }
        }
        else if (importer_val == 'XSLT' || importer_val == 'XXLT'){
            $('#importerkeycategories_set-group').show();
            $('#key_categories-group').show();
            $('#importerkeycategories_set-group .form-row').show();
            $('#key_categories-group .form-row').show();
            $('.form-row.field-filtr').addClass('field-map');
            $('#map_edit').show();
            if (!edit_map_initialized){
                init_map_edit();
                edit_map_initialized = true;
            }
        } else {
            $('.form-row.field-filtr').removeClass('field-map');
            $('#id_filtr').attr('readonly', false);
            $('#map_edit_area').hide();
            $('#map_edit').hide();
            $('.help-osm').hide();
            $('.input-osm').hide();
            if($('#id_source').val() == default_xapi) $('#id_source').val('');
        }
        refresh_default_desc();
    }
    function refresh_default_desc(){
        if (!$('.form-row.field-get_description').is(':visible')){
            $('.form-row.field-default_description').show();
            $('.form-row.field-get_description input').attr('checked', false);
        } else {
            if (!$('.form-row.field-get_description input').is(':checked')){
                $('.form-row.field-default_description').show();
            } else {
                $('.form-row.field-default_description').hide();
                $('.form-row.field-default_description textarea').val("");
            }
        }
    }
    refresh_importer_form();
    $('.field-importer_type select').change(refresh_importer_form);
    $('.field-get_description input').change(refresh_default_desc);
    function refresh_filtr_form(){
        if (!$('#upper_left_lat').val() ||
           !parseFloat($('#upper_left_lat').val())){
            alert(msg_missing_area);
            return false;
        }
        if (!$('input[name=id_filtr_type]:checked').val()){
            alert(msg_missing_type);
            return false;
        }
        if (!$('#id_filtr_tag').val()){
            alert(msg_missing_filtr);
            return false;
        }
        value = $('input[name=id_filtr_type]:checked').val();
        value += '[' + $("#id_filtr_tag").val() + ']';
        value += '[bbox=';
        value += Number($('#upper_left_lon').val()).toFixed(6) + ',';
        value += Number($('#lower_right_lat').val()).toFixed(6) + ',';
        value += Number($('#lower_right_lon').val()).toFixed(6) + ',';
        value += Number($('#upper_left_lat').val()).toFixed(6);
        value += ']';
        $('#id_filtr').val(value);
        return false;
    }
    $('#id_refresh_filtr').click(refresh_filtr_form);
});
