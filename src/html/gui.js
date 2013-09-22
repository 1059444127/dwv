/** 
 * GUI module.
 * @module gui
 */
var dwv = dwv || {};
/**
 * Namespace for GUI functions.
 * @class gui
 * @namespace dwv
 * @static
 */
dwv.gui = dwv.gui || {};

/**
 * Handle window/level change.
 * @method onChangeWindowLevelPreset
 * @namespace dwv.gui
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeWindowLevelPreset = function(event)
{
    app.getToolBox().getSelectedTool().setPreset(this.value);
};

/**
 * Handle colour map change.
 * @method onChangeColourMap
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeColourMap = function(event)
{
    app.getToolBox().getSelectedTool().setColourMap(this.value);
};

/**
 * Handle tool change.
 * @method onChangeTool
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeTool = function(event)
{
    app.getToolBox().setSelectedTool(this.value);
};

/**
 * Handle filter change.
 * @method onChangeFilter
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeFilter = function(event)
{
    app.getToolBox().getSelectedTool().setSelectedFilter(this.value);
};

/**
 * Handle shape change.
 * @method onChangeShape
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeShape = function(event)
{
    app.getToolBox().getSelectedTool().setShapeName(this.value);
};

/**
 * Handle line color change.
 * @method onChangeLineColour
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeLineColour = function(event)
{
    app.getToolBox().getSelectedTool().setLineColour(this.value);
};

/**
 * Append the toolbox HTML to the page.
 * @method appendToolboxHtml
 * @static
 */
