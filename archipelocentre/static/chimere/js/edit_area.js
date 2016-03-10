/* Copyright (C) 2008-2012  Étienne Loks  <etienne.loks_AT_peacefrogsDOTnet>

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

/* area edit */

var bbox_style = {fill: true, fillColor: "#FFFFFF", fillOpacity: 0.5,
    stroke: true, strokeOpacity: 0.8, strokeColor: "#FF0000", strokeWidth: 2};

var area_map;
var box_layer;

function initForm(bounds){

}

/* update form fields on select action */
function updateForm(bounds){
    if(!bounds.toGeometry) return;
    var feature = new OpenLayers.Feature.Vector(
        bounds.toGeometry(), {}, bbox_style);
    box_layer.destroyFeatures()
    box_layer.addFeatures(feature);
    var bounds = bounds.clone().transform(epsg_projection,
                                  epsg_display_projection);
    document.getElementById('upper_left_lat').value = bounds.top;
    document.getElementById('upper_left_lon').value = bounds.left;
    document.getElementById('lower_right_lat').value = bounds.bottom;
    document.getElementById('lower_right_lon').value = bounds.right;
}

/* main initialisation function */
function init(map_edit){
    map_edit = typeof map_edit !== 'undefined' ? map_edit : 'map_edit';
    area_map = new OpenLayers.Map (map_edit, {
        controls:[new OpenLayers.Control.Navigation(),
                    new OpenLayers.Control.SimplePanZoom()],
        maxResolution: 156543.0399,
        units: 'm',
        projection: epsg_projection,
        displayProjection: epsg_display_projection
    } );
    box_layer = new OpenLayers.Layer.Vector("Box layer");
    area_map.addLayers([map_layer, box_layer]);
    var selectControl = new OpenLayers.Control();
    OpenLayers.Util.extend(selectControl, {
        draw: function() {
            this.box = new OpenLayers.Handler.Box(selectControl,
                {'done': this.notice},
                {keyMask: navigator.platform.match(/Mac/) ?
                     OpenLayers.Handler.MOD_ALT :OpenLayers.Handler.MOD_CTRL});
            this.box.activate();
        },

        notice: function(pxbounds) {
            ltpixel = area_map.getLonLatFromPixel(
                new OpenLayers.Pixel(pxbounds.left, pxbounds.top));
            rbpixel = area_map.getLonLatFromPixel(
                new OpenLayers.Pixel(pxbounds.right, pxbounds.bottom));
            if (ltpixel.equals(rbpixel))
                return;
            if (!ltpixel || !rbpixel) return;
            bounds = new OpenLayers.Bounds();
            bounds.extend(ltpixel);
            bounds.extend(rbpixel);
            updateForm(bounds);
        }
    });
    area_map.addControl(selectControl);

    area_map.events.register('zoomend', area_map, updateForm);
    area_map.events.register('moveend', area_map, updateForm);
    /* zoom to the appropriate extent */
    if (!zoomToCurrentExtent(area_map)){
        area_map.setCenter(centerLonLat, 12);
    }
}
