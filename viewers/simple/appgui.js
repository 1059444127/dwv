/** 
 * Application GUI.
 */

// Loaders
dwv.gui.appendLoadboxHtml = function(){
    dwv.gui.base.appendLoadboxHtml();
};

// File loader
dwv.gui.appendFileLoadHtml = function(){
    dwv.gui.base.appendFileLoadHtml();
};
dwv.gui.displayFileLoadHtml = function(bool){
    dwv.gui.base.displayFileLoadHtml(bool);
};

// Url loader
dwv.gui.appendUrlLoadHtml = function(){
    dwv.gui.base.appendUrlLoadHtml();
};
dwv.gui.displayUrlLoadHtml = function(bool){
    dwv.gui.base.displayUrlLoadHtml(bool);
};

// Toolbox 
dwv.gui.appendToolboxHtml = function(){
    //dwv.gui.base.appendToolboxHtml();
};
dwv.gui.displayToolboxHtml = function(bool){
    dwv.gui.base.displayToolboxHtml(bool);
};
dwv.gui.initToolboxHtml = function(){
    //dwv.gui.base.initToolboxHtml();
};

// Window/level
dwv.gui.appendWindowLevelHtml = function(){
    var wlbutton = document.createElement("button");
    wlbutton.id = "wlLi";
    wlbutton.value = "windowlevel";
    wlbutton.onclick = dwv.gui.onChangeTool;
    wlbutton.appendChild(document.createTextNode("W/L"));
    wlbutton.setAttribute("class","ui-btn ui-btn-inline");
    
    var node = document.getElementById("toolbar");
    node.appendChild(wlbutton);
    $("#toolbar").trigger("create");
};
dwv.gui.displayWindowLevelHtml = function(bool){
    //dwv.gui.base.displayWindowLevelHtml(bool);
};
dwv.gui.initWindowLevelHtml = function(){
    //dwv.gui.base.initWindowLevelHtml();
};

// Zoom
dwv.gui.appendZoomHtml = function(){
    var zoombutton = document.createElement("button");
    zoombutton.id = "zoomLi";
    zoombutton.value = "zoom";
    zoombutton.onclick = dwv.gui.onChangeTool;
    zoombutton.appendChild(document.createTextNode("Zoom"));
    zoombutton.setAttribute("class","ui-btn ui-btn-inline");
    
    var node = document.getElementById("toolbar");
    node.appendChild(zoombutton);
    $("#toolbar").trigger("create");
};
dwv.gui.displayZoomHtml = function(bool){
    //dwv.gui.base.displayZoomHtml(bool);
};

// Undo/redo
// TODO not needed but gives error...
dwv.gui.appendUndoHtml = function(){
    //dwv.gui.base.appendUndoHtml();
};