dwv.gui.appendToolboxHtml = function()
{
    // select
    var toolSelector = dwv.html.createHtmlSelect("toolSelect",dwv.tool.tools);
    toolSelector.onchange = dwv.gui.onChangeTool;
    // label
    var toolLabel = document.createElement("label");
    toolLabel.setAttribute("for", "toolSelect");
    toolLabel.appendChild(document.createTextNode("Tool: "));
    // list element
    var toolLi = document.createElement("li");
    toolLi.id = "toolLi";
    //toolLi.appendChild(toolLabel);
    toolLi.appendChild(toolSelector);
    toolLi.setAttribute("class","ui-block-a");

    // node
    var node = document.getElementById("toolList");
    // clear it
    while(node.hasChildNodes()) node.removeChild(node.firstChild);
    // append
    node.appendChild(toolLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Append the window/level HTML to the page.
 * @method appendWindowLevelHtml
 * @static
 */
dwv.gui.appendWindowLevelHtml = function()
{
    // preset selector
    var wlSelector = dwv.html.createHtmlSelect("presetSelect",dwv.tool.presets);
    wlSelector.onchange = dwv.gui.onChangeWindowLevelPreset;
    // preset label
    var wlLabel = document.createElement("label");
    wlLabel.setAttribute("for", "presetSelect");
    wlLabel.appendChild(document.createTextNode("WL Preset: "));
    // colour map selector
    var cmSelector = dwv.html.createHtmlSelect("colourMapSelect",dwv.tool.colourMaps);
    // special monochrome1 case
    if( app.getImage().getPhotometricInterpretation() === "MONOCHROME1" )
        cmSelector.options[1].defaultSelected = true;
    cmSelector.onchange = dwv.gui.onChangeColourMap;
    // colour map label
    var cmLabel = document.createElement("label");
    cmLabel.setAttribute("for", "colourMapSelect");
    cmLabel.appendChild(document.createTextNode("Colour Map: "));

    // preset list element
    var wlLi = document.createElement("li");
    wlLi.id = "wlLi";
    //wlLi.appendChild(wlLabel);
    wlLi.appendChild(wlSelector);
    wlLi.setAttribute("class","ui-block-b");
    // color map list element
    var cmLi = document.createElement("li");
    cmLi.id = "cmLi";
    // cmLi.appendChild(cmLabel);
    cmLi.appendChild(cmSelector);
    cmLi.setAttribute("class","ui-block-c");

    // node
    var node = document.getElementById("toolList");
    // apend preset
    node.appendChild(wlLi);
    // apend color map
    node.appendChild(cmLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the window/level HTML.
 * @method clearWindowLevelHtml
 * @static
 */
dwv.gui.clearWindowLevelHtml = function()
{
    dwv.html.removeNode("wlLi");
    dwv.html.removeNode("cmLi");
};

/**
 * Append the draw HTML to the page.
 * @method appendDrawHtml
 * @static
 */
dwv.gui.appendDrawHtml = function()
{
    // shape select
    var shapeSelector = dwv.html.createHtmlSelect("shapeSelect",dwv.tool.shapes);
    shapeSelector.onchange = dwv.gui.onChangeShape;
    // shape label
    var shapeLabel = document.createElement("label");
    shapeLabel.setAttribute("for", "shapeSelect");
    shapeLabel.appendChild(document.createTextNode("Shape: "));
    // colour select
    var colourSelector = dwv.html.createHtmlSelect("colourSelect",dwv.tool.colors);
    colourSelector.onchange = dwv.gui.onChangeLineColour;
    // colour label
    var colourLabel = document.createElement("label");
    colourLabel.setAttribute("for", "colourSelect");
    colourLabel.appendChild(document.createTextNode("Colour: "));

    // list element
    var shapeLi = document.createElement("li");
    shapeLi.id = "shapeLi";
    // shapeLi.appendChild(shapeLabel);
    shapeLi.appendChild(shapeSelector);
    shapeLi.setAttribute("class","ui-block-c");
    // list element
    var colourLi = document.createElement("li");
    colourLi.id = "colourLi";
    //colourLi.appendChild(colourLabel);
    colourLi.appendChild(colourSelector);
    colourLi.setAttribute("class","ui-block-b");
    
    // node
    var node = document.getElementById("toolList");
    // apend shape
    node.appendChild(shapeLi);
    // append color
    node.appendChild(colourLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the draw HTML.
 * @method clearDrawHtml
 * @static
 */
dwv.gui.clearDrawHtml = function()
{
    dwv.html.removeNode("colourLi");
    dwv.html.removeNode("shapeLi");
};

/**
 * Append the color chooser HTML to the page.
 * @method appendLivewireHtml
 * @static
 */
dwv.gui.appendLivewireHtml = function()
{
    // select
    var colourSelector = dwv.html.createHtmlSelect("colourSelect",dwv.tool.colors);
    colourSelector.onchange = dwv.gui.onChangeLineColour;
    // label
    var colourLabel = document.createElement("label");
    colourLabel.setAttribute("for", "colourSelect");
    colourLabel.appendChild(document.createTextNode("Colour: "));
    
    // list element
    var colourLi = document.createElement("li");
    colourLi.id = "colourLi";
    colourLi.setAttribute("class","ui-block-b");
    //colourLi.appendChild(colourLabel);
    colourLi.appendChild(colourSelector);
    
    // append to tool list
    document.getElementById("toolList").appendChild(colourLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the color chooser HTML.
 * @method clearDrawHtml
 * @static
 */
dwv.gui.clearLivewireHtml = function()
{
    dwv.html.removeNode("colourLi");
};

/**
 * Append the filter HTML to the page.
 * @method appendLivewireHtml
 * @static
 */
dwv.gui.appendFilterHtml = function()
{
    // select
    var filterSelector = dwv.html.createHtmlSelect("filterSelect",dwv.tool.filters);
    filterSelector.onchange = dwv.gui.onChangeFilter;
    // label
    var filterLabel = document.createElement("label");
    filterLabel.setAttribute("for", "filterSelect");
    filterLabel.appendChild(document.createTextNode("Filter: "));

    // list element
    var filterLi = document.createElement("li");
    filterLi.id = "filterLi";
    filterLi.setAttribute("class","ui-block-b");
    //filterLi.appendChild(filterLabel);
    filterLi.appendChild(filterSelector);
    
    // append to tool list
    document.getElementById("toolList").appendChild(filterLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the filter HTML.
 * @method clearDrawHtml
 * @static
 */
dwv.gui.clearFilterHtml = function()
{
    dwv.html.removeNode("filterLi");
};

// create namespace if not there
dwv.gui.filter = dwv.gui.filter || {};

/**
 * Append the threshold filter HTML to the page.
 * @method appendThresholdHtml
 * @static
 */
dwv.gui.filter.appendThresholdHtml = function()
{
    // list element
    var thresholdLi = document.createElement("li");
    thresholdLi.setAttribute("class","ui-block-c");
    thresholdLi.id = "thresholdLi";
    
    // append to tool list
    document.getElementById("toolList").appendChild(thresholdLi);
    // gui specific slider...
    dwv.gui.getSliderHtml();
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the treshold filter HTML.
 * @method clearDrawHtml
 * @static
 */
dwv.gui.filter.clearThresholdHtml = function()
{
    dwv.html.removeNode("thresholdLi");
};

/**
 * Append the sharpen filter HTML to the page.
 * @method appendSharpenHtml
 * @static
 */
dwv.gui.filter.appendSharpenHtml = function()
{
    // button
    var buttonRun = document.createElement("button");
    buttonRun.id = "runFilterButton";
    buttonRun.onclick = app.getToolBox().getSelectedTool().getSelectedFilter().run;
    buttonRun.appendChild(document.createTextNode("Apply"));

    // list element
    var sharpenLi = document.createElement("li");
    sharpenLi.id = "sharpenLi";
    sharpenLi.setAttribute("class","ui-block-c");
    sharpenLi.appendChild(buttonRun);
    
    // append to tool list
    document.getElementById("toolList").appendChild(sharpenLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the sharpen filter HTML.
 * @method clearSharpenHtml
 * @static
 */
dwv.gui.filter.clearSharpenHtml = function()
{
    dwv.html.removeNode("sharpenLi");
};

/**
 * Append the sobel filter HTML to the page.
 * @method appendSharpenHtml
 * @static
 */
dwv.gui.filter.appendSobelHtml = function()
{
    // button
    var buttonRun = document.createElement("button");
    buttonRun.id = "runFilterButton";
    buttonRun.onclick = app.getToolBox().getSelectedTool().getSelectedFilter().run;
    buttonRun.appendChild(document.createTextNode("Apply"));

    // list element
    var sobelLi = document.createElement("li");
    sobelLi.id = "sobelLi";
    sobelLi.setAttribute("class","ui-block-c");
    sobelLi.appendChild(buttonRun);
    
    // append to tool list
    document.getElementById("toolList").appendChild(sobelLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the sobel filter HTML.
 * @method clearSharpenHtml
 * @static
 */
dwv.gui.filter.clearSobelHtml = function()
{
    dwv.html.removeNode("sobelLi");
};

/**
 * Append the zoom HTML to the page.
 * @method appendZoomHtml
 * @static
 */
dwv.gui.appendZoomHtml = function()
{
    // button
    var button = document.createElement("button");
    button.id = "zoomResetButton";
    button.name = "zoomResetButton";
    button.onclick = dwv.tool.zoomReset;
    var text = document.createTextNode("Reset");
    button.appendChild(text);
    
    // list element
    var zoomLi = document.createElement("li");
    zoomLi.id = "zoomLi";
    zoomLi.setAttribute("class","ui-block-c");
    zoomLi.appendChild(button);
    
    // append to tool list
    document.getElementById("toolList").appendChild(zoomLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the zoom filter HTML.
 * @method clearZoomHtml
 * @static
 */
dwv.gui.clearZoomHtml = function()
{
    dwv.html.removeNode("zoomLi");
};

/**
 * Append the undo HTML to the page.
 * @method appendUndoHtml
 * @static
 */
dwv.gui.appendUndoHtml = function()
{
    var paragraph = document.createElement("p");  
    paragraph.appendChild(document.createTextNode("History:"));
    paragraph.appendChild(document.createElement("br"));
    
    var select = document.createElement("select");
    select.id = "history_list";
    select.name = "history_list";
    select.multiple = "multiple";
    paragraph.appendChild(select);

    // node
    var node = document.getElementById("history");
    // clear it
    while(node.hasChildNodes()) node.removeChild(node.firstChild);
    // append
    node.appendChild(paragraph);
};

/**
 * Add a command to the undo HTML.
 * @method addCommandToUndoHtml
 * @static
 * @param {String} commandName The name of the command to add.
 */
dwv.gui.addCommandToUndoHtml = function(commandName)
{
    var select = document.getElementById("history_list");
    // remove undone commands
    var count = select.length - (select.selectedIndex+1);
    if( count > 0 )
    {
        for( var i = 0; i < count; ++i)
        {
            select.remove(select.length-1);
        }
    }
    // add new option
    var option = document.createElement("option");
    option.text = commandName;
    option.value = commandName;
    select.add(option);
    // increment selected index
    select.selectedIndex++;
};

/**
 * Enable the last command of the undo HTML.
 * @method enableInUndoHtml
 * @static
 * @param {Boolean} enable Flag to enable or disable the command.
 */
dwv.gui.enableInUndoHtml = function(enable)
{
    var select = document.getElementById("history_list");
    // enable or not (order is important)
    var option;
    if( enable ) 
    {
        // increment selected index
        select.selectedIndex++;
        // enable option
        option = select.options[select.selectedIndex];
        option.disabled = false;
    }
    else 
    {
        // disable option
        option = select.options[select.selectedIndex];
        option.disabled = true;
        // decrement selected index
        select.selectedIndex--;
    }
};

