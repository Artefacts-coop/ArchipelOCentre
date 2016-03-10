/* base function shared by some pages */
/* Copyright (C) 2009-2014  Étienne Loks <etienne.loks_AT_peacefrogsDOTnet>

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

var default_area;
var area_name;

/* indexOf definition for old IE versions */
if(!Array.indexOf){
  Array.prototype.indexOf = function(obj){
   for(var i=0; i<this.length; i++){
    if(this[i]==obj){
     return i;
    }
   }
   return -1;
  }
}

/* show a block panel */
function show(id){
    document.getElementById(id).style.display = 'block';
}

/* hide a panel */
function hide(id){
    document.getElementById(id).style.display = 'None';
}

/* show or hide a panel */
function showHide(id){
    var item = document.getElementById(id);
    if (item.style.display == 'block'){
        hide(id);
    } else {
        show(id);
    }
}

/* open a popup window */
function open_window(url){
    var newwindow = window.open(url, '_blank',
            'height=170,width=400,scrollbars=yes');
    if (window.focus) {newwindow.focus()}
    return false;
}

function saveExtent() {
    /* save the current extent in a cookie */
    if(!map) return;
    var extent_key = 'MAP_EXTENT';
    if (area_name){ extent_key = extent_key + '_' + area_name; }
    var extent = map.getExtent().transform(map.getProjectionObject(),
                                           epsg_display_projection);
    document.cookie = extent_key + "=" + extent.toArray().join('_')
                      + ';path=/';
}

function getExtent() {
    /* get the current extent from a cookie */
    var cookies = document.cookie.split(';');
    var map_extent;
    var extent_key = 'MAP_EXTENT';
    if (area_name){ extent_key = extent_key + '_' + area_name; }
    for (var i=0; i < cookies.length; i++){
        var items = cookies[i].split('=');
        key = items[0].split(' ').join('');
        if (key == extent_key){
            map_extent = items[1].split('_');
        }
    }
    return map_extent;
}

function zoomToCurrentExtent(map){
    /* zoom to current extent */
    var current_extent = getExtent();
    var extent;
    if (OpenLayers && current_extent && current_extent.length == 4){
        extent = new OpenLayers.Bounds(current_extent[0], current_extent[1],
                                       current_extent[2], current_extent[3]);
    }
    else if (OpenLayers && default_area && default_area.length == 4){
        extent = new OpenLayers.Bounds(default_area[0], default_area[1],
                                       default_area[2], default_area[3]);
    }
    else{
        return;
    }
    extent.transform(epsg_display_projection, epsg_projection);
    map.zoomToExtent(extent, true);
    return true;
}

/* interface */
function share_link_update(){
    $('.share_link').click(function(){
        if (this.share_initialized){
            return false;
        }
        this.share_initialized = true;
        var href = $(this).attr('href');
        var url = get_share_url;
        var classes = $(this).attr('class').split(' ');
        prefix = 'share_id_';
        var share_id;
        for (idx=0;idx<classes.length;idx++){
            if(classes[idx].substring(0, prefix.length) == prefix){
                var share_id = classes[idx].substring(prefix.length);
                share_id = share_id.split('_')[0];
            }
        }
        var params = $('#permalink a').attr('href').split('/');
        url += share_id + params[params.length-1];
        $.ajax({url: url,
            dataType: "html",
            success: function (url) {
                window.location.href = url;
                return true;
            },
            error: function(){
                return false;
            }
           });
        return false;
    });
}

$("a").on("click", function(event){
    if ($(this).is("[disabled]")) {
        event.preventDefault();
    }
});
