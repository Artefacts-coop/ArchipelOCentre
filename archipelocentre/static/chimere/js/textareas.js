/* base function shared by some pages */
/* Copyright (C) 2009  Étienne Loks  <etienne.loks_AT_peacefrogsDOTnet>

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
if (!window.tinymce_init){
    window.tinymce_init = true;
    tinyMCE.init({
        mode : "textareas",
        theme : "advanced",
        editor_selector : "mceEditor",
        relative_urls : false,
        theme_advanced_buttons1 : "bold,italic,underline,strikethrough,separator,bullist,numlist,separator,hr,separator,link",
        theme_advanced_buttons2 : "",
        theme_advanced_buttons3 : ""
    })
};
