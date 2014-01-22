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
 * Handle loader change.
 * @method onChangeLoader
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeLoader = function(event)
{
    if( this.value === "file") {
        dwv.gui.displayUrlLoadHtml(false);
        dwv.gui.displayFileLoadHtml(true);
    }
    else if( this.value === "url") {
        dwv.gui.displayFileLoadHtml(false);
        dwv.gui.displayUrlLoadHtml(true);
    }
};

/**
 * Handle files change.
 * @method onChangeFiles
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeFiles = function(event)
{
    app.onChangeFiles(event);
};

/**
 * Handle URL change.
 * @method onChangeURL
 * @static
 * @param {Object} event The change event.
 */
dwv.gui.onChangeURL = function(event)
{
    app.onChangeURL(event);
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
 * Handle filter run.
 * @method onRunFilter
 * @static
 * @param {Object} event The run event.
 */
dwv.gui.onRunFilter = function(event)
{
    app.getToolBox().getSelectedTool().getSelectedFilter().run();
};

/**
 * Handle min/max slider change.
 * @method onChangeMinMax
 * @static
 * @param {Object} range The new range of the data.
 */
dwv.gui.onChangeMinMax = function(range)
{
    // seems like jquery is checking if the method exists before it 
    // is used...
    if( app.getToolBox().getSelectedTool().getSelectedFilter )
        app.getToolBox().getSelectedTool().getSelectedFilter().run(range);
};

/**
 * Refresh a HTML select.
 * @method refreshSelect
 * @static
 * @param {String} selectName The name of the HTML select to refresh.
 */
dwv.gui.refreshSelect = function(selectName)
{
    // jquery-mobile
    if( $(selectName).selectmenu ) $(selectName).selectmenu('refresh');
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
 * Append the slider HTML.
 * @method appendSliderHtml
 * @static
 */
dwv.gui.appendSliderHtml = function()
{
    if( app.isMobile() )
    {
        // default values
        var min = 0;
        var max = 1;
        
        // jquery-mobile range slider
        // minimum input
        var inputMin = document.createElement("input");
        inputMin.id = "threshold-min";
        inputMin.type = "range";
        inputMin.max = max;
        inputMin.min = min;
        inputMin.value = min;
        // maximum input
        var inputMax = document.createElement("input");
        inputMax.id = "threshold-max";
        inputMax.type = "range";
        inputMax.max = max;
        inputMax.min = min;
        inputMax.value = max;
        // slicer div
        var div = document.createElement("div");
        div.id = "threshold-div";
        div.setAttribute("data-role", "rangeslider");
        div.appendChild(inputMin);
        div.appendChild(inputMax);
        div.setAttribute("data-mini", "true");
        // append to document
        document.getElementById("thresholdLi").appendChild(div);
        // bind change
        $("#threshold-div").on("change",
                function( event ) {
                    dwv.gui.onChangeMinMax(
                        { "min":$("#threshold-min").val(),
                          "max":$("#threshold-max").val() } );
                }
            );
        // trigger creation
        $("#toolList").trigger("create");
    }
};

/**
 * Initialise the slider HTML.
 * @method initSliderHtml
 * @static
 */
dwv.gui.initSliderHtml = function()
{
    var min = app.getImage().getDataRange().min;
    var max = app.getImage().getDataRange().max;
    
    if( app.isMobile() )
    {
        // minimum input
        var inputMin = document.getElementById("threshold-min");
        inputMin.max = max;
        inputMin.min = min;
        inputMin.value = min;
        // maximum input
        var inputMax = document.getElementById("threshold-max");
        inputMax.max = max;
        inputMax.min = min;
        inputMax.value = max;
        // trigger creation
        $("#toolList").trigger("create");
    }
    else
    {
        // jquery-ui slider
        $( "#thresholdLi" ).slider({
            range: true,
            min: min,
            max: max,
            values: [ min, max ],
            slide: function( event, ui ) {
                dwv.gui.onChangeMinMax(
                        {'min':ui.values[0], 'max':ui.values[1]});
            }
        });
    }
};

/**
 * Update the progress bar.
 * @method updateProgress
 * @static
 * @param {Object} event A ProgressEvent.
 */
dwv.gui.updateProgress = function(event)
{
    // event is an ProgressEvent.
    if( event.lengthComputable )
    {
        var percent = Math.round((event.loaded / event.total) * 100);
        if( app.isMobile() )
        {
            // jquery-mobile loading
            if( percent < 100 ) {
                $.mobile.loading("show", {text: percent+"%", textVisible: true, theme: "b"} );
            }
            else if( percent === 100 ) {
                $.mobile.loading("hide");
            }
        }
        else
        {
            // jquery-ui progress bar
            if( percent <= 100 ) {
                $("#progressbar").progressbar({ value: percent });
            }
        }
    }
};

/**
 * Append the loadbox HTML to the page.
 * @method appendLoadboxHtml
 * @static
 */
dwv.gui.appendLoadboxHtml = function()
{
    // loader select
    var loaderSelector = dwv.html.createHtmlSelect("loaderSelect",dwv.io.loaders);
    loaderSelector.onchange = dwv.gui.onChangeLoader;
    
    // node
    var node = document.getElementById("loaderlist");
    // clear it
    while(node.hasChildNodes()) node.removeChild(node.firstChild);
    // append
    node.appendChild(loaderSelector);
    // trigger create event (mobile)
    $("#loaderlist").trigger("create");
};

/**
 * Append the file load HTML to the page.
 * @method appendFileLoadHtml
 * @static
 */
dwv.gui.appendFileLoadHtml = function()
{
    // input
    var fileLoadInput = document.createElement("input");
    fileLoadInput.onchange = dwv.gui.onChangeFiles;
    fileLoadInput.type = "file";
    fileLoadInput.multiple = true;
    fileLoadInput.id = "imagefiles";
    fileLoadInput.setAttribute("data-clear-btn","true");
    fileLoadInput.setAttribute("data-mini","true");

    // associated div
    var fileLoadDiv = document.createElement("div");
    fileLoadDiv.id = "imagefilesdiv";
    fileLoadDiv.style.display = "none";
    fileLoadDiv.appendChild(fileLoadInput);
    
    // node
    var node = document.getElementById("loaderlist");
    // append
    node.appendChild(fileLoadDiv);
    // trigger create event (mobile)
    $("#loaderlist").trigger("create");
};

/**
 * Display the file load HTML.
 * @method clearUrlLoadHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.displayFileLoadHtml = function(bool)
{
    // file div element
    var filediv = document.getElementById("imagefilesdiv");
    filediv.style.display = bool ? "" : "none";
};

/**
 * Append the url load HTML to the page.
 * @method appendUrlLoadHtml
 * @static
 */
dwv.gui.appendUrlLoadHtml = function()
{
    // input
    var urlLoadInput = document.createElement("input");
    urlLoadInput.onchange = dwv.gui.onChangeURL;
    urlLoadInput.type = "url";
    urlLoadInput.id = "imageurl";
    urlLoadInput.setAttribute("data-clear-btn","true");
    urlLoadInput.setAttribute("data-mini","true");

    // associated div
    var urlLoadDiv = document.createElement("div");
    urlLoadDiv.id = "imageurldiv";
    urlLoadDiv.style.display = "none";
    urlLoadDiv.appendChild(urlLoadInput);

    // node
    var node = document.getElementById("loaderlist");
    // append
    node.appendChild(urlLoadDiv);
    // trigger create event (mobile)
    $("#loaderlist").trigger("create");
};

/**
 * Display the url load HTML.
 * @method clearUrlLoadHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.displayUrlLoadHtml = function(bool)
{
    // url div element
    var urldiv = document.getElementById("imageurldiv");
    urldiv.style.display = bool ? "" : "none";
};

/**
 * Append the toolbox HTML to the page.
 * @method appendToolboxHtml
 * @static
 */
dwv.gui.appendToolboxHtml = function()
{
    // tool select
    var toolSelector = dwv.html.createHtmlSelect("toolSelect",dwv.tool.tools);
    toolSelector.onchange = dwv.gui.onChangeTool;
    
    // tool list element
    var toolLi = document.createElement("li");
    toolLi.id = "toolLi";
    toolLi.style.display = "none";
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
 * Display the toolbox HTML.
 * @method displayToolboxHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.displayToolboxHtml = function(bool)
{
    // tool list element
    var toolLi = document.getElementById("toolLi");
    toolLi.style.display = bool ? "" : "none";
};

/**
 * Initialise the toolbox HTML.
 * @method initToolboxHtml
 * @static
 */
dwv.gui.initToolboxHtml = function()
{
    // tool select: reset selected option
    var toolSelector = document.getElementById("toolSelect");
    toolSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#toolSelect");
};

/**
 * Append the window/level HTML to the page.
 * @method appendWindowLevelHtml
 * @static
 */
dwv.gui.appendWindowLevelHtml = function()
{
    // preset select
    var wlSelector = dwv.html.createHtmlSelect("presetSelect",dwv.tool.presets);
    wlSelector.onchange = dwv.gui.onChangeWindowLevelPreset;
    // colour map select
    var cmSelector = dwv.html.createHtmlSelect("colourMapSelect",dwv.tool.colourMaps);
    cmSelector.onchange = dwv.gui.onChangeColourMap;

    // preset list element
    var wlLi = document.createElement("li");
    wlLi.id = "wlLi";
    wlLi.style.display = "none";
    wlLi.appendChild(wlSelector);
    wlLi.setAttribute("class","ui-block-b");
    // color map list element
    var cmLi = document.createElement("li");
    cmLi.id = "cmLi";
    cmLi.style.display = "none";
    cmLi.appendChild(cmSelector);
    cmLi.setAttribute("class","ui-block-c");

    // node
    var node = document.getElementById("toolList");
    // apend preset
    node.appendChild(wlLi);
    // apend color map if monochrome image
    node.appendChild(cmLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the window/level HTML.
 * @method displayWindowLevelHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.displayWindowLevelHtml = function(bool)
{
    // presets list element
    var wlLi = document.getElementById("wlLi");
    wlLi.style.display = bool ? "" : "none";
    // color map list element
    var cmLi = document.getElementById("cmLi");
    cmLi.style.display = bool ? "" : "none";
};

/**
 * Initialise the window/level HTML.
 * @method initWindowLevelHtml
 * @static
 */
dwv.gui.initWindowLevelHtml = function()
{
    // create new preset select
    var wlSelector = dwv.html.createHtmlSelect("presetSelect",dwv.tool.presets);
    wlSelector.onchange = dwv.gui.onChangeWindowLevelPreset;
    wlSelector.title = "Select w/l preset.";
    
    // update html list
    var wlLi = document.getElementById("wlLi");
    dwv.html.cleanNode(wlLi);
    wlLi.appendChild(wlSelector);
    $("#toolList").trigger("create");
    
    // colour map select
    var cmSelector = document.getElementById("colourMapSelect");
    cmSelector.selectedIndex = 0;
    // special monochrome1 case
    if( app.getImage().getPhotometricInterpretation() === "MONOCHROME1" )
    {
        cmSelector.selectedIndex = 1;
    }
    dwv.gui.refreshSelect("#colourMapSelect");
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
    // colour select
    var colourSelector = dwv.html.createHtmlSelect("colourSelect",dwv.tool.colors);
    colourSelector.onchange = dwv.gui.onChangeLineColour;

    // shape list element
    var shapeLi = document.createElement("li");
    shapeLi.id = "shapeLi";
    shapeLi.style.display = "none";
    shapeLi.appendChild(shapeSelector);
    shapeLi.setAttribute("class","ui-block-c");
    // colour list element
    var colourLi = document.createElement("li");
    colourLi.id = "colourLi";
    colourLi.style.display = "none";
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
 * Display the draw HTML.
 * @method displayDrawHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.displayDrawHtml = function(bool)
{
    // color list element
    var colourLi = document.getElementById("colourLi");
    colourLi.style.display = bool ? "" : "none";
    // shape list element
    var shapeLi = document.getElementById("shapeLi");
    shapeLi.style.display = bool ? "" : "none";
};

/**
 * Initialise the draw HTML.
 * @method displayDrawHtml
 * @static
 * */
dwv.gui.initDrawHtml = function()
{
    // shape select: reset selected option
    var shapeSelector = document.getElementById("shapeSelect");
    shapeSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#shapeSelect");
    // color select: reset selected option
    var colourSelector = document.getElementById("colourSelect");
    colourSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#colourSelect");
};

/**
 * Append the color chooser HTML to the page.
 * @method appendLivewireHtml
 * @static
 */
dwv.gui.appendLivewireHtml = function()
{
    // colour select
    var colourSelector = dwv.html.createHtmlSelect("lwColourSelect",dwv.tool.colors);
    colourSelector.onchange = dwv.gui.onChangeLineColour;
    
    // colour list element
    var colourLi = document.createElement("li");
    colourLi.id = "lwColourLi";
    colourLi.style.display = "none";
    colourLi.setAttribute("class","ui-block-b");
    colourLi.appendChild(colourSelector);
    
    // node
    var node = document.getElementById("toolList");
    // apend colour
    node.appendChild(colourLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the livewire HTML.
 * @method displayLivewireHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.displayLivewireHtml = function(bool)
{
    // colour list
    var colourLi = document.getElementById("lwColourLi");
    colourLi.style.display = bool ? "" : "none";
};

/**
 * Initialise the livewire HTML.
 * @method initLivewireHtml
 * @static
 */
dwv.gui.initLivewireHtml = function()
{
    var colourSelector = document.getElementById("lwColourSelect");
    colourSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#lwColourSelect");
};

/**
 * Append the filter HTML to the page.
 * @method appendFilterHtml
 * @static
 */
dwv.gui.appendFilterHtml = function()
{
    // filter select
    var filterSelector = dwv.html.createHtmlSelect("filterSelect",dwv.tool.filters);
    filterSelector.onchange = dwv.gui.onChangeFilter;

    // filter list element
    var filterLi = document.createElement("li");
    filterLi.id = "filterLi";
    filterLi.style.display = "none";
    filterLi.setAttribute("class","ui-block-b");
    filterLi.appendChild(filterSelector);
    
    // node
    var node = document.getElementById("toolList");
    // apend filter
    node.appendChild(filterLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the filter HTML.
 * @method displayFilterHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.displayFilterHtml = function(bool)
{
    // filter lsit element
    var filterLi = document.getElementById("filterLi");
    filterLi.style.display = bool ? "" : "none";
};

/**
 * Initialise the filter HTML.
 * @method displayFilterHtml
 * @static
 */
dwv.gui.initFilterHtml = function()
{
    // filter select: reset selected options
    var filterSelector = document.getElementById("filterSelect");
    filterSelector.selectedIndex = 0;
    dwv.gui.refreshSelect("#filterSelect");
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
    // threshold list element
    var thresholdLi = document.createElement("li");
    thresholdLi.id = "thresholdLi";
    thresholdLi.setAttribute("class","ui-block-c");
    thresholdLi.style.display = "none";
    
    // node
    var node = document.getElementById("toolList");
    // append threshold
    node.appendChild(thresholdLi);
    // threshold slider
    dwv.gui.appendSliderHtml();
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Clear the treshold filter HTML.
 * @method displayThresholdHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.filter.displayThresholdHtml = function(bool)
{
    // threshold list element
    var thresholdLi = document.getElementById("thresholdLi");
    thresholdLi.style.display = bool ? "" : "none";
};

/**
 * Initialise the treshold filter HTML.
 * @method initThresholdHtml
 * @static
 */
dwv.gui.filter.initThresholdHtml = function()
{
    // threshold slider
    dwv.gui.initSliderHtml();
};

/**
 * Append the sharpen filter HTML to the page.
 * @method appendSharpenHtml
 * @static
 */
dwv.gui.filter.appendSharpenHtml = function()
{
    // sharpen button
    var buttonRun = document.createElement("button");
    buttonRun.id = "runFilterButton";
    buttonRun.onclick = dwv.gui.onRunFilter;
    buttonRun.appendChild(document.createTextNode("Apply"));

    // sharpen list element
    var sharpenLi = document.createElement("li");
    sharpenLi.id = "sharpenLi";
    sharpenLi.style.display = "none";
    sharpenLi.setAttribute("class","ui-block-c");
    sharpenLi.appendChild(buttonRun);
    
    // node
    var node = document.getElementById("toolList");
    // append threshold
    node.appendChild(sharpenLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the sharpen filter HTML.
 * @method displaySharpenHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.filter.displaySharpenHtml = function(bool)
{
    // sharpen list element
    var sharpenLi = document.getElementById("sharpenLi");
    sharpenLi.style.display = bool ? "" : "none";
};

/**
 * Append the sobel filter HTML to the page.
 * @method appendSobelHtml
 * @static
 */
dwv.gui.filter.appendSobelHtml = function()
{
    // sobel button
    var buttonRun = document.createElement("button");
    buttonRun.id = "runFilterButton";
    buttonRun.onclick = dwv.gui.onRunFilter;
    buttonRun.appendChild(document.createTextNode("Apply"));

    // sobel list element
    var sobelLi = document.createElement("li");
    sobelLi.id = "sobelLi";
    sobelLi.style.display = "none";
    sobelLi.setAttribute("class","ui-block-c");
    sobelLi.appendChild(buttonRun);
    
    // node
    var node = document.getElementById("toolList");
    // append sobel
    node.appendChild(sobelLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the sobel filter HTML.
 * @method displaySobelHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.filter.displaySobelHtml = function(bool)
{
    // sobel list element
    var sobelLi = document.getElementById("sobelLi");
    sobelLi.style.display = bool ? "" : "none";
};

/**
 * Append the zoom HTML to the page.
 * @method appendZoomHtml
 * @static
 */
dwv.gui.appendZoomHtml = function()
{
    // zoom button
    var button = document.createElement("button");
    button.id = "zoomResetButton";
    button.name = "zoomResetButton";
    button.onclick = dwv.tool.zoomReset;
    var text = document.createTextNode("Reset");
    button.appendChild(text);
    
    // zoom list element
    var zoomLi = document.createElement("li");
    zoomLi.id = "zoomLi";
    zoomLi.style.display = "none";
    zoomLi.setAttribute("class","ui-block-c");
    zoomLi.appendChild(button);
    
    // node
    var node = document.getElementById("toolList");
    // append zoom
    node.appendChild(zoomLi);
    // trigger create event (mobile)
    $("#toolList").trigger("create");
};

/**
 * Display the zoom HTML.
 * @method displayZoomHtml
 * @static
 * @param {Boolean} bool True to display, false to hide.
 */
dwv.gui.displayZoomHtml = function(bool)
{
    // zoom list element
    var zoomLi = document.getElementById("zoomLi");
    zoomLi.style.display = bool ? "" : "none";
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

/**
 * Build the help HTML.
 * @method appendHelpHtml
 * @param {Boolean} mobile Flag for mobile or not environement.
 */
dwv.gui.appendHelpHtml = function(mobile)
{
    var actionType = "mouse";
    if( mobile ) actionType = "touch";
    
    var toolHelpDiv = document.createElement("div");
    
    for ( var t in dwv.tool.tools )
    {
        var tool = dwv.tool.tools[t];
        // title
        var title = document.createElement("h3");
        title.appendChild(document.createTextNode(tool.getHelp().title));
        // doc div
        var docDiv = document.createElement("div");
        // brief
        var brief = document.createElement("p");
        brief.appendChild(document.createTextNode(tool.getHelp().brief));
        docDiv.appendChild(brief);
        // details
        if( tool.getHelp()[actionType] ) {
            var keys = Object.keys(tool.getHelp()[actionType]);
            for( var i=0; i<keys.length; ++i )
            {
                var action = tool.getHelp()[actionType][keys[i]];
                
                var img = document.createElement("img");
                img.src = "resources/"+keys[i]+".png";
                img.style.float = "left";
                img.style.margin = "0px 15px 15px 0px";
                
                var br = document.createElement("br");
                br.style.clear = "both";
                
                var para = document.createElement("p");
                para.appendChild(img);
                para.appendChild(document.createTextNode(action));
                para.appendChild(br);
                docDiv.appendChild(para);
            }
        }
        
        // different div structure for mobile or static
        if( mobile )
        {
            var toolDiv = document.createElement("div");
            toolDiv.setAttribute("data-role", "collapsible");
            toolDiv.appendChild(title);
            toolDiv.appendChild(docDiv);
            toolHelpDiv.appendChild(toolDiv);
        }
        else
        {
            toolHelpDiv.id = "accordion";
            toolHelpDiv.appendChild(title);
            toolHelpDiv.appendChild(docDiv);
        }
    }
    
    var helpNode = document.getElementById("help");

    var headPara = document.createElement("p");
    headPara.appendChild(document.createTextNode("DWV can load DICOM data " +
        "either from a local file or from an URL. All DICOM tags are available " +
        "in a searchable table, press the 'tags' or grid button. " + 
        "You can choose to display the image information overlay by pressing the " + 
        "'info' or i button. "));
    helpNode.appendChild(headPara);
    
    var toolPara = document.createElement("p");
    toolPara.appendChild(document.createTextNode("Each tool defines the possible " + 
        "user interactions. The default tool is the window/level one. " + 
        "Here are the available tools:"));
    helpNode.appendChild(toolPara);
    helpNode.appendChild(toolHelpDiv);
};
