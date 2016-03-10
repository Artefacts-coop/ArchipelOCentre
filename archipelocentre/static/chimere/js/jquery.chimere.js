/* Copyright (C) 2008-2015  Étienne Loks  <etienne.loks_AT_peacefrogsDOTnet>

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

/* Add OpenLayers MapQuest layer management */
OpenLayers.Layer.MapQuestOSM = OpenLayers.Class(OpenLayers.Layer.XYZ, {
    name: "MapQuestOSM",
    sphericalMercator: true,
    url: ' http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png',
    clone: function(obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.OSM(
            this.name, this.url, this.getOptions());
        }
        obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
        return obj;
    },
    CLASS_NAME: "OpenLayers.Layer.MapQuestOSM"
});

/*
* Little hasattr helper
*/
(function ($) {
    $.hasattr = function (key, arr) {
        var v = arr[key];
        if (typeof v === "undefined")
            return false;
        else
            return v; };
})( jQuery );
(function ($) {
    /*
    * Chimere jQuery plugin
    */
        /*
        * Default settings
        */
        var defaults = {
            restricted_extent: false,
            permalink_label: null,
            permalink_div: null,
            permalink: null, // OL Control, could be overrided
            map_layers: null,
            selected_map_layer: null,
            dynamic_categories: false,
            display_submited: false,
            display_feature: null,
            display_route: null,
            area_id: null,
            checked_categories: [],
            zoom: null,
            lat: null,
            lon: null,
            simple: false,
            routing_start_lat: null,
            routing_start_lon: null,
            routing_end_lat: null,
            routing_end_lon: null,
            routing_steps_lonlat: null,
            routing_transport: null,
            routing_speed: null,
            // Provide this function to make a custom click event on the marker
            on_marker_click: null,
            // Provide this function to override the feature detail display
            display_feature_detail_fx: null,
            // Provide this function for overriding the getSubcategories default
            get_subcategories_fx: null,
            hide_popup_fx: null,
            open_dialog_fx: null,
            // if leave to false every click on the map hide the pop-up
            explicit_popup_hide: false,
            controls:null,
            popupClass: OpenLayers.Popup.FramedCloud,
            popupContentFull: false, // if true the detail is inside the popup
            category_accordion: true, // category opening behave like an accordion
            maxResolution: 156543.0399,
            units: 'm',
            projection: new OpenLayers.Projection('EPSG:4326'),
            theme: null,
            enable_clustering: false,
            routing: false, // enable routing management
            routing_panel_open: function(){
                                    $('#chimere_itinerary_panel').dialog('open');
                                },
            current_feature: null, // To store the active POI
            current_control: null, // To store the current control
            current_popup: null, // To store the current POI popup displayed
            current_category: null, // To store the current category clicked in list
            current_routes_features: [], // To store the current routes find by routing
            itinerary_step_number:0, // current step number
            icon_offset: new OpenLayers.Pixel(0, 0),
            edition: false, // edition mode
            edition_type_is_route: false, // route or POI edition
            default_icon: new OpenLayers.Icon(
                    'http://www.openlayers.org/dev/img/marker-green.png',
                    new OpenLayers.Size(21, 25),
                    new OpenLayers.Pixel(-(21/2), -25)),
            cluster_icon: null,
            marker_hover_id:'marker_hover',
            marker_hover_content_id:'marker_hover_content',
            marker_hover_offset: null,
            icon_start: null,
            icon_step: null,
            icon_end: null,
            mobile:false,
            input_id:'id_point'
        };
        var settings = {};
    /*
    * Publics methods
    */
    var methods = {
        /*
        * Plugin init function
        */
        init: function ( options ) {
            /* Manage parameters */
            // not staticaly in default because of STATIC_URL init
            if (defaults.cluster_icon == null && typeof STATIC_URL != 'undefined'){
                defaults.cluster_icon = new OpenLayers.Icon(
                    STATIC_URL+'chimere/img/marker-cluster.png',
                    new OpenLayers.Size(36, 39),
                    new OpenLayers.Pixel(-(36/2), -(39/2)));
            }
            if (defaults.icon_start == null && typeof STATIC_URL != 'undefined'){
                defaults.icon_start = new OpenLayers.Icon(
                    STATIC_URL + "chimere/img/flag-start.png",
                    new OpenLayers.Size(32, 32),
                    new OpenLayers.Pixel(0, -32));
            }
            if (defaults.icon_step == null && typeof STATIC_URL != 'undefined'){
                defaults.icon_step = new OpenLayers.Icon(
                    STATIC_URL + "chimere/img/flag-step.png",
                    new OpenLayers.Size(32, 32),
                    new OpenLayers.Pixel(0, -32));
            }
            if (defaults.icon_end == null && typeof STATIC_URL != 'undefined'){
                defaults.icon_end = new OpenLayers.Icon(
                    STATIC_URL + "chimere/img/flag-finish.png",
                    new OpenLayers.Size(32, 32),
                    new OpenLayers.Pixel(0, -32));
            }
            settings = $.extend({}, defaults);
            if ( options ) $.extend(settings, options);
            if (settings.controls == null){
                if (settings.mobile){
                    settings.controls = [new OpenLayers.Control.TouchNavigation({
                        dragPanOptions: {
                            enableKinetic: true
                        }
                    }),
                    new OpenLayers.Control.Zoom()];
                } else {
                    settings.controls = [new OpenLayers.Control.Navigation(),
                      new OpenLayers.Control.SimplePanZoom(),
                      new OpenLayers.Control.ScaleLine()];
                }
            }
            var map_element = $(this).get(0);
            var map_options = {
                controls: settings.controls,
                maxResolution: settings.maxResolution,
                units: settings.units,
                projection: settings.projection,
                theme: settings.theme
            };
            if (settings.restricted_extent){
                settings.restricted_extent.transform(EPSG_DISPLAY_PROJECTION,
                                                     EPSG_PROJECTION);
                map_options['restrictedExtent'] = settings.restricted_extent;
            }

            settings.current_position = null;

            /* Create map object */
            settings.map = map = new OpenLayers.Map(map_element, map_options);

            map.addControl(new OpenLayers.Control.Attribution());

            /* Manage permalink */
            if (!settings.edition){
                if (settings.permalink == null && !settings.edition) {
                    var permalink_options = {};
                    if (settings.permalink_element){
                        // hard to understand from OL documentation...
                        permalink_options["div"] = settings.permalink_element;
                    }
                    settings.permalink = new OpenLayers.Control.Permalink(
                                                         permalink_options);
                }
                /* HACK new permalink createParams method
                   FIXME when facilities are given to personalize the permalink */
                var oldCreateParams = settings.permalink.createParams
                var  _createParams = function(center, zoom, layers) {
                    // Call normal method
                    var params = oldCreateParams(center, zoom, layers);
                    // Make specific params
                    params.checked_categories = settings.checked_categories;
                    params.display_submited = settings.display_submited;
                    if (settings.current_feature)
                        params.current_feature = settings.current_feature.pk;
                    if (settings.routing_speed)
                        params.routing_speed = settings.routing_speed;
                    if (settings.routing_transport)
                        params.routing_transport = settings.routing_transport;
                    if (settings.routing_start){
                        lonlat = settings.routing_start.lonlat.clone().transform(
                              EPSG_PROJECTION, EPSG_DISPLAY_PROJECTION);
                        params.routing_start_lon = lonlat.lon;
                        params.routing_start_lat = lonlat.lat;
                    }
                    if (settings.routing_end){
                        lonlat = settings.routing_end.lonlat.clone().transform(
                              EPSG_PROJECTION, EPSG_DISPLAY_PROJECTION);
                        params.routing_end_lon = lonlat.lon;
                        params.routing_end_lat = lonlat.lat;
                    }
                    if (settings.routing_steps){
                        var steps = [];
                        for (var i = 0; i < settings.routing_steps.length; i++){
                            lonlat = settings.routing_steps[i].lonlat.clone(
                                        ).transform(EPSG_PROJECTION,
                                                    EPSG_DISPLAY_PROJECTION);
                            steps.push([lonlat.lon, lonlat.lat]);
                        }
                        params.routing_steps = steps;
                    }
                    return params;
                }
                // Force new createParams method
                settings.permalink.createParams = _createParams;
                settings.map.addControl(settings.permalink);
                // update with the translated permalink label
                if(settings.permalink_label && settings.permalink.div
                   && settings.permalink.div.childNodes.length > 0){
                    settings.permalink.div.childNodes[0].textContent = settings.permalink_label;
                }
            }
            /* Add Layers */
            settings.map.addLayers(settings.map_layers);
            if (settings.map_layers.length > 1){
                settings.map.addControl(new OpenLayers.Control.LayerSwitcher(
                                        {roundedCorner:false}));
            }
            /* select the default map layer */
            if (!settings.selected_map_layer){
                settings.selected_map_layer = 0;
            }
            settings.map.setBaseLayer(
                            settings.map_layers[settings.selected_map_layer]);

            /* manage the context menu  */
            $('#map_menu_zoomin').bind("click", methods.zoomIn);
            $('#map_menu_zoomout').bind("click", methods.zoomOut);
            $('#map_menu_center').bind("click", methods.mapCenter);
            /* manage the routing */
            if (settings.routing){
                settings.routing_start = null;
                settings.routing_steps = new Array();
                settings.routing_end = null;
                $('#map_menu_from').bind("click", methods.routingFrom);
                $('#map_menu_step').bind("click", methods.routingAddStep);
                $('#map_menu_to').bind("click", methods.routingTo);
                $('#map_menu_clear').bind("click", methods.routingClear);
                settings.layerRoute = new OpenLayers.Layer.Vector("Route Layer");
                settings.map.addLayer(settings.layerRoute);
                settings.layerRouteMarker = new OpenLayers.Layer.Markers(
                                                               'Route markers');
                settings.map.addLayer(settings.layerRouteMarker);
            }
            /* Vectors layer */
            settings.layerVectors = new OpenLayers.Layer.Vector("Vector Layer");
            settings.map.addLayer(settings.layerVectors);
            settings.layerVectors.setOpacity(0.8);
            if (settings.edition_type_is_route){
                settings.map.addControl(new OpenLayers.Control.DrawFeature(
                               settings.layerVectors, OpenLayers.Handler.Path));
                settings.map.addControl(new OpenLayers.Control.ModifyFeature(
                        settings.layerVectors, {clickout:false, toggle:false}));
            }

            if (settings.enable_clustering){
                var style = new OpenLayers.Style({
                       graphicTitle: "${name}",
                       externalGraphic: "${icon}",
                       graphicWidth: "${width}",
                       graphicHeight: "${height}",
                       graphicXOffset: "${offsetx}",
                       graphicYOffset: "${offsety}",
                       graphicOpacity: 1,
                       label: "${label}",
                       labelYOffset: "2",
                       fontSize:'1.3em'
                   }, {
                   context: {
                     name: function(feature) {
                        if(feature.cluster) {
                            feature.attributes.width = settings.cluster_icon.size.w;
                            feature.attributes.height = settings.cluster_icon.size.h;
                            feature.attributes.offsetx = settings.cluster_icon.offset.x;
                            feature.attributes.offsety = settings.cluster_icon.offset.y;
                        } else{
                            var marker = feature.attributes.marker
                            feature.attributes.width = marker.icon.size.w;
                            feature.attributes.height = marker.icon.size.h;
                            feature.attributes.offsetx = settings.icon_offset.x;
                            feature.attributes.offsety = settings.icon_offset.y;
                        }
                        return feature.attributes.name;
                     },
                     label: function(feature) {
                        // clustered features count or blank if feature is not a cluster
                        return feature.cluster ? feature.cluster.length : "";
                     },
                     icon: function(feature) {
                        if (feature.cluster){
                            return settings.cluster_icon.url;
                        } else {
                            return STATIC_URL + 'chimere/img/empty.png';
                        }
                     },
                     width: function(feature) { return feature.attributes.width; },
                     height: function(feature) { return feature.attributes.height; },
                     offsetx: function(feature) { return feature.attributes.offsetx; },
                     offsety: function(feature) { return feature.attributes.offsety; }
                     }});


                /* Cluster layer */
                settings.clustering = new OpenLayers.Strategy.Cluster({
                                                                distance: 100,
                                                                threshold: 2});
                settings.layerCluster = new OpenLayers.Layer.Vector("Cluster layer",
                    {styleMap: new OpenLayers.StyleMap({'default': style}),
                     strategies: [settings.clustering]});
                settings.map.addLayer(settings.layerCluster);

                var highlightCtrl = new OpenLayers.Control.SelectFeature(
                                                settings.layerCluster, {
                    hover: true,
                    highlightOnly: true,
                    eventListeners: {
                        featurehighlighted:  function(e) {
                        if(e.feature.attributes.marker)
                        e.feature.attributes.marker.events.triggerEvent('mouseover');
                        },
                        featureunhighlighted:  function(e) {
                        if(e.feature.attributes.marker)
                        e.feature.attributes.marker.events.triggerEvent('mouseout');
                        }
                    }
                });

                var selectCtrl = new OpenLayers.Control.SelectFeature(
                                    settings.layerCluster,{
                                        onSelect: methods.zoomOnCluster
                                    });

                settings.map.addControl(highlightCtrl);
                settings.map.addControl(selectCtrl);

                highlightCtrl.activate();
                selectCtrl.activate();
            }

            /* Markers layer */
            settings.layerMarkers = new OpenLayers.Layer.Markers('POIs');
            settings.map.addLayer(settings.layerMarkers);

            if (settings.dynamic_categories){
                settings.map.events.register('moveend', settings.map,
                                             methods.loadCategories);
            }
            /* TODO make a function */
            if (settings.display_submited) {
                document.getElementById('display_submited_check').checked = true;
            }
            /* if we have some zoom and lon/lat from the init options */
            if (settings.zoom && settings.lon && settings.lat) {
                var centerLonLat = new OpenLayers.LonLat(settings.lon,
                                                         settings.lat);
                settings.map.setCenter(centerLonLat, settings.zoom);
            }
            /* if not zoom to the extent in cookies */
            else if (!methods.zoomToCurrentExtent(settings.map)){
                /* if no extent in cookies zoom to default */
                if(CENTER_LONLAT && DEFAULT_ZOOM){
                    settings.map.setCenter(CENTER_LONLAT, DEFAULT_ZOOM);
                }
            }

            if (!settings.edition){
                if (settings.enable_clustering){
                    settings.map.events.register('zoomend', null,
                                              methods.cleanCluster);
                }
                methods.loadCategories();
                methods.loadGeoObjects();
                methods.activateContextMenu()
            } else {
                if (!settings.edition_type_is_route){
                    methods.activateMarkerEdit();
                } else {
                    methods.activateRouteEdit();
                }
            }
            if (settings.routing_start_lon && settings.routing_start_lat){
                settings.current_position = new OpenLayers.LonLat(
                        settings.routing_start_lon, settings.routing_start_lat
                        ).transform(EPSG_DISPLAY_PROJECTION, EPSG_PROJECTION);
                methods.routingFrom();
            }
            if (settings.routing_end_lon && settings.routing_end_lat){
                settings.current_position = new OpenLayers.LonLat(
                        settings.routing_end_lon, settings.routing_end_lat
                        ).transform(EPSG_DISPLAY_PROJECTION, EPSG_PROJECTION);
                methods.routingTo();
            }
            if (settings.routing_steps_lonlat){
                for (var i = 0; i < settings.routing_steps_lonlat.length/2; i++) {
                    lon = settings.routing_steps_lonlat[i*2];
                    lat = settings.routing_steps_lonlat[i*2+1];
                    settings.current_position = new OpenLayers.LonLat(lon, lat
                        ).transform(EPSG_DISPLAY_PROJECTION, EPSG_PROJECTION);
                    methods.routingAddStep();
                }
            }

            // verify that the initial display_feature is displayed
            if (settings.display_feature){
                var is_displayed = false;
                for(j=0; j<settings.layerMarkers.markers.length;j++){
                    var c_marker = settings.layerMarkers.markers[j];
                    if(c_marker.pk == settings.display_feature){
                        is_displayed = true;
                    }
                }
                if (!is_displayed){
                    methods.loadMarker(settings.display_feature);
                }
            }
            methods.update_permalink_activation();

            methods.preload_images();
        }, // end of init
        update_permalink_activation:function(){
            if (settings.checked_categories.length ||
                settings.current_feature ||
                settings.routing_speed ||
                settings.routing_transport ||
                settings.routing_start ||
                settings.routing_end){
                $("#permalink a").removeAttr("disabled");
            } else {
                $("#permalink a").attr("disabled", "disabled");
            }
        },
        /* Preload icons */
        preload_images: function(){
            if (typeof extra_url == 'undefined') return;
            var uri = extra_url + "getAllCategories/";
            $.ajax({url: uri,
                    dataType: "json",
                    success: function (data) {
                        if (!data.categories){return}
                        for(var idx=0; idx<data.categories.length; idx++){
                            new Image().src = data.categories[idx].icon.url;
                            if(data.categories[idx].icon_hover){
                                new Image().src =
                                        data.categories[idx].icon_hover.url;
                            }
                        }
                    },
                    error: function (data) {
                        // fail silently
                    }
                });
        },

        activateContextMenu: function(){
            settings.edition_type_is_route = false;
            settings.map.events.unregister('click', settings.map,
                                         methods.setMarker);
            settings.map.events.register('click', settings.map,
                                         methods.displayMapMenu);
        },

        activateRouteEdit: function(){
            settings.edition_type_is_route = true;
            methods.cleanMarker();
            settings.map.events.unregister('click', settings.map,
                                           methods.setMarker);
            if (settings.routing){
                settings.map.events.register('click', settings.map,
                                             methods.displayMapMenu);
            } else {
                settings.layerVectors.events.register('featuremodified',
                    settings.layerVectors, helpers.updateRouteForm);
                settings.layerVectors.events.register('featureadded',
                    settings.layerVectors, helpers.featureRouteCreated);
            }
        },

        activateMarkerEdit: function(){
            settings.edition_type_is_route = false;
            if ($('#chimere_map_menu').length){
                $('#chimere_map_menu').hide();
            }
            if (settings.current_popup != null) {
                settings.current_popup.hide();
            }
            settings.map.events.unregister('click', settings.map,
                                         methods.displayMapMenu);
            settings.map.events.register('click', settings.map,
                                         methods.setMarker);
        },
        // change map_layer
        changeMapLayer: function(map_idx){
            settings.map.setBaseLayer(settings.map_layers[map_idx]);
        },

        // init the context menu
        zoomIn: function(){
            methods.mapCenter();
            settings.map.zoomIn();
        },

        // zoom out from the map menu
        zoomOut: function(){
            methods.mapCenter();
            settings.map.zoomOut();
        },

        // center from the map menu
        mapCenter: function(){
            $('#chimere_map_menu').hide();
            settings.map.setCenter(settings.current_position);
        },

        // set current position
        setCurrentPosition: function(lonlat){
            settings.current_position = lonlat;
        },
        zoomOnCluster: function(feature){
            if(!feature.cluster) // if not cluster
            {
                feature.attributes.marker.events.triggerEvent('click');
                feature.attributes.marker.events.triggerEvent('touchstart');
                feature.attributes.marker.events.triggerEvent('mouseover');
                feature.attributes.marker.events.triggerEvent('mouseout');
            } else {
                var content = "<div class='dialog-content'><ul>";
                for (var idx=0;idx<feature.cluster.length; idx++){
                    var feat = feature.cluster[idx];
                    console.log(feat);
                    content += "<li><img src="+feat.attributes.icon+">" +
                        "<span class='cluster_list' id='cluster_list_"+idx+"'>" +
                            "<div class='cluster_category'>"+feat.attributes.marker.category_name+"</div>"+
                            "<div class='cluster_category_detail'>"+feat.attributes.name+"</div></span></li>";
                }
                content += "</ul></div>";
                $('#cluster_list').html(content);
                $('#cluster_list').dialog('open');
                $("#cluster_list").on("dialogclose", methods.cleanCluster);
                settings.map.setCenter(
                            feature.geometry.getBounds().getCenterLonLat());
                // register after the display
                settings.clustered_feature = feature.cluster;
                jQuery(".cluster_list").click(
                    function(e){
                        $('#cluster_list').dialog('close');
                        var splitted = $(this).attr('id').split('_');
                        var index = splitted[splitted.length-1];
                        m = settings.clustered_feature[parseInt(index)].attributes.marker;
                        m.events.triggerEvent('click');
                        e.stopPropagation();
                });
            }
        },

        /*
        * Display menu on the map
        */
        displayMapMenu: function(e) {
            if (methods.hidePopup(e)) return;
            if ($('#chimere_map_menu').is(":visible")){
                $('#chimere_map_menu').hide();
            } else{
                methods.setCurrentPosition(
                                settings.map.getLonLatFromViewPortPx(e.xy));
                var offsetX = e.pageX;
                var offsetY = e.pageY;
                $('#chimere_map_menu').show('fast');
                $('#chimere_map_menu').css('display', 'block');
                $('#chimere_map_menu').css('top', offsetY);
                $('#chimere_map_menu').css('left', offsetX);
            }
        },
        loadMarker: function(object_id) {
            var uri = extra_url + "get-marker/" + object_id;
            $.ajax({url: uri,
                    dataType: "json",
                    success: function (data) {
                        for (idx in data) methods.addMarker(data[idx]);
                    }
            });
        },
        /*
        * Load markers and route from DB
        */
        loadGeoObjects: function () {
            if($('#waiting').length){$('#waiting').show();}
            helpers.retrieve_checked_categories();
            var ids = settings.checked_categories.join('_');
            if (!ids) ids = '0';
            var uri = extra_url + "getGeoObjects/" + ids;
            if (settings.display_submited) uri += "/A_S";
            $.ajax({url: uri,
                    dataType: "json",
                    success: function (data) {
                        settings.layerMarkers.clearMarkers();
                        settings.layerVectors.removeAllFeatures();
                        if (settings.enable_clustering){
                            settings.cluster_array = [];
                            settings.layerCluster.removeAllFeatures();
                        }
                        for (var i = 0; i < data.features.length; i++) {
                            var feature = data.features[i];
                            if (feature.geometry.type == 'Point'){
                                methods.addMarker(feature);
                            } else if (feature.geometry.type == 'LineString') {
                                methods.addRoute(feature);
                            } else if (feature.geometry.type == 'MultiLineString') {
                                methods.addMultiLine(feature);
                            }
                        }
                        if (settings.enable_clustering){
                            settings.layerCluster.addFeatures(
                                                        settings.cluster_array);
                            methods.cleanCluster();
                        }
                        settings.map.resetLayersZIndex();
                    },
                    error: function (data, textStatus, errorThrown) {
                        settings.layerMarkers.clearMarkers();
                        settings.layerVectors.removeAllFeatures();
                        if (settings.enable_clustering){
                            settings.layerCluster.removeAllFeatures();
                        }
                    },
                    complete: function () {
                        if($('#waiting').length){$('#waiting').hide();}
                        methods.update_permalink_activation();
                    }
                });
        },
        razMap: function() {
            methods.hidePopup();
            methods.uncheckCategories();
            settings.layerMarkers.clearMarkers();
            settings.layerVectors.removeAllFeatures();
            if (settings.enable_clustering){
                settings.layerCluster.removeAllFeatures();
                settings.cluster_array = [];
                settings.layerCluster.addFeatures(settings.cluster_array);
                methods.cleanCluster();
            }
        },
        /*
        * Update the categories div in ajax
        */
        loadCategories: function () {
            var current_extent = settings.map.getExtent().transform(
                                            settings.map.getProjectionObject(),
                                            EPSG_DISPLAY_PROJECTION);
            current_extent = current_extent.toArray().join('_')
            current_extent = current_extent.replace(/\./g, 'D');
            current_extent = current_extent.replace(/-/g, 'M');
            var uri = extra_url
            if (settings.area_id) uri += settings.area_id + "/";
            uri += "getAvailableCategories/";
            var params = {"current_extent": current_extent}
            if (settings.display_submited) params["status"] = "A_S";
            $.ajax({url: uri,
                    data: params,
                    cache: false,
                    success: function (data) {
                            $('#categories').empty();
                            $('#categories').html(data);
                            _init_categories();
                            _reCheckCategories();
                            if (settings.current_category) {
                                // TODO : add a force mode
                                // (in case the category is yet visible in HTML...)
                                methods.toggle_category();
                            }
                        }
                   });
            var _toggle_subcategories = function (category_element) {
                // Check subcategories only if unchecked
                var val = category_element.is(":checked") ? true : false;
                category_element.parent().find("li input").attr("checked", val);
            }
            var _toggle_categories = function (subcategory_element) {
                var parent = subcategory_element.closest('ul');
                var parent_label = parent.parent().find("> span");
                if (parent.find('input[type=checkbox]:checked').length){
                    parent_label.addClass('category-selected');
                } else {
                    parent_label.removeClass('category-selected');
                }
                var master_check = parent.find("> input");
                if (parent.find('.subcategories input[type=checkbox]').length ==
                    parent.find('.subcategories input[type=checkbox]:checked').length){
                    master_check.attr('checked', 'checked');
                } else {
                    master_check.removeAttr('checked');
                }

                if($('#action-categories').length){
                    if ($('#categories input[type=checkbox]:checked').length){
                        $('#action-categories').addClass('category-selected');
                    } else {
                        $('#action-categories').removeClass('category-selected');
                    }
                }
                return master_check;
            };
            var _init_categories = function () {
                /*
                * Add event listener in categories DOM elements
                */
                $('#categories #ul_categories > li > input').bind("click",
                function (e) {
                    methods.hidePopup(e);
                    _toggle_subcategories($(this));
                    methods.loadGeoObjects();
                    settings.permalink.updateLink();
                });
                $('.subcategories li input').bind("click", function (e) {
                    $('#search-result').html('');
                    var c_name = $(this).attr('name');
                    c_name = c_name.substr(c_name.lastIndexOf("_")+1);
                    if($(this).is(':checked')){
                        methods.subcategory_detail(c_name);
                    }
                    var par = $(this).parent();
                    if ($(this).attr('checked')){
                        par.addClass('selected');
                    } else {
                        par.removeClass('selected');
                    }
                    methods.loadGeoObjects();
                    _toggle_categories($(this));
                    settings.permalink.updateLink();
                    if ($('#layer_cat_'+c_name).length){
                        $('#layer_cat_'+c_name).prop("checked",
                                                     this.checked);
                    }
                    methods.hidePopup(e);
                });
                $('#display_submited_check').bind("click", function () {
                    methods.loadGeoObjects();
                    settings.permalink.updateLink();
                });
                // Zoom to category
                $(".zoom_to_category").bind("click", function (e) {
                    var id = this.id.substr(this.id.lastIndexOf("_")+1);
                    helpers.zoom_to_category(id);
                });
                $(".zoom_to_subcategory").bind("click", function (e) {
                    var id = this.id.substr(this.id.lastIndexOf("_")+1);
                    helpers.zoom_to_subcategories([id]);
                });
                $(".toggle_category").parent().bind("click", function (e) {
                    var item = $(this).children('.toggle_category');
                    var id = item.attr('id').substr(item.attr('id').lastIndexOf("_")+1);
                    methods.toggle_category(id);
                });
            }
            var _reCheckCategories = function (){
                /* recheck categories on init or when a redraw occurs */
                if (!settings.checked_categories){
                    return;
                }
                $('#frm_categories .subcategories input:checkbox').each(function(index){
                    cat_id = $(this).attr('id').split('_').pop();
                    if (settings.checked_categories.indexOf(parseInt(cat_id)) != -1) {
                        $(this).attr("checked", "checked");
                        _toggle_categories($(this));
                        methods.toggle_category();
                    } else {
                        $(this).attr("checked", false);
                    }
                });
                if (settings.display_submited == true){
                    $('#display_submited_check').attr("checked", "checked");
                }
            }
        },
        /*
         *
         */
        uncheckCategories: function (){
            $('#frm_categories .subcategories input:checkbox').each(function(index){
                $(this).attr("checked", false);
                $(this).removeAttr("checked", false);
            });
            $('#frm_categories .selected').each(function(index){
                $(this).removeClass("selected");
            });
        },
        /*
         * Hide clusterized markers
         */
        cleanCluster: function (){
            if (settings.map.getZoom() === 18) {
                // Don't cluster at this level. No matter what.
                settings.clustering.threshold = 1000;
            } else {
                settings.clustering.threshold = 2;
            }
            //settings.layerCluster.refresh({force:true});
            settings.clustering.recluster();
            var hidden_feature_idx = [];
            if (settings.map.getZoom() != 18) {
                for(var idx=0; idx<settings.layerCluster.features.length; idx++){
                    if(settings.layerCluster.features[idx].cluster){
                        for(var c=0;c < settings.layerCluster.features[idx].cluster.length; c++) {
                            hidden_feature_idx.push(
                  settings.layerCluster.features[idx].cluster[c].attributes.pk);
                        }
                    }
                }
            }
            for(j=0; j<settings.layerMarkers.markers.length;j++){
                if(hidden_feature_idx.indexOf(settings.layerMarkers.markers[j].pk) > -1){
                    settings.layerMarkers.markers[j].display(false);
                } else {
                    settings.layerMarkers.markers[j].display(true);
                }
            }
        },
        /*
        * Put a marker on the map
        */
        addMarker: function (mark) {
            /*
            * Default Feature configuration
            * This can be overrided in on_marker_click, using settings.current_feature
            */
            var lat = mark.geometry.coordinates[1];
            var lon = mark.geometry.coordinates[0];
            var size = new OpenLayers.Size(mark.properties.icon_width,
                                           mark.properties.icon_height);
            var icon_url = MEDIA_URL + mark.properties.icon_path;
            var icon_hover_url = '';
            if (mark.properties.icon_hover_path){
                var icon_hover_url = MEDIA_URL + mark.properties.icon_hover_path;
            }
            var iconclone = new OpenLayers.Icon(icon_url, size,
                                                settings.icon_offset);

            var feature = new OpenLayers.Feature(settings.layerMarkers,
                      new OpenLayers.LonLat(lon, lat).transform(
                                                        EPSG_DISPLAY_PROJECTION,
                                                        EPSG_PROJECTION),
                      {icon:iconclone});
            feature.pk = mark.properties.pk;
            feature.popupClass = settings.popupClass;
            feature.data.popupContentHTML = "<div class='cloud'>";
            if (!settings.popupContentFull) {
                feature.data.popupContentHTML += mark.properties.name;
            }
            feature.data.popupContentHTML += "</div>";
            feature.data.overflow = 'hidden';
            var marker = feature.createMarker();
            marker.pk = feature.pk;
            marker.name = mark.properties.name;
            marker.icon_url = icon_url;
            marker.icon_hover_url = icon_hover_url;
            marker.category_name = mark.properties.category_name;
            /* manage markers events */
            var _popup = function() {
                if (!feature.pk){
                    return;
                }
                /* show the popup */
                if (settings.current_popup != null) {
                    settings.current_popup.hide();
                }
                if (feature.popup == null) {
                    feature.popup = feature.createPopup();
                    settings.map.addPopup(feature.popup);
                } else {
                    feature.popup.toggle();
                }
                settings.current_popup = feature.popup;
                /* hide on click on the cloud */
                if (!settings.explicit_popup_hide){
                    settings.current_popup.groupDiv.onclick = methods.hidePopup;
                }
                settings.permalink.updateLink();
                methods.update_permalink_activation();
            }
            var _repan_popup = function(){
                /* re-pan manually */

                // no clean way to detect if all the element are ready
                // lack of better...
                setTimeout(
                    function(){
                        settings.current_popup.panIntoView();
                }, 1000);
            }

            var markerClick = function (evt) {
                settings.current_feature = feature;
                methods.setCurrentPosition(feature.lonlat);
                if ( settings.on_marker_click ) {
                    settings.on_marker_click(evt, mark, settings);
                }
                else
                {
                    methods.center_on_feature();
                    $('#chimere_map_menu').hide();
                    if (!feature.pk){
                        OpenLayers.Event.stop(evt);
                        return;
                    }
                    // Default popup
                    if (feature.popup && feature.popup.visible()) {
                        if (settings.current_popup == feature.popup) {
                            feature.popup.hide();
                            if (!settings.simple){
                                $('#detail').fadeOut();
                            }
                        } else {
                            settings.current_popup.hide();
                            _popup();
                            methods.display_feature_detail(feature.pk);
                            _repan_popup();
                        }
                    } else {
                        _popup();
                        methods.display_feature_detail(feature.pk);
                        _repan_popup();
                    }
                }
                OpenLayers.Event.stop(evt);
            };
            var markerOver = function (evt) {
                document.body.style.cursor='pointer';
                if (settings.current_feature && settings.current_feature.popup
                    && settings.current_feature.popup.visible()) return;
                var marker = evt.object;
                if (marker.icon_hover_url){
                    marker.setUrl(marker.icon_hover_url);
                }
                px = settings.map.getPixelFromLonLat(marker.lonlat);
                marker_hover = $('#'+settings.marker_hover_id);
                marker_hover_content = $('#'+settings.marker_hover_content_id);
                marker_hover_content.html(marker.category_name);
                var map_position = $(settings.map.div).offset();

                var width = marker_hover.width();
                width += parseInt(marker_hover.css("padding-left"), 10)
                       + parseInt(marker_hover.css("padding-right"), 10)
                       + parseInt(marker_hover.css("margin-left"), 10)
                       + parseInt(marker_hover.css("margin-right"), 10)
                       + parseInt(marker_hover.css("borderLeftWidth"), 10)
                       + parseInt(marker_hover.css("borderRightWidth"), 10);
                var pos_x = px.x + map_position.left
                            - width/2 + 1;
                if (settings.marker_hover_offset)
                    pos_x += settings.marker_hover_offset.x;
                $('#'+settings.marker_hover_id).css('left', pos_x);
                var height = marker_hover.height();
                height += parseInt(marker_hover.css("padding-top"), 10)
                       + parseInt(marker_hover.css("padding-bottom"), 10)
                       + parseInt(marker_hover.css("margin-top"), 10)
                       + parseInt(marker_hover.css("margin-bottom"), 10)
                       + parseInt(marker_hover.css("borderBottomWidth"), 10)
                       + parseInt(marker_hover.css("borderTopWidth"), 10);
                var pos_y = px.y + map_position.top
                            - height - marker.icon.size.h;
                if (settings.marker_hover_offset)
                    pos_y += settings.marker_hover_offset.y;
                $('#'+settings.marker_hover_id).css('top', pos_y);
                $('#'+settings.marker_hover_id).show();
                OpenLayers.Event.stop(evt);
            };
            var markerOut = function (evt) {
                document.body.style.cursor='auto';
                var marker = evt.object;
                if (marker.icon_hover_url){
                    marker.setUrl(marker.icon_url);
                }
                $('#'+settings.marker_hover_id).hide();
                OpenLayers.Event.stop(evt);
            };
            marker.events.register('click', feature, markerClick);
            marker.events.register('touchstart', feature, markerClick);
            marker.events.register('mouseover', feature, markerOver);
            marker.events.register('mouseout', feature, markerOut);
            settings.layerMarkers.addMarker(marker);
            /* show the item when designed in the permalink */
            if (settings.display_feature == feature.pk){
                settings.current_feature = feature;
                _popup(feature);
                methods.display_feature_detail(feature.pk);
                if (!settings.display_route){
                    settings.map.setCenter(feature.lonlat, 16);
                    _repan_popup();
                }
                settings.display_feature = null;
                //methods.loadCategories();
            }

            if (settings.enable_clustering){
            // manage cluster layer
                var point = new OpenLayers.Geometry.Point(lon, lat).transform(
                                                        EPSG_DISPLAY_PROJECTION,
                                                        EPSG_PROJECTION);
                var feat = new OpenLayers.Feature.Vector(point);
                feat.attributes = { icon: MEDIA_URL + mark.properties.icon_path,
                                    name: mark.properties.name, label:"",
                                    pk:mark.properties.pk, marker:marker};
                settings.cluster_array.push(feat);
            }

            return feature;
        },
        cleanRoute: function(){
            settings.layerVectors.removeAllFeatures();
        },
        // add json layer
        addJSON: function(json_url){
            var jsonStyle = new OpenLayers.Style({
                'strokeWidth':1,
                'fillColor':'#BBBBBB',
                'strokeColor':'#AAAAAA'
            });

            var jsonStyleMap = new OpenLayers.StyleMap({'default': jsonStyle});
            settings.layerJson = new OpenLayers.Layer.Vector("GeoJSON", {
                    projection: EPSG_DISPLAY_PROJECTION,
                    strategies: [new OpenLayers.Strategy.Fixed()],
                    protocol: new OpenLayers.Protocol.HTTP({
                        url: json_url,
                        format: new OpenLayers.Format.GeoJSON()
                    }),
                    styleMap: jsonStyleMap
                });
            settings.map.addLayer(settings.layerJson);
            settings.map.setLayerIndex(settings.layerJson, 0);
            settings.layerJson.setOpacity(0.4);
        },
        // Put a route on the map
        addRoute: function(route) {
            var polyline = route.geometry;
            var point_array = new Array();
            for (i=0; i<polyline.coordinates.length; i++){
                var point = new OpenLayers.Geometry.Point(polyline.coordinates[i][0],
                                                          polyline.coordinates[i][1]);
                point_array.push(point);
            }
            var linestring = new OpenLayers.Geometry.LineString(point_array);
            linestring.transform(EPSG_DISPLAY_PROJECTION, settings.map.getProjectionObject());
            settings.current_feature = new OpenLayers.Feature.Vector();

            var style = OpenLayers.Util.extend({},
                                    OpenLayers.Feature.Vector.style['default']);
            style.strokeColor = route.properties.color;
            style.strokeWidth = 3;
            settings.current_feature.style = style;
            settings.current_feature.geometry = linestring;
            settings.layerVectors.addFeatures([settings.current_feature]);
            if (settings.display_route && settings.display_route == route.properties.pk){
                var dataExtent = settings.current_feature.geometry.getBounds();
                map.zoomToExtent(dataExtent, closest=true);
                methods.loadCategories();
            }
        },
        /*
        * Put a multiline on the map
        */
        addMultiLine: function(feature) {
            var gformat = new OpenLayers.Format.GeoJSON();
            var feats = gformat.read(feature);
            var style = OpenLayers.Util.extend({},
                                    OpenLayers.Feature.Vector.style['default']);
            style.strokeColor = feature.properties.color;
            style.strokeWidth = 2;
            feats[0].style = style;
            feats[0].geometry = feats[0].geometry.transform(
                                            EPSG_DISPLAY_PROJECTION,
                                            settings.map.getProjectionObject());
            settings.layerVectors.addFeatures(feats);
        },
        routingInputChange: function(nominatim_id){
            $('#map_menu_clear').show();
            switch(nominatim_id){
                case 'nominatim_start':
                    settings.routing_start = new OpenLayers.Marker(
                            new OpenLayers.LonLat(
                                    $('#'+nominatim_id+'_lon').val(),
                                    $('#'+nominatim_id+'_lat').val()
                                    ).transform(EPSG_DISPLAY_PROJECTION,
                                        settings.map.getProjectionObject()),
                            settings.icon_start);
                    settings.layerRouteMarker.addMarker(settings.routing_start);
                    break;
                case 'nominatim_end':
                    settings.routing_end = new OpenLayers.Marker(
                            new OpenLayers.LonLat(
                                    $('#'+nominatim_id+'_lon').val(),
                                    $('#'+nominatim_id+'_lat').val()
                                    ).transform(EPSG_DISPLAY_PROJECTION,
                                        settings.map.getProjectionObject()),
                            settings.icon_end);
                    settings.layerRouteMarker.addMarker(settings.routing_end);
                    break;
                default:
                    settings.routing_steps.push(new OpenLayers.Marker(
                            new OpenLayers.LonLat(
                                    $('#'+nominatim_id+'_lon').val(),
                                    $('#'+nominatim_id+'_lat').val()
                                    ).transform(EPSG_DISPLAY_PROJECTION,
                                        settings.map.getProjectionObject()),
                            settings.icon_step.clone()));
                    settings.layerRouteMarker.addMarker(
                        settings.routing_steps[settings.routing_steps.length-1]);
                    break;
            }
            if (settings.routing_end && settings.routing_start
                && $('#search_routing').length) {
                $('#search_routing').button('enable');
            }
        },

        redrawRoutingIcons: function(){
            settings.layerRouteMarker.clearMarkers();
            settings.layerRouteMarker.addMarker(settings.routing_start);
            settings.layerRouteMarker.addMarker(settings.routing_end);
            for (var k=0;k<settings.routing_steps.length;k++){
                settings.layerRouteMarker.addMarker(settings.routing_steps[k]);
            }
        },

        // set the start point for routing
        routingFrom: function(){
            $('#chimere_map_menu').hide();
            settings.routing_panel_open();
            $('#map_menu_clear').show();
            settings.routing_start = new OpenLayers.Marker(
                                          settings.current_position.clone(),
                                          settings.icon_start);
            settings.layerRouteMarker.addMarker(settings.routing_start);
            if (nominatim_url){
                helpers.updateNominatimName(settings.current_position.clone()
                                 .transform(settings.map.getProjectionObject(),
                                            EPSG_DISPLAY_PROJECTION),
                                            'start_label');
            }
            if (settings.routing_end) methods.route();
        },
        // add a step point for routing
        routingAddStep: function(){
            $('#chimere_map_menu').hide();
            settings.routing_panel_open();
            $('#map_menu_clear').show();
            settings.routing_steps.push(new OpenLayers.Marker(
                                          settings.current_position.clone(),
                                          settings.icon_step.clone()));
            settings.layerRouteMarker.addMarker(
                       settings.routing_steps[settings.routing_steps.length-1]);

            if (nominatim_url){
                var current_itinerary_number = methods.add_step_fx();
                helpers.updateNominatimName(settings.current_position.clone()
                                 .transform(settings.map.getProjectionObject(),
                                            EPSG_DISPLAY_PROJECTION),
                                     'step_'+current_itinerary_number+'_label');
            }
            if (settings.routing_end && settings.routing_start) methods.route();
        },
        // change routing speed
        routingChangeSpeed: function(speed){
            settings.routing_speed = speed;
        },
        // change routing transport
        routingChangeTransport: function(transport){
            settings.routing_transport = transport;
        },
        // add a step on the interface
        add_step_fx: function (){
            settings.itinerary_step_number += 1;
            var cloned = $("#id_start_div").clone();
            var c_id = 'step_' + settings.itinerary_step_number;
            cloned.attr('id', 'id_'+c_id+'_div');
            cloned.children('label').html(step_label).addClass('step_label');
            cloned.children("#nominatim_start_label").attr('id', c_id+'_label'
                                                    ).html('');
            cloned.children('label.nominatim-label').attr('for', ""
                                                    ).removeClass('step_label');
            var id_suffixes = ['_lat', '_lon', ''];
            for (idx=0;idx < id_suffixes.length;idx+=1){
                var suffix = id_suffixes[idx];
                val = c_id + suffix;
                cloned.children("#nominatim_start"+suffix).attr('id', val
                                                         ).attr('name', val);
            }
            if (settings.itinerary_step_number == 1){
                $("#nominatim_end_label").after(cloned);
            } else {
                $("#step_"+(settings.itinerary_step_number-1)+"_label"
                                                            ).after(cloned);
            }
            $('#' + c_id).val(default_nominatim_lbl);
            $('#' + c_id).click(function(){
                $('#'+c_id).val('');
            });
            $(".nominatim-widget").autocomplete(nominatim_widget_options);
            return settings.itinerary_step_number;
        },

        // set the finish point for routing
        routingTo: function(){
            $('#chimere_map_menu').hide();
            settings.routing_panel_open();
            $('#map_menu_clear').show();
            settings.routing_end = new OpenLayers.Marker(
                                          settings.current_position.clone(),
                                          settings.icon_end);
            settings.layerRouteMarker.addMarker(settings.routing_end);
            if (nominatim_url){
                helpers.updateNominatimName(settings.current_position.clone()
                                 .transform(settings.map.getProjectionObject(),
                                            EPSG_DISPLAY_PROJECTION),
                                            'end_label');
            }
            if (settings.routing_start) methods.route();
        },

        // clear the current itinerary
        routingClear: function(){
            $('#nominatim_start_lon').val('');
            $('#nominatim_start_lat').val('');
            $('#nominatim_start_label').html('');
            $('#chimere_start_label').html('');
            $('#nominatim_end_lon').val('');
            $('#nominatim_end_lat').val('');
            $('#nominatim_end_label').html('');
            $('#chimere_end_label').html('');
            $('.nominatim-widget').val(default_nominatim_lbl);
            $('#chimere_map_menu').hide();
            $('#map_menu_clear').hide();
            $('#chimere_itinerary').hide();
            $('#chimere_itinerary_form').show();
            $('div[id^="id_step_"]').remove();
            if($('#search_routing').length) $('#search_routing').button('disable');
            settings.layerRoute.removeAllFeatures();
            settings.layerRouteMarker.clearMarkers();
            settings.routing_start = null;
            settings.routing_end = null;
            settings.routing_steps = new Array();
            settings.current_itinerary_number = 0;
            settings.current_routes_features = [];
            settings.permalink.updateLink();
        },
        // display a route
        route: function(){
            if($('#search_routing').length) $('#search_routing').button('enable');
            if (!settings.routing_start || !settings.routing_end){
                return;
            }
            var steps = [settings.routing_start.lonlat.clone()]
            for (var i = 0; i < settings.routing_steps.length; i++) {
                steps.push(settings.routing_steps[i].lonlat.clone());
            }
            steps.push(settings.routing_end.lonlat.clone());
            // create the appropriate URL
            var uri = extra_url + "route/"
            if(settings.routing_transport){
                uri += settings.routing_transport + "/"
            }
            if(settings.routing_speed){
                uri += settings.routing_speed + "/"
            }
            for (var i = 0; i < steps.length; i++) {
                var step = steps[i].transform(
                                            settings.map.getProjectionObject(),
                                            EPSG_DISPLAY_PROJECTION);
                if (i > 0){
                    uri += '_';
                }
                uri += step.lon + '_' + step.lat;
            }
            settings.permalink.updateLink();
            $.ajax({url: uri,
                    dataType: "json",
                    success: function (data) {
                        settings.layerRoute.removeAllFeatures();
                        methods.redrawRoutingIcons();
                        methods.hideMessage();
                        if (!data.features.length){
                            methods.displayMessage(routing_fail_message);
                            return;
                        }
                        settings.current_routes_features = [];
                        for (var i = 0; i < data.features.length; i++) {
                            var feat = data.features[i];
                            if(feat.type == 'LineString'){
                                settings.current_routes_features.push(
                                                        methods.putRoute(feat));
                            } else {
                                var lonlat = new OpenLayers.LonLat(
                                                  feat.geometry.coordinates[0],
                                                  feat.geometry.coordinates[1]);
                                lonlat.transform(EPSG_DISPLAY_PROJECTION,
                                            settings.map.getProjectionObject());
                                var icon_height = feat.properties.icon_height;
                                var icon_width = feat.properties.icon_width;
                                var marker = new OpenLayers.Marker(lonlat,
                                             new OpenLayers.Icon(
                                                feat.properties.icon_path,
                                               new OpenLayers.Size(icon_width,
                                                                   icon_height),
                                               new OpenLayers.Pixel(
                                                               -(icon_width/2),
                                                               -icon_height))
                                             );
                                settings.layerRouteMarker.addMarker(marker);
                            }
                        }
                        if (data.message) methods.displayMessage(data.message);
                        settings.map.zoomToExtent(
                                settings.layerRoute.getDataExtent());
                        settings.map.zoomOut();
                        $('#id_transport_it').find('span'
                                                    ).removeClass('selected');
                        $('#id_transport_it_'+data.properties.transport
                                                    ).addClass('selected');
                        $('#chimere_total_label').html(
                                            data.properties.total);
                        $('#chimere_itinerary_content').html(
                                            data.properties.description);
                        $('#chimere_itinerary').show();
                        if(!settings.edition_type_is_route){
                            $('#chimere_itinerary_form').hide();
                            settings.routing_panel_open();
                        } else {
                            methods.updateRoutingInput();
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        methods.redrawRoutingIcons();
                        methods.hideMessage();
                        console.log(errorThrown);
                        console.log(textStatus);
                        settings.layerRoute.removeAllFeatures();
                        methods.displayMessage(routing_fail_message);
                    }
                });

        },
        /*
        Put a route on the map
        */
        putRoute: function(polyline) {
            var point_array = new Array();
            for (i=0; i<polyline.coordinates.length; i++){
                var point = new OpenLayers.Geometry.Point(polyline.coordinates[i][0],
                                                          polyline.coordinates[i][1]);
                point_array.push(point);
            }
            var linestring = new OpenLayers.Geometry.LineString(point_array);
            linestring.transform(EPSG_DISPLAY_PROJECTION, settings.map.getProjectionObject());
            current_route = new OpenLayers.Feature.Vector();
            var style = OpenLayers.Util.extend({},
                                     OpenLayers.Feature.Vector.style['default']);
            style.strokeWidth = 3;
            current_route.style = style;
            current_route.geometry = linestring;
            settings.layerRoute.addFeatures([current_route]);
            return current_route;
        },
        display_feature_detail: function (pk) {
            /*
            * update current detail panel with an AJAX request
            */
            var uri = extra_url
            if (settings.area_id) uri += settings.area_id + "/"
            uri += "getDetail/" + pk;
            var params = {}
            if (settings.simple) { params["simple"] = 1; }
            $.ajax({url: uri,
                    data: params,
                    dataType: "html",
                    success: function (data) {
                        if ( settings.display_feature_detail_fx ) {
                            // Custom function ?
                            settings.display_feature_detail_fx(data, settings);
                        }
                        else {
                            if (!settings.popupContentFull) {
                                $('#detail').html(data).fadeIn();
                            }
                            else {
                                settings.current_popup.setContentHTML("<div class='cloud'>" + data + "</div>");
                            }
                        }
                    }
                   });
        },
        displayMessage: function(message){
            if (!$('#chimere_message').length) return;
            $('#chimere_message').html(message);
            $('#chimere_message').dialog('open');
        },
        hideMessage: function(message){
            if (!$('#chimere_message').length) return;
            $('#chimere_message').dialog('close');
        },
        center_on_feature: function(feature) {
            var f = get_or_set(feature, settings.current_feature);
            if (f)
            {
                settings.map.setCenter(f.lonlat);
            }
        },
        zoom: function (options) {
            if ($.hasattr("category", options)) {
                helpers.zoom_to_category(options["category"]);
            } else if ($.hasattr("subcategories", options)) {
                helpers.zoom_to_subcategories(options["subcategories"]);
            } else if ($.hasattr("area", options)) {
                helpers.zoom_to_area(options["area"]);
            }
        },
        open_dialog: function(title, content){
            if(settings.open_dialog_fx){
                settings.open_dialog_fx(title, content);
            } else {
                $("#category_description").html(content).dialog();
                $("#category_description").dialog("option", "title", title);
                $('#category_description').dialog('open');
            }
        },
        category_detail: function (category_id) {
            /* show the detail of a category */
            var uri = extra_url + "getDescriptionDetail/" + category_id;
            $.ajax({url:uri,
                    success: function (data) {
                        methods.open_dialog($("#category_title").html(), data);
                    }
                   });
        },
        /*
        * Load the subcategory description if available
        */
        subcategory_detail: function(category_id){
            var uri = extra_url + "getCategory/" + category_id;

            $.ajax({url: uri,
                    dataType: "json",
                    success: function (data) {
                        if (!data.description){return}
                        methods.open_dialog(data.name, data.description);
                    },
                    error: function (data) {
                        // fail silently
                    }
                });
        },
        toggle_category: function (id) {
            // TODO make this id DOM element customisable
            // Check if element is currently visible or not
            var was_visible = $("#maincategory_" + id).is(":visible");
            // Close all categories
            var category_plus = STATIC_URL + "chimere/img/plus.png";
            var category_minus = STATIC_URL + "chimere/img/minus.png";
            if (settings.category_accordion){
                $("#categories ul.subcategories").hide();
                $("#categories img.toggle_category").attr("src", category_plus);
                $("#categories .main_category").addClass("toggle_plus");
                $("#categories .main_category").removeClass("toggle_minus");
            }
            // Put a minus image
            if (!was_visible)
            {
                // Show the subcategories
                $("#maincategory_" + id).toggle();
                $("#maincategory_" + id).parent().addClass("toggle_minus");
                $("#maincategory_" + id).parent().removeClass("toggle_plus");
                // Put a plus image
                $("#maincategory_img_" + id).attr("src", category_minus);
                settings.current_category = id;
            }
            if (!settings.category_accordion && was_visible)
            {
                $("#maincategory_" + id).toggle();
                $("#maincategory_" + id).parent().addClass("toggle_plus");
                $("#maincategory_" + id).parent().removeClass("toggle_minus");
                // Put a minus image
                $("#maincategory_img_" + id).attr("src", category_plus);
            }
        },
        zoomToCurrentExtent: function(){
            /* zoom to current extent */
            var current_extent = helpers.getSavedExtent();
            var extent;
            if (OpenLayers && current_extent && current_extent.length == 4){
                extent = new OpenLayers.Bounds(
                                current_extent[0], current_extent[1],
                                current_extent[2], current_extent[3]);
            }
            /*
            else if (OpenLayers && default_area && default_area.length == 4){
                extent = new OpenLayers.Bounds(default_area[0], default_area[1],
                                               default_area[2], default_area[3]);
            }*/
            else{
                return;
            }
            extent.transform(EPSG_DISPLAY_PROJECTION, EPSG_PROJECTION);
            settings.map.zoomToExtent(extent, true);
            return true;
        },
        zoomToMarkerExtent: function(){
            settings.map.zoomToExtent(
                        settings.layerMarkers.getDataExtent());
        },
        // methods for edition
        setMarker: function (event){
            event = event || window.event;
            var lonlat = settings.map.getLonLatFromViewPortPx(event.xy);
            methods.putEditMarker(lonlat, false);
            OpenLayers.Event.stop(event);
        },
        cleanMarker: function(){
            if (settings.current_edit_feature) {
                settings.layerMarkers.removeMarker(settings.current_edit_feature);
            }
        },
        /* put the marker on the map and update latitude and longitude fields */
        putEditMarker: function (lonlat, zoom){
            methods.cleanMarker();
            settings.current_edit_feature = new OpenLayers.Marker(lonlat.clone(),
                                                      settings.default_icon);
            settings.layerMarkers.addMarker(settings.current_edit_feature);
            methods.updateMarkerInput();
            /* zoom to the point */
            if (zoom){
                var bounds = settings.layerMarkers.getDataExtent();
                if (bounds) settings.map.zoomToExtent(bounds);
            }
            return;
        },
        updateMarkerInput: function(){
            if (!settings.current_edit_feature) {
                return;
            }
            lonlat = settings.current_edit_feature.lonlat.clone().transform(
                                             settings.map.getProjectionObject(),
                                             EPSG_DISPLAY_PROJECTION);
            $('#'+settings.input_id).val(
                                'POINT(' + lonlat.lon + ' ' + lonlat.lat + ')');
            if($('#live_latitude').length){
                $('#live_latitude').val(lonlat.lat);
                $('#live_longitude').val(lonlat.lon);
            }

        },
        updateRoutingInput: function(){
            if (!settings.current_routes_features) {
                return;
            }
            var wkt = new OpenLayers.Format.WKT();
            var point_array = [];
            // not very effective...
            for (idx in settings.current_routes_features){
                var c_geo = settings.current_routes_features[idx].geometry.clone();
                c_geo = c_geo.transform(EPSG_PROJECTION,
                                        EPSG_DISPLAY_PROJECTION);
                var vertices = c_geo.getVertices();
                for (idx_pt in vertices){
                    var point = vertices[idx_pt];
                    point = wkt.read(String(point));
                    point_array.push(point.geometry);
                }
            }
            var linestring = new OpenLayers.Geometry.LineString(point_array);
            jQuery('#id_route').val(String(linestring));
        },
        activateCurrentControl: function(){
            if (settings.current_control){
                settings.current_control.activate();
            } else {
                var pathCreate = settings.map.getControlsByClass(
                                        'OpenLayers.Control.DrawFeature');
                if (pathCreate){
                    pathCreate[0].activate();
                }
            }
            var pathModify = settings.map.getControlsByClass(
                                      'OpenLayers.Control.ModifyFeature');
            if (settings.current_feature && pathModify){
                pathModify[0].selectFeature(settings.current_feature);
            }
        },
        deactivateCurrentControl: function(){
            if (settings.current_control){
                settings.current_control.deactivate();
            }
        },
        initFeature: function(json_geometry){
            var json = new OpenLayers.Format.JSON();
            var polyline = json.read(json_geometry);
            var point_array = new Array();
            for (i=0; i<polyline.coordinates.length; i++){
                var point = new OpenLayers.Geometry.Point(
                                    polyline.coordinates[i][0],
                                    polyline.coordinates[i][1]);
                point_array.push(point);
            }
            var linestring = new OpenLayers.Geometry.LineString(point_array);
            methods.initFeatureFromGeometry(linestring);
        },
        initFeatureFromWkt: function(wkt_geometry){
            var linestring = OpenLayers.Geometry.fromWKT(wkt_geometry);
            methods.initFeatureFromGeometry(linestring);
        },
        initFeatureFromGeometry: function(linestring){
            linestring.transform(EPSG_DISPLAY_PROJECTION,
                                 EPSG_PROJECTION);
            currentFeature = new OpenLayers.Feature.Vector();
            currentFeature.geometry = linestring;
            settings.layerVectors.removeFeatures();
            settings.layerVectors.addFeatures([currentFeature]);
            var pathModify = settings.map.getControlsByClass(
                                        'OpenLayers.Control.ModifyFeature');
            if (pathModify){
                settings.current_control = pathModify[0];
            }
            /*zoom to the route*/
            var bounds = settings.layerVectors.getDataExtent();
            if (bounds) settings.map.zoomToExtent(bounds);
        },
        showPopup: function (feature_pk) {
            for(j=0; j<settings.layerMarkers.markers.length;j++){
                var c_marker = settings.layerMarkers.markers[j];
                if(c_marker.pk == feature_pk){
                    c_marker.events.triggerEvent('click');
                    return true
                }
            }
            return false;
            //feature.markerClick();
            //OpenLayers.Popup.popupSelect.clickFeature(feature);
            /*
            settings.current_popup = feature.marker._popup();
            if (!settings.current_popup.visible()){
                settings.current_popup.show();
                methods.display_feature_detail(feature.pk);
            }*/
        },
        hidePopup: function (evt) {
            $('#'+settings.marker_hover_id).hide();
            if (settings.hide_popup_fx) {
                settings.hide_popup_fx(evt, settings)
            }
            else { // Default behaviour
                if (settings.current_popup)
                {
                    settings.current_feature = null;
                    if (!settings.simple){
                        $('#detail').fadeOut();
                    }
                    if (settings.current_popup.visible()){
                        settings.current_popup.hide();
                        if(evt)
                            settings.map.events.triggerEvent('click', evt);
                        methods.update_permalink_activation();
                        return true;
                    }
                }
            }
            methods.update_permalink_activation();
            return false;
        },
        saveExtent: function(){
            var extent_key = 'MAP_EXTENT';
            //if (area_name){ extent_key = extent_key + '_' + area_name; }
            if (!settings.map) return;
            var extent = settings.map.getExtent().transform(EPSG_PROJECTION,
                                                   EPSG_DISPLAY_PROJECTION);
            document.cookie = extent_key + '=' + extent.toArray().join('_')
                              + ';path=/';
        }
    }; // End of public methods
    var helpers = {
        getSubcategories: function (category_id) {
            if(settings.get_subcategories_fx) {
                return settings.get_subcategories_fx(category_id, settings);
            }
            else {
                var ul = document.getElementById('maincategory_'+category_id);
                var subcats = new Array();
                for (i in ul.children){
                    var li = ul.children[i];
                    if (li.id){
                        subcats.push(li.id.split('_').pop());
                    }
                }
                return subcats;
            }
        },
        retrieve_checked_categories: function () {
            /*
            * Retrieve checked_categories, and store it in settings 
            */
            var initialized = false;
            $('#frm_categories .subcategories input:checkbox').each(
                function(index){
                    if (!initialized){
                        initialized = true;
                        settings.checked_categories = [];
                        settings.display_submited = false;
                    }
                    if ($(this).attr('checked') == 'checked' || $(this).attr('checked') == true){
                        cat_id = $(this).attr('id').split('_').pop();
                        settings.checked_categories.push(parseInt(cat_id));
                    }
            });
            if(initialized && ($('#display_submited_check').attr("checked") == "checked" || $('#display_submited_check').attr("checked") == true)){
                settings.display_submited = true;
            }
        },
        zoom_to: function (bounds) {
            settings.map.zoomToExtent(bounds)
        },
        zoom_to_subcategories: function (ids) {
            // TODO add markers and check the subcategory, if not yet checked/displayed
            var ids = ids.join('_');
            if (!ids) ids = '0';
            var uri = extra_url + "getGeoObjects/" + ids;
            if (settings.display_submited) uri += "/A_S";
            $.ajax({url: uri, 
                    dataType: "json",
                    success: function (data) {
                        // Create a generic bounds
                        var lon, lat, feature;
                        var bounds = new OpenLayers.Bounds()
                        for (var i = 0; i < data.features.length; i++) {
                            feature = data.features[i];
                            if (feature.geometry.type == 'Point') {
                                    lat = feature.geometry.coordinates[1];
                                    lon = feature.geometry.coordinates[0];
                                    bounds.extend(new OpenLayers.LonLat(lon, lat).transform(EPSG_DISPLAY_PROJECTION, EPSG_PROJECTION));
                            } else if (feature.geometry.type == 'LineString') {
                                // TODO
                            }
                        }
                        helpers.zoom_to(bounds);
                   }
               });
        },
        zoom_to_category: function (id) {
            helpers.zoom_to_subcategories(helpers.getSubcategories(id));
        },
        zoom_to_area: function (coords) {
            /* zoom to an area */
            var left = coords[0];
            var bottom = coords[1];
            var right = coords[2];
            var top = coords[3];
            var bounds = new OpenLayers.Bounds(left, bottom, right, top);
            bounds.transform(EPSG_DISPLAY_PROJECTION, EPSG_PROJECTION);
            settings.map.zoomToExtent(bounds, true);
            if (settings.dynamic_categories) {
                methods.loadCategories();
            }
        },
        zoom_to_latlon: function (){
            var lonlat = new OpenLayers.LonLat(lon, lat);
            settings.map.setCenter(f.lonlat);
        },
        getSavedExtent: function() {
            /* get the current extent from a cookie */
            var cookies = document.cookie.split(';');
            var map_extent;
            var extent_key = 'MAP_EXTENT';
            //if (area_name){ extent_key = extent_key + '_' + area_name; }
            for (var i=0; i < cookies.length; i++){
                var items = cookies[i].split('=');
                key = items[0].split(' ').join('');
                if (key == extent_key && !map_extent){
                    map_extent = items[1].split('_');
                }
            }
            return map_extent;
        },
        featureRouteCreated: function(event) {
            /* toggle to edition mode */
            var pathModify = settings.map.getControlsByClass(
                                         'OpenLayers.Control.ModifyFeature')[0];
            var pathCreate = settings.map.getControlsByClass(
                                         'OpenLayers.Control.DrawFeature')[0];
            pathCreate.deactivate();
            settings.current_control = pathModify;
            jQuery('#help-route-create').hide();
            jQuery('#help-route-modify').show();
            pathModify.activate();
            helpers.updateRouteForm(event);
            pathModify.selectFeature(event.feature);
        },
        updateRouteForm: function(event) {
            /* update the form */
            if (event){
                settings.current_feature = event.feature;
            }
            var current_geo = settings.current_feature.geometry.clone();
            current_geo.transform(EPSG_PROJECTION, EPSG_DISPLAY_PROJECTION);
            jQuery('#id_route').val(current_geo);
            var vertices = current_geo.getVertices();
            if (vertices){
                jQuery("#"+settings.input_id).val(vertices);
            }
        },
        updateNominatimName:function(lonlat, response_id){
            $.ajax({
                url: nominatim_url.substring(0, nominatim_url.length-6) + 'reverse',
                data: {
                    format: "json",
                    lat:lonlat.lat,
                    lon:lonlat.lon
                },
                dataType:'json',
                success: function (vals) {
                    $('#'+response_id).html(vals.display_name);
                    $('#nominatim_'+response_id).html(vals.display_name);
                    $('#chimere_'+response_id).html(vals.display_name);
                }
            });
        }
    }; // End of helpers

    $.fn.chimere = function (thing) {
        // Method calling logic
        if ( methods[thing] ) {
            return methods[ thing ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        }
        else if ( typeof thing === 'object' || ! thing ) {
            return methods.init.apply( this, arguments );
        }
        else if ( thing === 'settings' ) {
            // Use $("#mydiv").chimere("settings", "key", "value") to change settings
            // from outside the plugin
            if (arguments.length == 3) {
                settings[arguments[1]] = arguments[2];
            }
            else if (arguments.length == 2) {
                return settings[arguments[1]];
            }
            else { // Use $("#mydiv").chimere("settings") to know the current settings
                return settings;
            }
        }
        else {
            $.error( 'Method ' +  thing + ' does not exist on jQuery.chimere' );
        }
        return this;
    };
})( jQuery );
