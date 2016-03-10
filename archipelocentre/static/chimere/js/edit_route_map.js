/* Copyright (C) 2008-2012 Étienne Loks  <etienne.loks_AT_peacefrogsDOTnet>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

See the file COPYING for details.
*/

function toggleDraw() {
    jQuery('#draw-toggle-off').hide();
    jQuery('#draw-or').hide();
    jQuery('#draw-label').hide();
    jQuery('#upload').hide();
    jQuery('#map_edit').show();
    jQuery('#help-route-create').show();
    jQuery('#map_edit').chimere(chimere_init_options);
}

function toggleDrawOn() {
    jQuery('#button-move-map').removeClass('toggle-button-active'
                             ).addClass('toggle-button-inactive');
    jQuery('#button-draw-map').removeClass('toggle-button-inactive'
                             ).addClass('toggle-button-active');
    jQuery("#map_edit").chimere("activateCurrentControl");
}

function toggleDrawOff() {
    jQuery('#button-draw-map').removeClass('toggle-button-active'
                             ).addClass('toggle-button-inactive');
    jQuery('#button-move-map').removeClass('toggle-button-inactive'
                             ).addClass('toggle-button-active');
    jQuery("#map_edit").chimere("deactivateCurrentControl");
}

function initFeatureFromWkt(wkt) {
    jQuery("#map_edit").chimere('initFeatureFromWkt', wkt);
}

function checkFields(){
    if (!jQuery("#id_name").val() ||
        !jQuery("#id_categories").val()){
        return false;
    }
    return true;
}

function uploadFile(error_msg) {
    if(!checkFields()){
        alert(error_msg);
        return;
    }
    open_window(extra_url + 'upload_file/');
}
