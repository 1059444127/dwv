// Main DWV namespace.
var dwv = dwv || {};

var Kinetic = Kinetic || {};

/**
 * Main application class.
 * @class App
 * @namespace dwv
 * @constructor
 */
dwv.App = function ()
{
    // Local object
    var self = this;
    
    // Image
    var image = null;
    // Original image
    var originalImage = null;
    // Image data array
    var imageData = null;
    // Image data width
    var dataWidth = 0;
    // Image data height
    var dataHeight = 0;
    // Number of slices to load
    var nSlicesToLoad = 0;

    // Container div id
    var containerDivId = null;
    // Display window scale
    var windowScale = 1;
    // Fit display to window flag
    var fitToWindow = false;

    // View
    var view = null;
    // View controller
    var viewController = null;
    // Window/level presets
    var presets = null;
     
    // Info layer plot gui
    var plotInfo = null;
    // Info layer windowing gui
    var windowingInfo = null;
    // Info layer position gui
    var positionInfo = null;
    // Info layer color map gui
    var miniColorMap = null; 
    // flag to know if the info layer is listening on the image.
    var isInfoLayerListening = false;

    // Dicom tags gui
    var tagsGui = null;
    
    // Image layer
    var imageLayer = null;
    // Draw layers
    var drawLayers = [];
    // Draw stage
    var drawStage = null;
    
    // Toolbox
    var toolbox = null;
    // Toolbox controller
    var toolboxController = null;

    // Loadbox
    var loadbox = null;
    // UndoStack
    var undoStack = null;
    
    /** 
     * Get the version of the application.
     * @method getVersion
     * @return {String} The version of the application.
     */
    this.getVersion = function () { return "v0.9.0"; };
    
    /** 
     * Get the image.
     * @method getImage
     * @return {Image} The associated image.
     */
    this.getImage = function () { return image; };
    /** 
     * Set the view.
     * @method setImage
     * @param {Image} img The associated image.
     */
    this.setImage = function (img)
    { 
        image = img; 
        view.setImage(img);
    };
    /** 
     * Restore the original image.
     * @method restoreOriginalImage
     */
    this.restoreOriginalImage = function () 
    { 
        image = originalImage; 
        view.setImage(originalImage); 
    }; 
    /** 
     * Get the image data array.
     * @method getImageData
     * @return {Array} The image data array.
     */
    this.getImageData = function () { return imageData; };
    /** 
     * Get the number of slices to load.
     * @method getNSlicesToLoad
     * @return {Number} The number of slices to load.
     */
    this.getNSlicesToLoad = function () { return nSlicesToLoad; };

    /** 
     * Get the container div id.
     * @method getContainerDivId
     * @return {String} The div id.
     */
    this.getContainerDivId = function () { return containerDivId; };

    /** 
     * Get the view.
     * @method getView
     * @return {Image} The associated view.
     */
    this.getView = function () { return view; };
    /** 
     * Get the view controller.
     * @method getViewController
     * @return {Object} The controller.
     */
    this.getViewController = function () { return viewController; };
    /** 
     * Get the window/level presets.
     * @method getPresets
     * @return {Object} The presets.
     */
    this.getPresets = function () { return presets; };

    /** 
     * Get the image layer.
     * @method getImageLayer
     * @return {Object} The image layer.
     */
    this.getImageLayer = function () { return imageLayer; };
    /** 
     * Get the draw layer.
     * @method getDrawLayer
     * @return {Object} The draw layer.
     */
    this.getDrawLayer = function () { 
        return drawLayers[view.getCurrentPosition().k];
    };
    /** 
     * Get the draw stage.
     * @method getDrawStage
     * @return {Object} The draw layer.
     */
    this.getDrawStage = function () { return drawStage; };

    /** 
     * Get the toolbox.
     * @method getToolbox
     * @return {Object} The associated toolbox.
     */
    this.getToolbox = function () { return toolbox; };
    /** 
     * Get the toolbox controller.
     * @method getToolboxController
     * @return {Object} The controller.
     */
    this.getToolboxController = function () { return toolboxController; };

    /** 
     * Get the undo stack.
     * @method getUndoStack
     * @return {Object} The undo stack.
     */
    this.getUndoStack = function () { return undoStack; };

    /** 
     * Get the data loaders.
     * @method getLoaders
     * @return {Object} The loaders.
     */
    this.getLoaders = function () 
    {
        return {
            'file': dwv.io.File,
            'url': dwv.io.Url,
            'state': dwv.io.File
        };        
    };
    
    /**
     * Initialise the HTML for the application.
     * @method init
     */
    this.init = function ( config ) {
        containerDivId = config.containerDivId;
        // tools
        if ( config.tools && config.tools.length !== 0 ) {
            // setup the tool list
            var toolList = {};
            for ( var t = 0; t < config.tools.length; ++t ) {
                switch( config.tools[t] ) {
                case "Window/Level":
                    toolList["Window/Level"] = new dwv.tool.WindowLevel(this);
                    break;
                case "Zoom/Pan":
                    toolList["Zoom/Pan"] = new dwv.tool.ZoomAndPan(this);
                    break;
                case "Scroll":
                    toolList.Scroll = new dwv.tool.Scroll(this);
                    break;
                case "Draw":
                    if ( config.shapes !== 0 ) {
                        // setup the shape list
                        var shapeList = {};
                        for ( var s = 0; s < config.shapes.length; ++s ) {
                            switch( config.shapes[s] ) {
                            case "Line":
                                shapeList.Line = dwv.tool.LineFactory;
                                break;
                            case "Protractor":
                                shapeList.Protractor = dwv.tool.ProtractorFactory;
                                break;
                            case "Rectangle":
                                shapeList.Rectangle = dwv.tool.RectangleFactory;
                                break;
                            case "Roi":
                                shapeList.Roi = dwv.tool.RoiFactory;
                                break;
                            case "Ellipse":
                                shapeList.Ellipse = dwv.tool.EllipseFactory;
                                break;
                            }
                        }
                        toolList.Draw = new dwv.tool.Draw(this, shapeList);
                    }
                    break;
                case "Livewire":
                    toolList.Livewire = new dwv.tool.Livewire(this);
                    break;
                case "Filter":
                    if ( config.filters.length !== 0 ) {
                        // setup the filter list
                        var filterList = {};
                        for ( var f = 0; f < config.filters.length; ++f ) {
                            switch( config.filters[f] ) {
                            case "Threshold":
                                filterList.Threshold = new dwv.tool.filter.Threshold(this);
                                break;
                            case "Sharpen":
                                filterList.Sharpen = new dwv.tool.filter.Sharpen(this);
                                break;
                            case "Sobel":
                                filterList.Sobel = new dwv.tool.filter.Sobel(this);
                                break;
                            }
                        }
                        toolList.Filter = new dwv.tool.Filter(filterList, this);
                    }
                    break;
                default:
                    throw new Error("Unknown tool: '" + config.tools[t] + "'");
                }
            }
            toolbox = new dwv.tool.Toolbox(toolList, this);
            toolboxController = new dwv.ToolboxController(toolbox);
        }
        // gui
        if ( config.gui ) {
            // tools
            if ( config.gui.indexOf("tool") !== -1 && toolbox) {
                toolbox.setup();
            }
            // load
            if ( config.gui.indexOf("load") !== -1 ) {
                var fileLoadGui = new dwv.gui.FileLoad(this);
                var urlLoadGui = new dwv.gui.UrlLoad(this);
                var stateSaveGui = new dwv.gui.StateSave(this);
                loadbox = new dwv.gui.Loadbox(this, 
                    {"file": fileLoadGui, "url": urlLoadGui, "state": stateSaveGui} );
                loadbox.setup();
                fileLoadGui.setup();
                urlLoadGui.setup();
                stateSaveGui.setup();
                fileLoadGui.display(true);
                urlLoadGui.display(false);
                stateSaveGui.display(false);
            }
            // undo
            if ( config.gui.indexOf("undo") !== -1 ) {
                undoStack = new dwv.tool.UndoStack();
                undoStack.setup();
            }
            // DICOM Tags
            if ( config.gui.indexOf("tags") !== -1 ) {
                tagsGui = new dwv.gui.DicomTags();
            }
            // version number
            if ( config.gui.indexOf("version") !== -1 ) {
                dwv.gui.appendVersionHtml(this.getVersion());
            }
            // help
            if ( config.gui.indexOf("help") !== -1 ) {
                var isMobile = true;
                if ( config.isMobile ) {
                    isMobile = config.isMobile;
                }
                dwv.gui.appendHelpHtml( toolbox.getToolList(), isMobile );
            }
        }
        
        // listen to drag&drop
        var dropBoxDivId = containerDivId + "-dropBox";
        var box = document.getElementById(dropBoxDivId);
        if ( box ) {
            box.addEventListener("dragover", onDragOver);
            box.addEventListener("dragleave", onDragLeave);
            box.addEventListener("drop", onDrop);
            // initial size
            var size = dwv.gui.getWindowSize();
            var dropBoxSize = 2 * size.height / 3;
            $("#"+dropBoxDivId).height( dropBoxSize );
            $("#"+dropBoxDivId).width( dropBoxSize );
        }
        // possible load from URL
        if ( typeof config.skipLoadUrl === "undefined" ) {
            dwv.html.getUriParam(window.location.href, this.onInputURLs); 
        }
        else{
            console.log("Not loading url from adress since skipLoadUrl is defined.");
        }
        // align layers when the window is resized
        if ( config.fitToWindow ) {
            fitToWindow = true;
            window.onresize = this.onResize;
        }
    };
    
    /**
     * Reset the application.
     * @method reset
     */
    this.reset = function ()
    {
        // clear tools
        if ( toolbox ) {
            toolbox.reset();
        }
        // clear draw
        if ( drawStage ) {
            drawLayers = [];
        }
        // clear objects
        image = null;
        view = null;
        nSlicesToLoad = 0;
        // reset undo/redo
        if ( undoStack ) {
            undoStack = new dwv.tool.UndoStack();
            undoStack.initialise();
        }
    };
    
    /**
     * Reset the layout of the application.
     * @method resetLayout
     */
    this.resetLayout = function () {
        if ( imageLayer ) {
            imageLayer.resetLayout(windowScale);
            imageLayer.draw();
        }
        if ( drawStage ) {
            drawStage.offset( {'x': 0, 'y': 0} );
            drawStage.scale( {'x': windowScale, 'y': windowScale} );
            drawStage.draw();
        }
    };
    
    /**
     * Load a list of files.
     * @method loadFiles
     * @param {Array} files The list of files to load.
     */
    this.loadFiles = function (files) 
    {
        // clear variables
        this.reset();
        nSlicesToLoad = files.length;
        // create IO
        var fileIO = new dwv.io.File();
        fileIO.onload = function (data) {
            
            // TODO better test, binary?
            if ( data[0] === "{" ) {
                var state = new dwv.State();
                state.fromJSON(data);
                return;
            }
            
            var isFirst = true;
            if ( image ) {
                view.append( data.view );
                isFirst = false;
            }
            postLoadInit(data);
            if ( drawStage ) {
                // create slice draw layer
                var drawLayer = new Kinetic.Layer({
                    listening: false,
                    hitGraphEnabled: false,
                    visible: isFirst
                });
                // add to layers array
                drawLayers.push(drawLayer);
                // add the layer to the stage
                drawStage.add(drawLayer);
            }
        };
        fileIO.onerror = function (error){ handleError(error); };
        // main load (asynchronous)
        fileIO.load(files);
    };
    
    /**
     * Load a list of URLs.
     * @method loadURL
     * @param {Array} urls The list of urls to load.
     */
    this.loadURL = function (urls) 
    {
        // clear variables
        this.reset();
        nSlicesToLoad = urls.length;
        // create IO
        var urlIO = new dwv.io.Url();
        urlIO.onload = function (data) {
            var isFirst = true;
            if ( image ) {
                view.append( data.view );
                isFirst = false;
            }
            postLoadInit(data);
            if ( drawStage ) {
                // create slice draw layer
                var drawLayer = new Kinetic.Layer({
                    listening: false,
                    hitGraphEnabled: false,
                    visible: isFirst
                });
                // add to layers array
                drawLayers.push(drawLayer);
                // add the layer to the stage
                drawStage.add(drawLayer);
            }
        };
        urlIO.onerror = function (error){ handleError(error); };
        // main load (asynchronous)
        urlIO.load(urls);
    };
    
    /**
     * Fit the display to the given size. To be called once the image is loaded.
     * @method fitToSize
     */
    this.fitToSize = function (size)
    {
        // previous width
        var oldWidth = parseInt(windowScale*dataWidth, 10);
        // find new best fit
        windowScale = Math.min( (size.width / dataWidth), (size.height / dataHeight) );
        // new sizes
        var newWidth = parseInt(windowScale*dataWidth, 10);
        var newHeight = parseInt(windowScale*dataHeight, 10);
        // ratio previous/new to add to zoom
        var mul = newWidth / oldWidth;

        // resize container
        var jqDivId = "#"+containerDivId;
        $(jqDivId).width(newWidth);
        $(jqDivId).height(newHeight);
        // resize image layer
        if ( imageLayer ) {
            var iZoomX = imageLayer.getZoom().x * mul;
            var iZoomY = imageLayer.getZoom().y * mul;
            imageLayer.setWidth(newWidth);
            imageLayer.setHeight(newHeight);
            imageLayer.zoom(iZoomX, iZoomY, 0, 0);
            imageLayer.draw();
        }
        // resize draw stage
        if ( drawStage ) {
            // resize div
            var drawDivId = "#" + containerDivId + "-drawDiv";
            $(drawDivId).width(newWidth);
            $(drawDivId).height(newHeight);
            // resize stage
            var stageZomX = drawStage.scale().x * mul;
            var stageZoomY = drawStage.scale().y * mul;
            drawStage.setWidth(newWidth);
            drawStage.setHeight(newHeight);
            drawStage.scale( {x: stageZomX, y: stageZoomY} );
            drawStage.draw();
        }
    };
    
    /**
     * Toggle the display of the information layer.
     * @method toggleInfoLayerDisplay
     */
    this.toggleInfoLayerDisplay = function ()
    {
        // toggle html
        var infoDivId = containerDivId + "-infoLayer";
        dwv.html.toggleDisplay(infoDivId);
        // toggle listeners
        if ( isInfoLayerListening ) {
            removeImageInfoListeners();
        }
        else {
            addImageInfoListeners();
        }
    };
    
    /**
     * Init the Window/Level display
     */
    this.initWLDisplay = function ()
    {
        // set window/level
        var keys = Object.keys(presets);
        viewController.setWindowLevel(
            presets[keys[0]].center, 
            presets[keys[0]].width );
        // default position
        this.setCurrentPostion(0,0);
    };

    /**
     * Add layer mouse and touch listeners.
     * @method addLayerListeners
     */
    this.addLayerListeners = function (layer)
    {
        // allow pointer events
        layer.setAttribute("style", "pointer-events: auto;");
        // mouse listeners
        layer.addEventListener("mousedown", eventHandler);
        layer.addEventListener("mousemove", eventHandler);
        layer.addEventListener("mouseup", eventHandler);
        layer.addEventListener("mouseout", eventHandler);
        layer.addEventListener("mousewheel", eventHandler);
        layer.addEventListener("DOMMouseScroll", eventHandler);
        layer.addEventListener("dblclick", eventHandler);
        // touch listeners
        layer.addEventListener("touchstart", eventHandler);
        layer.addEventListener("touchmove", eventHandler);
        layer.addEventListener("touchend", eventHandler);
    };
    
    /**
     * Remove layer mouse and touch listeners.
     * @method removeLayerListeners
     */
    this.removeLayerListeners = function (layer)
    {
        // disable pointer events
        layer.setAttribute("style", "pointer-events: none;");
        // mouse listeners
        layer.removeEventListener("mousedown", eventHandler);
        layer.removeEventListener("mousemove", eventHandler);
        layer.removeEventListener("mouseup", eventHandler);
        layer.removeEventListener("mouseout", eventHandler);
        layer.removeEventListener("mousewheel", eventHandler);
        layer.removeEventListener("DOMMouseScroll", eventHandler);
        layer.removeEventListener("dblclick", eventHandler);
        // touch listeners
        layer.removeEventListener("touchstart", eventHandler);
        layer.removeEventListener("touchmove", eventHandler);
        layer.removeEventListener("touchend", eventHandler);
    };
    
    /**
     * Render the current image.
     * @method render
     */
    this.render = function ()
    {
        generateAndDrawImage();
    };
    
    /**
     * Update the window/level presets.
     * @function updatePresets
     * @param {Boolean} full If true, shows all presets.
     */
    this.updatePresets = function (full)
    {    
        // store the manual preset
        var manual = null;
        if ( presets ) {
            manual = presets.manual;
        }
        // reinitialize the presets
        presets = {};
        
        // DICOM presets
        var dicomPresets = this.getView().getWindowPresets();
        if ( dicomPresets ) {
            if ( full ) {
                for( var i = 0; i < dicomPresets.length; ++i ) {
                    presets[dicomPresets[i].name.toLowerCase()] = dicomPresets[i];
                }
            }
            // just the first one
            else {
                presets["default"] = dicomPresets[0];
            }
        }
        
        // min/max preset
        var range = this.getImage().getRescaledDataRange();
        var width = range.max - range.min;
        var center = range.min + width/2;
        presets["min/max"] = {"center": center, "width": width};
        // modality presets
        var modality = this.getImage().getMeta().Modality;
        for( var key in dwv.tool.defaultpresets[modality] ) {
            presets[key] = dwv.tool.defaultpresets[modality][key];
        }
        if ( full ) {
            for( var key2 in dwv.tool.defaultpresets[modality+"extra"] ) {
                presets[key2] = dwv.tool.defaultpresets[modality+"extra"][key2];
            }
        }
        // manual preset
        if ( manual ){
            presets.manual = manual;
        }
    };

    // Handler Methods -----------------------------------------------------------

    /**
     * Handle window/level change.
     * @method onWLChange
     * @param {Object} event The event fired when changing the window/level.
     */
    this.onWLChange = function (/*event*/)
    {         
        generateAndDrawImage();
    };

    /**
     * Handle color map change.
     * @method onColorChange
     * @param {Object} event The event fired when changing the color map.
     */
    this.onColorChange = function (/*event*/)
    {  
        generateAndDrawImage();
    };

    /**
     * Handle slice change.
     * @method onSliceChange
     * @param {Object} event The event fired when changing the slice.
     */
    this.onSliceChange = function (/*event*/)
    {   
        generateAndDrawImage();
        if ( drawStage ) {
            // hide all draw layers
            for ( var i = 0; i < drawLayers.length; ++i ) {
                drawLayers[i].visible( false );
            }
            // show current draw layer
            var currentLayer = drawLayers[view.getCurrentPosition().k];
            currentLayer.visible( true );
            currentLayer.draw();
        }
    };

    /**
     * Handle key down event.
     * - CRTL-Z: undo
     * - CRTL-Y: redo
     * Default behavior. Usually used in tools. 
     * @method onKeydown
     * @param {Object} event The key down event.
     */
    this.onKeydown = function (event)
    {
        if ( event.keyCode === 90 && event.ctrlKey ) // ctrl-z
        {
            undoStack.undo();
        }
        else if ( event.keyCode === 89 && event.ctrlKey ) // ctrl-y
        {
            undoStack.redo();
        }
    };
    
    /**
     * Handle resize.
     * Fit the display to the window. To be called once the image is loaded.
     * @method onResize
     * @param {Object} event The change event.
     */
    this.onResize = function (/*event*/)
    {
        self.fitToSize(dwv.gui.getWindowSize());
    };
    
    /**
     * Handle zoom reset.
     * @method onZoomReset
     * @param {Object} event The change event.
     */
    this.onZoomReset = function (/*event*/)
    {
        self.resetLayout();
    };

    /**
     * Handle loader change.
     * @method onChangeLoader
     * @param {Object} event The change event.
     */
    this.onChangeLoader = function (/*event*/)
    {
        loadbox.displayLoader( this.value );
    };

    /**
     * Handle change url event.
     * @method onChangeURL
     * @param {Object} event The event fired when changing the url field.
     */
    this.onChangeURL = function (event)
    {
        self.loadURL([event.target.value]);
    };

    /**
     * Handle input urls.
     * @method onInputURLs
     * @param {Array} urls The list of input urls.
     */
    this.onInputURLs = function (urls)
    {
        self.loadURL(urls);
    };

    /**
     * Handle change files event.
     * @method onChangeFiles
     * @param {Object} event The event fired when changing the file field.
     */
    this.onChangeFiles = function (event)
    {
        self.loadFiles(event.target.files);
    };

    /**
     * Handle state save event.
     * @method onStateSave
     * @param {Object} event The event fired when changing the state save field.
     */
    this.onStateSave = function (/*event*/)
    {
        var state = new dwv.State();
        state.setUrls(["a","b"]);
        
        var data = {
            "window": 500, 
            "level": 430,
            "position": self.getView().getCurrentPosition()
        };
        
        // add href to link (html5)
        var element = document.getElementById("download-state");
        element.href = "data:application/json;charset=utf8;base64," +
            window.btoa(JSON.stringify(data));
    };

    /**
     * Set the current position.
     * @method setCurrentPostion
     * @param {Number} i The column index.
     * @param {Number} j The row index.
     */
    this.setCurrentPostion = function (i,j)
    {
        viewController.setCurrentPosition(i,j);
    };

    /**
     * Handle colour map change.
     * @method onChangeColourMap
     * @param {Object} event The change event.
     */
    this.onChangeColourMap = function (/*event*/)
    {
        viewController.setColourMapFromName(this.value);
    };

    /**
     * Handle window/level preset change.
     * @method onChangeWindowLevelPreset
     * @param {Object} event The change event.
     */
    this.onChangeWindowLevelPreset = function (/*event*/)
    {
        var name = this.value;
        // check if we have it
        if ( !presets[name] ) {
            throw new Error("Unknown window level preset: '" + name + "'");
        }
        // enable it
        viewController.setWindowLevel( 
            presets[name].center, 
            presets[name].width );
    };

    /**
     * Handle tool change.
     * @method onChangeTool
     * @param {Object} event The change event.
     */
    this.onChangeTool = function (/*event*/)
    {
        toolboxController.setSelectedTool(this.value);
    };

    /**
     * Handle shape change.
     * @method onChangeShape
     * @param {Object} event The change event.
     */
    this.onChangeShape = function (/*event*/)
    {
        toolboxController.setSelectedShape(this.value);
    };

    /**
     * Handle filter change.
     * @method onChangeFilter
     * @param {Object} event The change event.
     */
    this.onChangeFilter = function (/*event*/)
    {
        toolboxController.setSelectedFilter(this.value);
    };

    /**
     * Handle filter run.
     * @method onRunFilter
     * @param {Object} event The run event.
     */
    this.onRunFilter = function (/*event*/)
    {
        toolboxController.runSelectedFilter();
    };

    /**
     * Handle line colour change.
     * @method onChangeLineColour
     * @param {Object} event The change event.
     */
    this.onChangeLineColour = function (/*event*/)
    {
        toolboxController.setLineColour(this.value);
    };

    /**
     * Handle min/max slider change.
     * @method onChangeMinMax
     * @param {Object} range The new range of the data.
     */
    this.onChangeMinMax = function (range)
    {
        toolboxController.setRange(range);
    };

    /**
     * Handle undo.
     * @method onUndo
     * @param {Object} event The associated event.
     */
    this.onUndo = function (/*event*/)
    {
        undoStack.undo();
    };

    /**
     * Handle redo.
     * @method onRedo
     * @param {Object} event The associated event.
     */
    this.onRedo = function (/*event*/)
    {
        undoStack.redo();
    };

    /**
     * Handle toggle of info layer.
     * @method onToggleInfoLayer
     * @param {Object} event The associated event.
     */
    this.onToggleInfoLayer = function (/*event*/)
    {
        self.toggleInfoLayerDisplay();
    };
    
    /**
     * Handle display reset.
     * @method onDisplayReset
     * @param {Object} event The change event.
     */
    this.onDisplayReset = function (/*event*/)
    {
        self.resetLayout();
        self.initWLDisplay();
        // update preset select
        var select = document.getElementById("presetSelect");
        select.selectedIndex = 0;
        dwv.gui.refreshSelect("#presetSelect");
    };

    // Private Methods -----------------------------------------------------------

    /**
     * Generate the image data and draw it.
     * @method generateAndDrawImage
     */
    function generateAndDrawImage()
    {         
        // generate image data from DICOM
        view.generateImageData(imageData);         
        // set the image data of the layer
        imageLayer.setImageData(imageData);
        // draw the image
        imageLayer.draw();
    }
    
    /**
     * Add image listeners.
     * @method addImageInfoListeners
     * @private
     */
    function addImageInfoListeners()
    {
        view.addEventListener("wlchange", windowingInfo.update);
        view.addEventListener("wlchange", miniColorMap.update);
        view.addEventListener("wlchange", plotInfo.update);
        view.addEventListener("colorchange", miniColorMap.update);
        view.addEventListener("positionchange", positionInfo.update);
        isInfoLayerListening = true;
    }
    
    /**
     * Remove image listeners.
     * @method removeImageInfoListeners
     * @private
     */
    function removeImageInfoListeners()
    {
        view.removeEventListener("wlchange", windowingInfo.update);
        view.removeEventListener("wlchange", miniColorMap.update);
        view.removeEventListener("wlchange", plotInfo.update);
        view.removeEventListener("colorchange", miniColorMap.update);
        view.removeEventListener("positionchange", positionInfo.update);
        isInfoLayerListening = false;
    }
    
    /**
     * General-purpose event handler. This function just determines the mouse 
     * position relative to the canvas element. It then passes it to the current tool.
     * @method eventHandler
     * @private
     * @param {Object} event The event to handle.
     */
    function eventHandler(event)
    {
        // flag not to get confused between touch and mouse
        var handled = false;
        // Store the event position relative to the image canvas
        // in an extra member of the event:
        // event._x and event._y.
        var offsets = null;
        var position = null;
        if ( event.type === "touchstart" ||
            event.type === "touchmove")
        {
            event.preventDefault();
            // event offset(s)
            offsets = dwv.html.getEventOffset(event);
            // should have at least one offset
            event._xs = offsets[0].x;
            event._ys = offsets[0].y;
            position = self.getImageLayer().displayToIndex( offsets[0] );
            event._x = parseInt( position.x, 10 );
            event._y = parseInt( position.y, 10 );
            // possible second
            if ( offsets.length === 2 ) {
                event._x1s = offsets[1].x;
                event._y1s = offsets[1].y;
                position = self.getImageLayer().displayToIndex( offsets[1] );
                event._x1 = parseInt( position.x, 10 );
                event._y1 = parseInt( position.y, 10 );
            }
            // set handle event flag
            handled = true;
        }
        else if ( event.type === "mousemove" ||
            event.type === "mousedown" ||
            event.type === "mouseup" ||
            event.type === "mouseout" ||
            event.type === "mousewheel" ||
            event.type === "dblclick" ||
            event.type === "DOMMouseScroll" )
        {
            offsets = dwv.html.getEventOffset(event);
            event._xs = offsets[0].x;
            event._ys = offsets[0].y;
            position = self.getImageLayer().displayToIndex( offsets[0] );
            event._x = parseInt( position.x, 10 );
            event._y = parseInt( position.y, 10 );
            // set handle event flag
            handled = true;
        }
        else if ( event.type === "keydown" || 
                event.type === "touchend")
        {
            handled = true;
        }
            
        // Call the event handler of the tool.
        if ( handled )
        {
            var func = self.getToolbox().getSelectedTool()[event.type];
            if ( func )
            {
                func(event);
            }
        }
    }
    
    /**
     * Handle a drag over.
     * @method onDragOver
     * @private
     * @param {Object} event The event to handle.
     */
    function onDragOver(event)
    {
        // prevent default handling
        event.stopPropagation();
        event.preventDefault();
        // update box 
        var dropBoxDivId = containerDivId + "-dropBox";
        var box = document.getElementById(dropBoxDivId);
        if ( box ) {
            box.className = 'dropBox hover';
        }
    }
    
    /**
     * Handle a drag leave.
     * @method onDragLeave
     * @private
     * @param {Object} event The event to handle.
     */
    function onDragLeave(event)
    {
        // prevent default handling
        event.stopPropagation();
        event.preventDefault();
        // update box
        var dropBoxDivId = containerDivId + "-dropBox";
        var box = document.getElementById(dropBoxDivId);
        if ( box ) {
            box.className = 'dropBox';
        }
    }

    /**
     * Handle a drop event.
     * @method onDrop
     * @private
     * @param {Object} event The event to handle.
     */
    function onDrop(event)
    {
        // prevent default handling
        event.stopPropagation();
        event.preventDefault();
        // load files
        self.loadFiles(event.dataTransfer.files);
    }

    /**
     * Handle an error: display it to the user.
     * @method handleError
     * @private
     * @param {Object} error The error to handle.
     */
    function handleError(error)
    {
        // alert window
        if ( error.name && error.message) {
            alert(error.name+": "+error.message+".");
        }
        else {
            alert("Error: "+error+".");
        }
        // log
        if ( error.stack ) {
            console.error(error.stack);
        }
    }
    
    /**
     * Create the application layers.
     * @method createLayers
     * @private
     * @param {Number} dataWidth The width of the input data.
     * @param {Number} dataHeight The height of the input data.
     */
    function createLayers(dataWidth, dataHeight)
    {
        // image layer
        imageLayer = new dwv.html.Layer(containerDivId + "-imageLayer");
        imageLayer.initialise(dataWidth, dataHeight);
        imageLayer.fillContext();
        imageLayer.setStyleDisplay(true);
        // draw layer
        var drawDivId = containerDivId + "-drawDiv";
        if ( document.getElementById(drawDivId) !== null) {
            // create stage
            drawStage = new Kinetic.Stage({
                container: drawDivId,
                width: dataWidth,
                height: dataHeight,
                listening: false
            });
            // reset style
            // (avoids a not needed vertical scrollbar) 
            drawStage.getContent().setAttribute("style", "");
        }
        // resize app
        if ( fitToWindow ) {
            self.fitToSize( dwv.gui.getWindowSize() );
        }
        else {
            self.fitToSize( { 
                'width': $('#'+containerDivId).width(), 
                'height': $('#'+containerDivId).height() } );
        }
        self.resetLayout();
    }
    
    /**
     * Post load application initialisation. To be called once the DICOM has been parsed.
     * @method postLoadInit
     * @private
     * @param {Object} data The data to display.
     */
    function postLoadInit(data)
    {
        // only initialise the first time
        if ( view ) {
            return;
        }
        
        // get the view from the loaded data
        view = data.view;
        viewController = new dwv.ViewController(view);
        // append the DICOM tags table
        if ( tagsGui ) {
            tagsGui.initialise(data.info);
        }
        // store image
        originalImage = view.getImage();
        image = originalImage;
        
        // layout
        var size = image.getGeometry().getSize();
        dataWidth = size.getNumberOfColumns();
        dataHeight = size.getNumberOfRows();
        createLayers(dataWidth, dataHeight);
        
        // get the image data from the image layer
        imageData = imageLayer.getContext().createImageData( 
                dataWidth, dataHeight);

        // image listeners
        view.addEventListener("wlchange", self.onWLChange);
        view.addEventListener("colorchange", self.onColorChange);
        view.addEventListener("slicechange", self.onSliceChange);
        
        // initialise the toolbox
        if ( toolbox ) {
            // mouse and touch listeners
            self.addLayerListeners( imageLayer.getCanvas() );
            // keydown listener
            window.addEventListener("keydown", eventHandler, true);
            
            toolbox.init();
            toolbox.display(true);
        }
        
        // stop box listening to drag (after first drag)
        var dropBoxDivId = containerDivId + "-dropBox";
        var box = document.getElementById(dropBoxDivId);
        if ( box ) {
            box.removeEventListener("dragover", onDragOver);
            box.removeEventListener("dragleave", onDragLeave);
            box.removeEventListener("drop", onDrop);
            dwv.html.removeNode(dropBoxDivId);
            // switch listening to layerContainer
            var div = document.getElementById(containerDivId);
            div.addEventListener("dragover", onDragOver);
            div.addEventListener("dragleave", onDragLeave);
            div.addEventListener("drop", onDrop);
        }

        // info layer
        var infoDivId = containerDivId + "-infoLayer";
        if ( document.getElementById(infoDivId) ) {
            windowingInfo = new dwv.info.Windowing(self);
            windowingInfo.create();
            
            positionInfo = new dwv.info.Position(self);
            positionInfo.create();
            
            miniColorMap = new dwv.info.MiniColorMap(self);
            miniColorMap.create();
            
            plotInfo = new dwv.info.Plot(self);
            plotInfo.create();
            
            addImageInfoListeners();
        }
        
        // init W/L display
        self.updatePresets(true);
        self.initWLDisplay();        
    }

};

/**
 * View controller.
 * @class ViewController
 * @namespace dwv
 * @constructor
 */
dwv.ViewController = function ( view )
{
    /**
     * Set the current position.
     * @method setWindowLevel
     * @param {Number} i The column index.
     * @param {Number} j The row index.
     */
    this.setCurrentPosition = function (i, j)
    {
        view.setCurrentPosition( { 
            "i": i, "j": j, "k": view.getCurrentPosition().k});
    };
    
    /**
     * Set the window/level.
     * @method setWindowLevel
     * @param {Number} wc The window center.
     * @param {Number} ww The window width.
     */
    this.setWindowLevel = function (wc, ww)
    {
        view.setWindowLevel(wc,ww);
    };

    /**
     * Set the colour map.
     * @method setColourMap
     * @param {Object} colourMap The colour map.
     */
    this.setColourMap = function (colourMap)
    {
        view.setColorMap(colourMap);
    };

    /**
     * Set the colour map from a name.
     * @function setColourMapFromName
     * @param {String} name The name of the colour map to set.
     */
    this.setColourMapFromName = function (name)
    {
        // check if we have it
        if ( !dwv.tool.colourMaps[name] ) {
            throw new Error("Unknown colour map: '" + name + "'");
        }
        // enable it
        this.setColourMap( dwv.tool.colourMaps[name] );
    };
    
}; // class dwv.ViewController

/**
 * Toolbox controller.
 * @class ToolboxController
 * @namespace dwv
 * @constructor
 */
dwv.ToolboxController = function (toolbox)
{
    /**
     * Set the selected tool.
     * @method setSelectedTool
     * @param {String} name The name of the tool.
     */
    this.setSelectedTool = function (name)
    {
        toolbox.setSelectedTool(name);
    };
    
    /**
     * Set the selected shape.
     * @method setSelectedShape
     * @param {String} name The name of the shape.
     */
    this.setSelectedShape = function (name)
    {
        toolbox.getSelectedTool().setShapeName(name);
    };
    
    /**
     * Set the selected filter.
     * @method setSelectedFilter
     * @param {String} name The name of the filter.
     */
    this.setSelectedFilter = function (name)
    {
        toolbox.getSelectedTool().setSelectedFilter(name);
    };
    
    /**
     * Run the selected filter.
     * @method runSelectedFilter
     */
    this.runSelectedFilter = function ()
    {
        toolbox.getSelectedTool().getSelectedFilter().run();
    };
    
    /**
     * Set the tool line color.
     * @method runFilter
     * @param {String} name The name of the color.
     */
    this.setLineColour = function (name)
    {
        toolbox.getSelectedTool().setLineColour(name);
    };
    
    /**
     * Set the tool range.
     * @method setRange
     * @param {Object} range The new range of the data.
     */
    this.setRange = function (range)
    {
        // seems like jquery is checking if the method exists before it 
        // is used...
        if ( toolbox && toolbox.getSelectedTool() &&
                toolbox.getSelectedTool().getSelectedFilter() ) {
            toolbox.getSelectedTool().getSelectedFilter().run(range);
        }
    };
    
}; // class dwv.ToolboxController
;/** 
 * DICOM module.
 * @module dicom
 */
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};

/**
 * Data reader.
 * @class DataReader
 * @namespace dwv.dicom
 * @constructor
 * @param {Array} buffer The input array buffer.
 * @param {Boolean} isLittleEndian Flag to tell if the data is little or big endian.
 */
dwv.dicom.DataReader = function(buffer, isLittleEndian)
{
    /**
     * The main data view.
     * @property view
     * @private
     * @type DataView
     */
    var view = new DataView(buffer);
    // Set endian flag if not defined.
    if(typeof(isLittleEndian)==='undefined') {
        isLittleEndian = true;
    }
    
    /**
     * Read Uint8 (1 byte) data.
     * @method readUint8
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Number} The read data.
     */
    this.readUint8 = function(byteOffset) {
        return view.getUint8(byteOffset, isLittleEndian);
    };
    /**
     * Read Uint16 (2 bytes) data.
     * @method readUint16
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Number} The read data.
     */
    this.readUint16 = function(byteOffset) {
        return view.getUint16(byteOffset, isLittleEndian);
    };
    /**
     * Read Uint32 (4 bytes) data.
     * @method readUint32
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Number} The read data.
     */
    this.readUint32 = function(byteOffset) {
        return view.getUint32(byteOffset, isLittleEndian);
    };
    /**
     * Read Float32 (8 bytes) data.
     * @method readFloat32
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Number} The read data.
     */
    this.readFloat32 = function(byteOffset) {
        return view.getFloat32(byteOffset, isLittleEndian);
    };
    /**
     * Read Uint data of nBytes size.
     * @method readNumber
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} nBytes The number of bytes to read.
     * @return {Number} The read data.
     */
    this.readNumber = function(byteOffset, nBytes) {
        if( nBytes === 1 ) {
            return this.readUint8(byteOffset, isLittleEndian);
        }
        else if( nBytes === 2 ) {
            return this.readUint16(byteOffset, isLittleEndian);
        }
        else if( nBytes === 4 ) {
            return this.readUint32(byteOffset, isLittleEndian);
        }
        else if( nBytes === 8 ) {
            return this.readFloat32(byteOffset, isLittleEndian);
        }
        else { 
            console.warn("Non number: '"+this.readString(byteOffset, nBytes)+"' of "+nBytes+" bytes.");
            return Number.NaN;
        }
    };
    /**
     * Read Uint8 array.
     * @method readUint8Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint8Array = function(byteOffset, size) {
        var data = new Uint8Array(size);
        var index = 0;
        for(var i=byteOffset; i<byteOffset + size; ++i) {     
            data[index++] = this.readUint8(i);
        }
        return data;
    };
    /**
     * Read Uint16 array.
     * @method readUint16Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint16Array = function(byteOffset, size) {
        var data = new Uint16Array(size/2);
        var index = 0;
        for(var i=byteOffset; i<byteOffset + size; i+=2) {     
            data[index++] = this.readUint16(i);
        }
        return data;
    };
    /**
     * Read data as an hexadecimal string.
     * @method readHex
     * @param {Number} byteOffset The offset to start reading from.
     * @return {Array} The read data.
     */
    this.readHex = function(byteOffset) {
        // read and convert to hex string
        var str = this.readUint16(byteOffset).toString(16);
        // return padded
        return "0x0000".substr(0, 6 - str.length) + str.toUpperCase();
    };
    /**
     * Read data as a string.
     * @method readString
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} nChars The number of characters to read.
     * @return {String} The read data.
     */
    this.readString = function(byteOffset, nChars) {
        var result = "";
        for(var i=byteOffset; i<byteOffset + nChars; ++i){
            result += String.fromCharCode( this.readUint8(i) );
        }
        return result;
    };
};

/**
 * Tell if a given syntax is a JPEG one.
 * @method isJpegTransferSyntax
 * @param {String} The transfer syntax to test.
 * @returns {Boolean} True if a jpeg syntax.
 */
dwv.dicom.isJpegTransferSyntax = function(syntax)
{
    return syntax.match(/1.2.840.10008.1.2.4.5/) !== null ||
        syntax.match(/1.2.840.10008.1.2.4.6/) !== null||
        syntax.match(/1.2.840.10008.1.2.4.7/) !== null;
};

/**
 * Tell if a given syntax is a JPEG-LS one.
 * @method isJpeglsTransferSyntax
 * @param {String} The transfer syntax to test.
 * @returns {Boolean} True if a jpeg-ls syntax.
 */
dwv.dicom.isJpeglsTransferSyntax = function(syntax)
{
    return syntax.match(/1.2.840.10008.1.2.4.8/) !== null;
};

/**
 * Tell if a given syntax is a JPEG 2000 one.
 * @method isJpeg2000TransferSyntax
 * @param {String} The transfer syntax to test.
 * @returns {Boolean} True if a jpeg 2000 syntax.
 */
dwv.dicom.isJpeg2000TransferSyntax = function(syntax)
{
    return syntax.match(/1.2.840.10008.1.2.4.9/) !== null;
};

/**
 * DicomParser class.
 * @class DicomParser
 * @namespace dwv.dicom
 * @constructor
 */
dwv.dicom.DicomParser = function()
{
    /**
     * The list of DICOM elements.
     * @property dicomElements
     * @type Array
     */
    this.dicomElements = {};
    /**
     * The number of DICOM Items.
     * @property numberOfItems
     * @type Number
     */
    this.numberOfItems = 0;
    /**
     * The pixel buffer.
     * @property pixelBuffer
     * @type Array
     */
    this.pixelBuffer = [];
};

/**
 * Get the DICOM data elements.
 * @method getDicomElements
 * @returns {Object} The DICOM elements.
 */
dwv.dicom.DicomParser.prototype.getDicomElements = function()
{
    return this.dicomElements;
};

/**
 * Get the DICOM data pixel buffer.
 * @method getPixelBuffer
 * @returns {Array} The pixel buffer.
 */
dwv.dicom.DicomParser.prototype.getPixelBuffer = function()
{
    return this.pixelBuffer;
};

/**
 * Append a DICOM element to the dicomElements member object.
 * Allows for easy retrieval of DICOM tag values from the tag name.
 * If tags have same name (for the 'unknown' and private tags cases), a number is appended
 * making the name unique.
 * @method appendDicomElement
 * @param {Object} element The element to add.
 */
dwv.dicom.DicomParser.prototype.appendDicomElement = function( element )
{
    // find a good tag name
    var name = element.name;
    // count the number of items
    if( name === "Item" ) {
        ++this.numberOfItems;
    }
    var count = 1;
    while( this.dicomElements[name] ) {
        name = element.name + (count++).toString();
    }
    // store it
    this.dicomElements[name] = { 
        "group": element.group, 
        "element": element.element,
        "vr": element.vr,
        "vl": element.vl,
        "value": element.value 
    };
};

/**
 * Read a DICOM tag.
 * @method readTag
 * @param reader The raw data reader.
 * @param offset The offset where to start to read.
 * @returns An object containing the tags 'group', 'element' and 'name'.
 */
dwv.dicom.DicomParser.prototype.readTag = function(reader, offset)
{
    // group
    var group = reader.readHex(offset);
    // element
    var element = reader.readHex(offset+2);
    // name
    var name = "dwv::unknown";
    if( dwv.dicom.dictionary[group] ) {
        if( dwv.dicom.dictionary[group][element] ) {
            name = dwv.dicom.dictionary[group][element][2];
        }
    }
    // return
    return {'group': group, 'element': element, 'name': name};
};

/**
 * Read a DICOM data element.
 * @method readDataElement
 * @param reader The raw data reader.
 * @param offset The offset where to start to read.
 * @param implicit Is the DICOM VR implicit?
 * @returns {Object} An object containing the element 'tag', 'vl', 'vr', 'data' and 'offset'.
 */
dwv.dicom.DicomParser.prototype.readDataElement = function(reader, offset, implicit)
{
    // tag: group, element
    var tag = this.readTag(reader, offset);
    var tagOffset = 4;
    
    var vr; // Value Representation (VR)
    var vl; // Value Length (VL)
    var vrOffset = 0; // byte size of VR
    var vlOffset = 0; // byte size of VL
    
    // (private) Item group case
    if( tag.group === "0xFFFE" ) {
        vr = "N/A";
        vrOffset = 0;
        vl = reader.readUint32( offset+tagOffset );
        vlOffset = 4;
    }
    // non Item case
    else {
        // implicit VR?
        if(implicit) {
            vr = "UN";
            if( dwv.dicom.dictionary[tag.group] ) {
                if( dwv.dicom.dictionary[tag.group][tag.element] ) {
                    vr = dwv.dicom.dictionary[tag.group][tag.element][0];
                }
            }
            vrOffset = 0;
            vl = reader.readUint32( offset+tagOffset+vrOffset );
            vlOffset = 4;
        }
        else {
            vr = reader.readString( offset+tagOffset, 2 );
            vrOffset = 2;
            // long representations
            if(vr === "OB" || vr === "OF" || vr === "SQ" || vr === "OW" || vr === "UN") {
                vl = reader.readUint32( offset+tagOffset+vrOffset+2 );
                vlOffset = 6;
            }
            // short representation
            else {
                vl = reader.readUint16( offset+tagOffset+vrOffset );
                vlOffset = 2;
            }
        }
    }
    
    // check the value of VL
    if( vl === 0xffffffff ) {
        vl = 0;
    }
    
    
    // data
    var data;
    var dataOffset = offset+tagOffset+vrOffset+vlOffset;
    if( vr === "US" || vr === "UL")
    {
        var num = reader.readNumber( dataOffset, vl );
        if ( isNaN(num) ) {
            console.warn("Not a number returned for tag: "+tag.name);
        }
        data = [num];
    }
    else if( vr === "OB" || vr === "N/A")
    {
        data = reader.readUint8Array( dataOffset, vl );
    }
    else if( vr === "OX" || vr === "OW" )
    {
        if ( vr === "OX" ) {
            console.warn("OX value representation for tag: "+tag.name+".");
        }
        if ( typeof(this.dicomElements.BitsAllocated) !== 'undefined' &&
                this.dicomElements.BitsAllocated.value[0] === 8 ) {
            data = reader.readUint8Array( dataOffset, vl );
        }
        else {
            data = reader.readUint16Array( dataOffset, vl );
        }
    }
    else
    {
        data = reader.readString( dataOffset, vl);
        data = data.split("\\");                
    }    

    // total element offset
    var elementOffset = tagOffset + vrOffset + vlOffset + vl;
    
    // return
    return { 
        'tag': tag, 
        'vr': vr, 
        'vl': vl, 
        'data': data,
        'offset': elementOffset
    };    
};

/**
 * Parse the complete DICOM file (given as input to the class).
 * Fills in the member object 'dicomElements'.
 * @method parse
 * @param buffer The input array buffer.
 */
dwv.dicom.DicomParser.prototype.parse = function(buffer)
{
    var offset = 0;
    var implicit = false;
    var jpeg = false;
    var jpeg2000 = false;
    // default readers
    var metaReader = new dwv.dicom.DataReader(buffer);
    var dataReader = new dwv.dicom.DataReader(buffer);

    // 128 -> 132: magic word
    offset = 128;
    var magicword = metaReader.readString( offset, 4 );
    if(magicword !== "DICM")
    {
        throw new Error("Not a valid DICOM file (no magic DICM word found)");
    }
    offset += 4;
    
    // 0x0002, 0x0000: MetaElementGroupLength
    var dataElement = this.readDataElement(metaReader, offset);
    var metaLength = parseInt(dataElement.data, 10);
    offset += dataElement.offset;
    
    // meta elements
    var metaStart = offset;
    var metaEnd = metaStart + metaLength;
    var i = metaStart;
    while( i < metaEnd ) 
    {
        // get the data element
        dataElement = this.readDataElement(metaReader, i, false);
        // check the transfer syntax
        if( dataElement.tag.name === "TransferSyntaxUID" ) {
            var syntax = dwv.utils.cleanString(dataElement.data[0]);
            
            // Implicit VR - Little Endian
            if( syntax === "1.2.840.10008.1.2" ) {
                implicit = true;
            }
            // Explicit VR - Little Endian (default): 1.2.840.10008.1.2.1 
            // Deflated Explicit VR - Little Endian
            else if( syntax === "1.2.840.10008.1.2.1.99" ) {
                throw new Error("Unsupported DICOM transfer syntax (Deflated Explicit VR): "+syntax);
            }
            // Explicit VR - Big Endian
            else if( syntax === "1.2.840.10008.1.2.2" ) {
                dataReader = new dwv.dicom.DataReader(buffer,false);
            }
            // JPEG
            else if( dwv.dicom.isJpegTransferSyntax(syntax) ) {
                jpeg = true;
                //console.log("JPEG compressed DICOM data: " + syntax);
                throw new Error("Unsupported DICOM transfer syntax (JPEG): "+syntax);
            }
            // JPEG-LS
            else if( dwv.dicom.isJpeglsTransferSyntax(syntax) ) {
                //console.log("JPEG-LS compressed DICOM data: " + syntax);
                throw new Error("Unsupported DICOM transfer syntax (JPEG-LS): "+syntax);
            }
            // JPEG 2000
            else if( dwv.dicom.isJpeg2000TransferSyntax(syntax) ) {
                console.log("JPEG 2000 compressed DICOM data: " + syntax);
                jpeg2000 = true;
            }
            // MPEG2 Image Compression
            else if( syntax === "1.2.840.10008.1.2.4.100" ) {
                throw new Error("Unsupported DICOM transfer syntax (MPEG2): "+syntax);
            }
            // RLE (lossless)
            else if( syntax === "1.2.840.10008.1.2.5" ) {
                throw new Error("Unsupported DICOM transfer syntax (RLE): "+syntax);
            }
        }            
        // store the data element
        this.appendDicomElement( { 
            'name': dataElement.tag.name,
            'group': dataElement.tag.group, 
            'vr' : dataElement.vr, 
            'vl' : dataElement.vl, 
            'element': dataElement.tag.element,
            'value': dataElement.data 
        });
        // increment index
        i += dataElement.offset;
    }
    
    var startedPixelItems = false;
    
    var tagName = "";
    // DICOM data elements
    while( i < buffer.byteLength ) 
    {
        // get the data element
        try
        {
            dataElement = this.readDataElement(dataReader, i, implicit);
        }
        catch(err)
        {
            console.warn("Problem reading at " + i + " / " + buffer.byteLength +
                ", after " + tagName + ".\n" + err);
        }
        tagName = dataElement.tag.name;
        // store pixel data from multiple items
        if( startedPixelItems ) {
            if( tagName === "Item" ) {
                if( dataElement.data.length === 4 ) {
                    console.log("Skipping Basic Offset Table.");
                }
                else if( dataElement.data.length !== 0 ) {
                    console.log("Concatenating multiple pixel data items, length: "+dataElement.data.length);
                    // concat does not work on typed arrays
                    //this.pixelBuffer = this.pixelBuffer.concat( dataElement.data );
                    // manual concat...
                    var size = dataElement.data.length + this.pixelBuffer.length;
                    var newBuffer = new Uint16Array(size);
                    newBuffer.set( this.pixelBuffer, 0 );
                    newBuffer.set( dataElement.data, this.pixelBuffer.length );
                    this.pixelBuffer = newBuffer;
                }
            }
            else if( tagName === "SequenceDelimitationItem" ) {
                startedPixelItems = false;
            }
            else {
                throw new Error("Unexpected tag in encapsulated pixel data: "+dataElement.tag.name);
            }
        }
        // check the pixel data tag
        if( tagName === "PixelData") {
            if( dataElement.data.length !== 0 ) {
                this.pixelBuffer = dataElement.data;
            }
            else {
                startedPixelItems = true;
            }
        }
        // store the data element
        this.appendDicomElement( {
            'name': tagName,
            'group' : dataElement.tag.group, 
            'vr' : dataElement.vr, 
            'vl' : dataElement.vl, 
            'element': dataElement.tag.element,
            'value': dataElement.data 
        });
        // increment index
        i += dataElement.offset;
    }
    
    // uncompress data
    if( jpeg ) {
        // using jpgjs from https://github.com/notmasteryet/jpgjs
        // -> error with ffc3 and ffc1 jpeg jfif marker
        /*var j = new JpegImage();
        j.parse(this.pixelBuffer);
        var d = 0;
        j.copyToImageData(d);
        this.pixelBuffer = d.data;*/
    }
    else if( jpeg2000 ) {
        // decompress pixel buffer into Uint8 image
        var uint8Image = null;
        try {
            uint8Image = openjpeg(this.pixelBuffer, "j2k");
        } catch(error) {
            throw new Error("Cannot decode JPEG 2000 ([" +error.name + "] " + error.message + ")");
        }
        this.pixelBuffer = uint8Image.data;
    }
};
;/** 
 * DICOM module.
 * @module dicom
 */
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};

/**
 * DICOM tag dictionary.
 * @namespace dwv.dicom
 */
dwv.dicom.dictionary = {
    '0x0000': {
        '0x0000': ['UL', '1', 'GroupLength'],
        '0x0001': ['UL', '1', 'CommandLengthToEnd'],
        '0x0002': ['UI', '1', 'AffectedSOPClassUID'],
        '0x0003': ['UI', '1', 'RequestedSOPClassUID'],
        '0x0010': ['CS', '1', 'CommandRecognitionCode'],
        '0x0100': ['US', '1', 'CommandField'],
        '0x0110': ['US', '1', 'MessageID'],
        '0x0120': ['US', '1', 'MessageIDBeingRespondedTo'],
        '0x0200': ['AE', '1', 'Initiator'], 
        '0x0300': ['AE', '1', 'Receiver'],
        '0x0400': ['AE', '1', 'FindLocation'],
        '0x0600': ['AE', '1', 'MoveDestination'],
        '0x0700': ['US', '1', 'Priority'],
        '0x0800': ['US', '1', 'DataSetType'],
        '0x0850': ['US', '1', 'NumberOfMatches'],
        '0x0860': ['US', '1', 'ResponseSequenceNumber'],
        '0x0900': ['US', '1', 'Status'],
        '0x0901': ['AT', '1-n', 'OffendingElement'],
        '0x0902': ['LO', '1', 'ErrorComment'],
        '0x0903': ['US', '1', 'ErrorID'],
        '0x0904': ['OT', '1-n', 'ErrorInformation'],
        '0x1000': ['UI', '1', 'AffectedSOPInstanceUID'],
        '0x1001': ['UI', '1', 'RequestedSOPInstanceUID'],
        '0x1002': ['US', '1', 'EventTypeID'],
        '0x1003': ['OT', '1-n', 'EventInformation'],
        '0x1005': ['AT', '1-n', 'AttributeIdentifierList'],
        '0x1007': ['AT', '1-n', 'ModificationList'],
        '0x1008': ['US', '1', 'ActionTypeID'],
        '0x1009': ['OT', '1-n', 'ActionInformation'],
        '0x1013': ['UI', '1-n', 'SuccessfulSOPInstanceUIDList'],
        '0x1014': ['UI', '1-n', 'FailedSOPInstanceUIDList'],
        '0x1015': ['UI', '1-n', 'WarningSOPInstanceUIDList'],
        '0x1020': ['US', '1', 'NumberOfRemainingSuboperations'],
        '0x1021': ['US', '1', 'NumberOfCompletedSuboperations'],
        '0x1022': ['US', '1', 'NumberOfFailedSuboperations'],
        '0x1023': ['US', '1', 'NumberOfWarningSuboperations'],
        '0x1030': ['AE', '1', 'MoveOriginatorApplicationEntityTitle'],
        '0x1031': ['US', '1', 'MoveOriginatorMessageID'],
        '0x4000': ['AT', '1', 'DialogReceiver'],
        '0x4010': ['AT', '1', 'TerminalType'],
        '0x5010': ['SH', '1', 'MessageSetID'],
        '0x5020': ['SH', '1', 'EndMessageSet'],
        '0x5110': ['AT', '1', 'DisplayFormat'],
        '0x5120': ['AT', '1', 'PagePositionID'],
        '0x5130': ['CS', '1', 'TextFormatID'],
        '0x5140': ['CS', '1', 'NormalReverse'],
        '0x5150': ['CS', '1', 'AddGrayScale'],
        '0x5160': ['CS', '1', 'Borders'],
        '0x5170': ['IS', '1', 'Copies'],
        '0x5180': ['CS', '1', 'OldMagnificationType'],
        '0x5190': ['CS', '1', 'Erase'],
        '0x51A0': ['CS', '1', 'Print'],
        '0x51B0': ['US', '1-n', 'Overlays'],
    },
    '0x0002': {
        '0x0000': ['UL', '1', 'MetaElementGroupLength'],
        '0x0001': ['OB', '1', 'FileMetaInformationVersion'],
        '0x0002': ['UI', '1', 'MediaStorageSOPClassUID'],
        '0x0003': ['UI', '1', 'MediaStorageSOPInstanceUID'],
        '0x0010': ['UI', '1', 'TransferSyntaxUID'],
        '0x0012': ['UI', '1', 'ImplementationClassUID'],
        '0x0013': ['SH', '1', 'ImplementationVersionName'],
        '0x0016': ['AE', '1', 'SourceApplicationEntityTitle'],
        '0x0100': ['UI', '1', 'PrivateInformationCreatorUID'],
        '0x0102': ['OB', '1', 'PrivateInformation'],
    },
    '0x0004': {
        '0x0000': ['UL', '1', 'FileSetGroupLength'],
        '0x1130': ['CS', '1', 'FileSetID'],
        '0x1141': ['CS', '8', 'FileSetDescriptorFileID'],
        '0x1142': ['CS', '1', 'FileSetCharacterSet'],
        '0x1200': ['UL', '1', 'RootDirectoryFirstRecord'],
        '0x1202': ['UL', '1', 'RootDirectoryLastRecord'],
        '0x1212': ['US', '1', 'FileSetConsistencyFlag'],
        '0x1220': ['SQ', '1', 'DirectoryRecordSequence'],
        '0x1400': ['UL', '1', 'NextDirectoryRecordOffset'],
        '0x1410': ['US', '1', 'RecordInUseFlag'],
        '0x1420': ['UL', '1', 'LowerLevelDirectoryOffset'],
        '0x1430': ['CS', '1', 'DirectoryRecordType'],
        '0x1432': ['UI', '1', 'PrivateRecordUID'],
        '0x1500': ['CS', '8', 'ReferencedFileID'],
        '0x1504': ['UL', '1', 'DirectoryRecordOffset'],
        '0x1510': ['UI', '1', 'ReferencedSOPClassUIDInFile'],
        '0x1511': ['UI', '1', 'ReferencedSOPInstanceUIDInFile'],
        '0x1512': ['UI', '1', 'ReferencedTransferSyntaxUIDInFile'],
        '0x1600': ['UL', '1', 'NumberOfReferences'],
    },
    '0x0008': {
        '0x0000': ['UL', '1', 'IdentifyingGroupLength'],
        '0x0001': ['UL', '1', 'LengthToEnd'],
        '0x0005': ['CS', '1', 'SpecificCharacterSet'],
        '0x0008': ['CS', '1-n', 'ImageType'],
        '0x000A': ['US', '1', 'SequenceItemNumber'],
        '0x0010': ['CS', '1', 'RecognitionCode'],
        '0x0012': ['DA', '1', 'InstanceCreationDate'],
        '0x0013': ['TM', '1', 'InstanceCreationTime'],
        '0x0014': ['UI', '1', 'InstanceCreatorUID'],
        '0x0016': ['UI', '1', 'SOPClassUID'],
        '0x0018': ['UI', '1', 'SOPInstanceUID'],
        '0x0020': ['DA', '1', 'StudyDate'],
        '0x0021': ['DA', '1', 'SeriesDate'],
        '0x0022': ['DA', '1', 'AcquisitionDate'],
        '0x0023': ['DA', '1', 'ImageDate'],
        /* '0x0023': ['DA','1','ContentDate'], */
        '0x0024': ['DA', '1', 'OverlayDate'],
        '0x0025': ['DA', '1', 'CurveDate'],
        '0x002A': ['DT', '1', 'AcquisitionDatetime'],
        '0x0030': ['TM', '1', 'StudyTime'],
        '0x0031': ['TM', '1', 'SeriesTime'],
        '0x0032': ['TM', '1', 'AcquisitionTime'],
        '0x0033': ['TM', '1', 'ImageTime'],
        '0x0034': ['TM', '1', 'OverlayTime'],
        '0x0035': ['TM', '1', 'CurveTime'],
        '0x0040': ['US', '1', 'OldDataSetType'],
        '0x0041': ['LT', '1', 'OldDataSetSubtype'],
        '0x0042': ['CS', '1', 'NuclearMedicineSeriesType'],
        '0x0050': ['SH', '1', 'AccessionNumber'],
        '0x0052': ['CS', '1', 'QueryRetrieveLevel'],
        '0x0054': ['AE', '1-n', 'RetrieveAETitle'],
        '0x0058': ['UI', '1-n', 'DataSetFailedSOPInstanceUIDList'],
        '0x0060': ['CS', '1', 'Modality'],
        '0x0061': ['CS', '1-n', 'ModalitiesInStudy'],
        '0x0064': ['CS', '1', 'ConversionType'],
        '0x0068': ['CS', '1', 'PresentationIntentType'],
        '0x0070': ['LO', '1', 'Manufacturer'],
        '0x0080': ['LO', '1', 'InstitutionName'],
        '0x0081': ['ST', '1', 'InstitutionAddress'],
        '0x0082': ['SQ', '1', 'InstitutionCodeSequence'],
        '0x0090': ['PN', '1', 'ReferringPhysicianName'],
        '0x0092': ['ST', '1', 'ReferringPhysicianAddress'],
        '0x0094': ['SH', '1-n', 'ReferringPhysicianTelephoneNumber'],
        '0x0100': ['SH', '1', 'CodeValue'],
        '0x0102': ['SH', '1', 'CodingSchemeDesignator'],
        '0x0103': ['SH', '1', 'CodingSchemeVersion'],
        '0x0104': ['LO', '1', 'CodeMeaning'],
        '0x0105': ['CS', '1', 'MappingResource'],
        '0x0106': ['DT', '1', 'ContextGroupVersion'],
        '0x0107': ['DT', '1', 'ContextGroupLocalVersion'],
        '0x010B': ['CS', '1', 'CodeSetExtensionFlag'],
        '0x010C': ['UI', '1', 'PrivateCodingSchemeCreatorUID'],
        '0x010D': ['UI', '1', 'CodeSetExtensionCreatorUID'],
        '0x010F': ['CS', '1', 'ContextIdentifier'],
        '0x0201': ['SH', '1', 'TimezoneOffsetFromUTC'],
        '0x1000': ['AE', '1', 'NetworkID'],
        '0x1010': ['SH', '1', 'StationName'],
        '0x1030': ['LO', '1', 'StudyDescription'],
        '0x1032': ['SQ', '1', 'ProcedureCodeSequence'],
        '0x103E': ['LO', '1', 'SeriesDescription'],
        '0x1040': ['LO', '1', 'InstitutionalDepartmentName'],
        '0x1048': ['PN', '1-n', 'PhysicianOfRecord'],
        '0x1050': ['PN', '1-n', 'PerformingPhysicianName'],
        '0x1060': ['PN', '1-n', 'PhysicianReadingStudy'],
        '0x1070': ['PN', '1-n', 'OperatorName'],
        '0x1080': ['LO', '1-n', 'AdmittingDiagnosisDescription'],
        '0x1084': ['SQ', '1', 'AdmittingDiagnosisCodeSequence'],
        '0x1090': ['LO', '1', 'ManufacturerModelName'],
        '0x1100': ['SQ', '1', 'ReferencedResultsSequence'],
        '0x1110': ['SQ', '1', 'ReferencedStudySequence'],
        '0x1111': ['SQ', '1', 'ReferencedStudyComponentSequence'],
        '0x1115': ['SQ', '1', 'ReferencedSeriesSequence'],
        '0x1120': ['SQ', '1', 'ReferencedPatientSequence'],
        '0x1125': ['SQ', '1', 'ReferencedVisitSequence'],
        '0x1130': ['SQ', '1', 'ReferencedOverlaySequence'],
        '0x1140': ['SQ', '1', 'ReferencedImageSequence'],
        '0x1145': ['SQ', '1', 'ReferencedCurveSequence'],
        '0x114A': ['SQ', '1', 'ReferencedInstanceSequence'],
        '0x114B': ['LO', '1', 'ReferenceDescription'],
        '0x1150': ['UI', '1', 'ReferencedSOPClassUID'],
        '0x1155': ['UI', '1', 'ReferencedSOPInstanceUID'],
        '0x115A': ['UI', '1-n', 'SOPClassesSupported'],
        '0x1160': ['IS', '1', 'ReferencedFrameNumber'],
        '0x1195': ['UI', '1', 'TransactionUID'],
        '0x1197': ['US', '1', 'FailureReason'],
        '0x1198': ['SQ', '1', 'FailedSOPSequence'],
        '0x1199': ['SQ', '1', 'ReferencedSOPSequence'],
        '0x2110': ['CS', '1', 'LossyImageCompression'],
        '0x2111': ['ST', '1', 'DerivationDescription'],
        '0x2112': ['SQ', '1', 'SourceImageSequence'],
        '0x2120': ['SH', '1', 'StageName'],
        '0x2122': ['IS', '1', 'StageNumber'],
        '0x2124': ['IS', '1', 'NumberOfStages'],
        '0x2128': ['IS', '1', 'ViewNumber'],
        '0x2129': ['IS', '1', 'NumberOfEventTimers'],
        '0x212A': ['IS', '1', 'NumberOfViewsInStage'],
        '0x2130': ['DS', '1-n', 'EventElapsedTime'],
        '0x2132': ['LO', '1-n', 'EventTimerName'],
        '0x2142': ['IS', '1', 'StartTrim'],
        '0x2143': ['IS', '1', 'StopTrim'],
        '0x2144': ['IS', '1', 'RecommendedDisplayFrameRate'],
        '0x2200': ['CS', '1', 'TransducerPosition'],
        '0x2204': ['CS', '1', 'TransducerOrientation'],
        '0x2208': ['CS', '1', 'AnatomicStructure'],
        '0x2218': ['SQ', '1', 'AnatomicRegionSequence'],
        '0x2220': ['SQ', '1', 'AnatomicRegionModifierSequence'],
        '0x2228': ['SQ', '1', 'PrimaryAnatomicStructureSequence'],
        '0x2229': ['SQ', '1', 'AnatomicStructureSpaceOrRegionSequence'],
        '0x2230': ['SQ', '1', 'PrimaryAnatomicStructureModifierSequence'],
        '0x2240': ['SQ', '1', 'TransducerPositionSequence'],
        '0x2242': ['SQ', '1', 'TransducerPositionModifierSequence'],
        '0x2244': ['SQ', '1', 'TransducerOrientationSequence'],
        '0x2246': ['SQ', '1', 'TransducerOrientationModifierSequence'],
        '0x4000': ['LT', '1-n', 'IdentifyingComments'],
    },
    '0x0010': {
        '0x0000': ['UL', '1', 'PatientGroupLength'],
        '0x0010': ['PN', '1', 'PatientName'],
        '0x0020': ['LO', '1', 'PatientID'],
        '0x0021': ['LO', '1', 'IssuerOfPatientID'],
        '0x0030': ['DA', '1', 'PatientBirthDate'],
        '0x0032': ['TM', '1', 'PatientBirthTime'],
        '0x0040': ['CS', '1', 'PatientSex'],
        '0x0050': ['SQ', '1', 'PatientInsurancePlanCodeSequence'],
        '0x1000': ['LO', '1-n', 'OtherPatientID'],
        '0x1001': ['PN', '1-n', 'OtherPatientName'],
        '0x1005': ['PN', '1', 'PatientBirthName'],
        '0x1010': ['AS', '1', 'PatientAge'],
        '0x1020': ['DS', '1', 'PatientSize'],
        '0x1030': ['DS', '1', 'PatientWeight'],
        '0x1040': ['LO', '1', 'PatientAddress'],
        '0x1050': ['LT', '1-n', 'InsurancePlanIdentification'],
        '0x1060': ['PN', '1', 'PatientMotherBirthName'],
        '0x1080': ['LO', '1', 'MilitaryRank'],
        '0x1081': ['LO', '1', 'BranchOfService'],
        '0x1090': ['LO', '1', 'MedicalRecordLocator'],
        '0x2000': ['LO', '1-n', 'MedicalAlerts'],
        '0x2110': ['LO', '1-n', 'ContrastAllergies'],
        '0x2150': ['LO', '1', 'CountryOfResidence'],
        '0x2152': ['LO', '1', 'RegionOfResidence'],
        '0x2154': ['SH', '1-n', 'PatientTelephoneNumber'],
        '0x2160': ['SH', '1', 'EthnicGroup'],
        '0x2180': ['SH', '1', 'Occupation'],
        '0x21A0': ['CS', '1', 'SmokingStatus'],
        '0x21B0': ['LT', '1', 'AdditionalPatientHistory'],
        '0x21C0': ['US', '1', 'PregnancyStatus'],
        '0x21D0': ['DA', '1', 'LastMenstrualDate'],
        '0x21F0': ['LO', '1', 'PatientReligiousPreference'],
        '0x4000': ['LT', '1', 'PatientComments'],
    },
    '0x0018': {
        '0x0000': ['UL', '1', 'AcquisitionGroupLength'],
        '0x0010': ['LO', '1', 'ContrastBolusAgent'],
        '0x0012': ['SQ', '1', 'ContrastBolusAgentSequence'],
        '0x0014': ['SQ', '1', 'ContrastBolusAdministrationRouteSequence'],
        '0x0015': ['CS', '1', 'BodyPartExamined'],
        '0x0020': ['CS', '1-n', 'ScanningSequence'],
        '0x0021': ['CS', '1-n', 'SequenceVariant'],
        '0x0022': ['CS', '1-n', 'ScanOptions'],
        '0x0023': ['CS', '1', 'MRAcquisitionType'],
        '0x0024': ['SH', '1', 'SequenceName'],
        '0x0025': ['CS', '1', 'AngioFlag'],
        '0x0026': ['SQ', '1', 'InterventionDrugInformationSequence'],
        '0x0027': ['TM', '1', 'InterventionDrugStopTime'],
        '0x0028': ['DS', '1', 'InterventionDrugDose'],
        '0x0029': ['SQ', '1', 'InterventionalDrugSequence'],
        '0x002A': ['SQ', '1', 'AdditionalDrugSequence'],
        '0x0030': ['LO', '1-n', 'Radionuclide'],
        '0x0031': ['LO', '1-n', 'Radiopharmaceutical'],
        '0x0032': ['DS', '1', 'EnergyWindowCenterline'],
        '0x0033': ['DS', '1-n', 'EnergyWindowTotalWidth'],
        '0x0034': ['LO', '1', 'InterventionalDrugName'],
        '0x0035': ['TM', '1', 'InterventionalDrugStartTime'],
        '0x0036': ['SQ', '1', 'InterventionalTherapySequence'],
        '0x0037': ['CS', '1', 'TherapyType'],
        '0x0038': ['CS', '1', 'InterventionalStatus'],
        '0x0039': ['CS', '1', 'TherapyDescription'],
        '0x0040': ['IS', '1', 'CineRate'],
        '0x0050': ['DS', '1', 'SliceThickness'],
        '0x0060': ['DS', '1', 'KVP'],
        '0x0070': ['IS', '1', 'CountsAccumulated'],
        '0x0071': ['CS', '1', 'AcquisitionTerminationCondition'],
        '0x0072': ['DS', '1', 'EffectiveSeriesDuration'],
        '0x0073': ['CS', '1', 'AcquisitionStartCondition'],
        '0x0074': ['IS', '1', 'AcquisitionStartConditionData'],
        '0x0075': ['IS', '1', 'AcquisitionTerminationConditionData'],
        '0x0080': ['DS', '1', 'RepetitionTime'],
        '0x0081': ['DS', '1', 'EchoTime'],
        '0x0082': ['DS', '1', 'InversionTime'],
        '0x0083': ['DS', '1', 'NumberOfAverages'],
        '0x0084': ['DS', '1', 'ImagingFrequency'],
        '0x0085': ['SH', '1', 'ImagedNucleus'],
        '0x0086': ['IS', '1-n', 'EchoNumber'],
        '0x0087': ['DS', '1', 'MagneticFieldStrength'],
        '0x0088': ['DS', '1', 'SpacingBetweenSlices'],
        '0x0089': ['IS', '1', 'NumberOfPhaseEncodingSteps'],
        '0x0090': ['DS', '1', 'DataCollectionDiameter'],
        '0x0091': ['IS', '1', 'EchoTrainLength'],
        '0x0093': ['DS', '1', 'PercentSampling'],
        '0x0094': ['DS', '1', 'PercentPhaseFieldOfView'],
        '0x0095': ['DS', '1', 'PixelBandwidth'],
        '0x1000': ['LO', '1', 'DeviceSerialNumber'],
        '0x1002': ['UI', '1', 'DeviceUID'],
        '0x1003': ['LO', '1', 'DeviceID'],
        '0x1004': ['LO', '1', 'PlateID'],
        '0x1005': ['LO', '1', 'GeneratorID'],
        '0x1006': ['LO', '1', 'GridID'],
        '0x1007': ['LO', '1', 'CassetteID'],
        '0x1008': ['LO', '1', 'GantryID'],
        '0x1010': ['LO', '1', 'SecondaryCaptureDeviceID'],
        '0x1011': ['LO', '1', 'HardcopyCreationDeviceID'],
        '0x1012': ['DA', '1', 'DateOfSecondaryCapture'],
        '0x1014': ['TM', '1', 'TimeOfSecondaryCapture'],
        '0x1016': ['LO', '1', 'SecondaryCaptureDeviceManufacturer'],
        '0x1017': ['LO', '1', 'HardcopyDeviceManufacturer'],
        '0x1018': ['LO', '1', 'SecondaryCaptureDeviceManufacturerModelName'],
        '0x1019': ['LO', '1-n', 'SecondaryCaptureDeviceSoftwareVersion'],
        '0x101A': ['LO', '1-n', 'HardcopyDeviceSoftwareVersion'],
        '0x101B': ['LO', '1', 'HardcopyDeviceManfuacturersModelName'],
        '0x1020': ['LO', '1-n', 'SoftwareVersion'],
        '0x1022': ['SH', '1', 'VideoImageFormatAcquired'],
        '0x1023': ['LO', '1', 'DigitalImageFormatAcquired'],
        '0x1030': ['LO', '1', 'ProtocolName'],
        '0x1040': ['LO', '1', 'ContrastBolusRoute'],
        '0x1041': ['DS', '1', 'ContrastBolusVolume'],
        '0x1042': ['TM', '1', 'ContrastBolusStartTime'],
        '0x1043': ['TM', '1', 'ContrastBolusStopTime'],
        '0x1044': ['DS', '1', 'ContrastBolusTotalDose'],
        '0x1045': ['IS', '1-n', 'SyringeCounts'],
        '0x1046': ['DS', '1-n', 'ContrastFlowRate'],
        '0x1047': ['DS', '1-n', 'ContrastFlowDuration'],
        '0x1048': ['CS', '1', 'ContrastBolusIngredient'],
        '0x1049': ['DS', '1', 'ContrastBolusIngredientConcentration'],
        '0x1050': ['DS', '1', 'SpatialResolution'],
        '0x1060': ['DS', '1', 'TriggerTime'],
        '0x1061': ['LO', '1', 'TriggerSourceOrType'],
        '0x1062': ['IS', '1', 'NominalInterval'],
        '0x1063': ['DS', '1', 'FrameTime'],
        '0x1064': ['LO', '1', 'FramingType'],
        '0x1065': ['DS', '1-n', 'FrameTimeVector'],
        '0x1066': ['DS', '1', 'FrameDelay'],
        '0x1067': ['DS', '1', 'ImageTriggerDelay'],
        '0x1068': ['DS', '1', 'MultiplexGroupTimeOffset'],
        '0x1069': ['DS', '1', 'TriggerTimeOffset'],
        '0x106A': ['CS', '1', 'SynchronizationTrigger'],
        '0x106C': ['US', '2', 'SynchronizationChannel'],
        '0x106E': ['UL', '1', 'TriggerSamplePosition'],
        '0x1070': ['LO', '1-n', 'RadionuclideRoute'],
        '0x1071': ['DS', '1-n', 'RadionuclideVolume'],
        '0x1072': ['TM', '1-n', 'RadionuclideStartTime'],
        '0x1073': ['TM', '1-n', 'RadionuclideStopTime'],
        '0x1074': ['DS', '1-n', 'RadionuclideTotalDose'],
        '0x1075': ['DS', '1', 'RadionuclideHalfLife'],
        '0x1076': ['DS', '1', 'RadionuclidePositronFraction'],
        '0x1077': ['DS', '1', 'RadiopharmaceuticalSpecificActivity'],
        '0x1080': ['CS', '1', 'BeatRejectionFlag'],
        '0x1081': ['IS', '1', 'LowRRValue'],
        '0x1082': ['IS', '1', 'HighRRValue'],
        '0x1083': ['IS', '1', 'IntervalsAcquired'],
        '0x1084': ['IS', '1', 'IntervalsRejected'],
        '0x1085': ['LO', '1', 'PVCRejection'],
        '0x1086': ['IS', '1', 'SkipBeats'],
        '0x1088': ['IS', '1', 'HeartRate'],
        '0x1090': ['IS', '1', 'CardiacNumberOfImages'],
        '0x1094': ['IS', '1', 'TriggerWindow'],
        '0x1100': ['DS', '1', 'ReconstructionDiameter'],
        '0x1110': ['DS', '1', 'DistanceSourceToDetector'],
        '0x1111': ['DS', '1', 'DistanceSourceToPatient'],
        '0x1114': ['DS', '1', 'EstimatedRadiographicMagnificationFactor'],
        '0x1120': ['DS', '1', 'GantryDetectorTilt'],
        '0x1121': ['DS', '1', 'GantryDetectorSlew'],
        '0x1130': ['DS', '1', 'TableHeight'],
        '0x1131': ['DS', '1', 'TableTraverse'],
        '0x1134': ['DS', '1', 'TableMotion'],
        '0x1135': ['DS', '1-n', 'TableVerticalIncrement'],
        '0x1136': ['DS', '1-n', 'TableLateralIncrement'],
        '0x1137': ['DS', '1-n', 'TableLongitudinalIncrement'],
        '0x1138': ['DS', '1', 'TableAngle'],
        '0x113A': ['CS', '1', 'TableType'],
        '0x1140': ['CS', '1', 'RotationDirection'],
        '0x1141': ['DS', '1', 'AngularPosition'],
        '0x1142': ['DS', '1-n', 'RadialPosition'],
        '0x1143': ['DS', '1', 'ScanArc'],
        '0x1144': ['DS', '1', 'AngularStep'],
        '0x1145': ['DS', '1', 'CenterOfRotationOffset'],
        '0x1146': ['DS', '1-n', 'RotationOffset'],
        '0x1147': ['CS', '1', 'FieldOfViewShape'],
        '0x1149': ['IS', '2', 'FieldOfViewDimension'],
        '0x1150': ['IS', '1', 'ExposureTime'],
        '0x1151': ['IS', '1', 'XrayTubeCurrent'],
        '0x1152': ['IS', '1', 'Exposure'],
        '0x1153': ['IS', '1', 'ExposureinuAs'],
        '0x1154': ['DS', '1', 'AveragePulseWidth'],
        '0x1155': ['CS', '1', 'RadiationSetting'],
        '0x1156': ['CS', '1', 'RectificationType'],
        '0x115A': ['CS', '1', 'RadiationMode'],
        '0x115E': ['DS', '1', 'ImageAreaDoseProduct'],
        '0x1160': ['SH', '1', 'FilterType'],
        '0x1161': ['LO', '1-n', 'TypeOfFilters'],
        '0x1162': ['DS', '1', 'IntensifierSize'],
        '0x1164': ['DS', '2', 'ImagerPixelSpacing'],
        '0x1166': ['CS', '1', 'Grid'],
        '0x1170': ['IS', '1', 'GeneratorPower'],
        '0x1180': ['SH', '1', 'CollimatorGridName'],
        '0x1181': ['CS', '1', 'CollimatorType'],
        '0x1182': ['IS', '1', 'FocalDistance'],
        '0x1183': ['DS', '1', 'XFocusCenter'],
        '0x1184': ['DS', '1', 'YFocusCenter'],
        '0x1190': ['DS', '1-n', 'FocalSpot'],
        '0x1191': ['CS', '1', 'AnodeTargetMaterial'],
        '0x11A0': ['DS', '1', 'BodyPartThickness'],
        '0x11A2': ['DS', '1', 'CompressionForce'],
        '0x1200': ['DA', '1-n', 'DateOfLastCalibration'],
        '0x1201': ['TM', '1-n', 'TimeOfLastCalibration'],
        '0x1210': ['SH', '1-n', 'ConvolutionKernel'],
        '0x1240': ['IS', '1-n', 'UpperLowerPixelValues'],
        '0x1242': ['IS', '1', 'ActualFrameDuration'],
        '0x1243': ['IS', '1', 'CountRate'],
        '0x1244': ['US', '1', 'PreferredPlaybackSequencing'],
        '0x1250': ['SH', '1', 'ReceivingCoil'],
        '0x1251': ['SH', '1', 'TransmittingCoil'],
        '0x1260': ['SH', '1', 'PlateType'],
        '0x1261': ['LO', '1', 'PhosphorType'],
        '0x1300': ['IS', '1', 'ScanVelocity'],
        '0x1301': ['CS', '1-n', 'WholeBodyTechnique'],
        '0x1302': ['IS', '1', 'ScanLength'],
        '0x1310': ['US', '4', 'AcquisitionMatrix'],
        '0x1312': ['CS', '1', 'PhaseEncodingDirection'],
        '0x1314': ['DS', '1', 'FlipAngle'],
        '0x1315': ['CS', '1', 'VariableFlipAngleFlag'],
        '0x1316': ['DS', '1', 'SAR'],
        '0x1318': ['DS', '1', 'dBdt'],
        '0x1400': ['LO', '1', 'AcquisitionDeviceProcessingDescription'],
        '0x1401': ['LO', '1', 'AcquisitionDeviceProcessingCode'],
        '0x1402': ['CS', '1', 'CassetteOrientation'],
        '0x1403': ['CS', '1', 'CassetteSize'],
        '0x1404': ['US', '1', 'ExposuresOnPlate'],
        '0x1405': ['IS', '1', 'RelativeXrayExposure'],
        '0x1450': ['DS', '1', 'ColumnAngulation'],
        '0x1460': ['DS', '1', 'TomoLayerHeight'],
        '0x1470': ['DS', '1', 'TomoAngle'],
        '0x1480': ['DS', '1', 'TomoTime'],
        '0x1490': ['CS', '1', 'TomoType'],
        '0x1491': ['CS', '1', 'TomoClass'],
        '0x1495': ['IS', '1', 'NumberofTomosynthesisSourceImages'],
        '0x1500': ['CS', '1', 'PositionerMotion'],
        '0x1508': ['CS', '1', 'PositionerType'],
        '0x1510': ['DS', '1', 'PositionerPrimaryAngle'],
        '0x1511': ['DS', '1', 'PositionerSecondaryAngle'],
        '0x1520': ['DS', '1-n', 'PositionerPrimaryAngleIncrement'],
        '0x1521': ['DS', '1-n', 'PositionerSecondaryAngleIncrement'],
        '0x1530': ['DS', '1', 'DetectorPrimaryAngle'],
        '0x1531': ['DS', '1', 'DetectorSecondaryAngle'],
        '0x1600': ['CS', '3', 'ShutterShape'],
        '0x1602': ['IS', '1', 'ShutterLeftVerticalEdge'],
        '0x1604': ['IS', '1', 'ShutterRightVerticalEdge'],
        '0x1606': ['IS', '1', 'ShutterUpperHorizontalEdge'],
        '0x1608': ['IS', '1', 'ShutterLowerHorizontalEdge'],
        '0x1610': ['IS', '1', 'CenterOfCircularShutter'],
        '0x1612': ['IS', '1', 'RadiusOfCircularShutter'],
        '0x1620': ['IS', '1-n', 'VerticesOfPolygonalShutter'],
        '0x1622': ['US', '1', 'ShutterPresentationValue'],
        '0x1623': ['US', '1', 'ShutterOverlayGroup'],
        '0x1700': ['CS', '3', 'CollimatorShape'],
        '0x1702': ['IS', '1', 'CollimatorLeftVerticalEdge'],
        '0x1704': ['IS', '1', 'CollimatorRightVerticalEdge'],
        '0x1706': ['IS', '1', 'CollimatorUpperHorizontalEdge'],
        '0x1708': ['IS', '1', 'CollimatorLowerHorizontalEdge'],
        '0x1710': ['IS', '1', 'CenterOfCircularCollimator'],
        '0x1712': ['IS', '1', 'RadiusOfCircularCollimator'],
        '0x1720': ['IS', '1-n', 'VerticesOfPolygonalCollimator'],
        '0x1800': ['CS', '1', 'AcquisitionTimeSynchronized'],
        '0x1801': ['SH', '1', 'TimeSource'],
        '0x1802': ['CS', '1', 'TimeDistributionProtocol'],
        '0x1810': ['DT', '1', 'AcquisitionTimestamp'],
        '0x4000': ['LT', '1-n', 'AcquisitionComments'],
        '0x5000': ['SH', '1-n', 'OutputPower'],
        '0x5010': ['LO', '3', 'TransducerData'],
        '0x5012': ['DS', '1', 'FocusDepth'],
        '0x5020': ['LO', '1', 'PreprocessingFunction'],
        '0x5021': ['LO', '1', 'PostprocessingFunction'],
        '0x5022': ['DS', '1', 'MechanicalIndex'],
        '0x5024': ['DS', '1', 'ThermalIndex'],
        '0x5026': ['DS', '1', 'CranialThermalIndex'],
        '0x5027': ['DS', '1', 'SoftTissueThermalIndex'],
        '0x5028': ['DS', '1', 'SoftTissueFocusThermalIndex'],
        '0x5029': ['DS', '1', 'SoftTissueSurfaceThermalIndex'],
        '0x5030': ['DS', '1', 'DynamicRange'],
        '0x5040': ['DS', '1', 'TotalGain'],
        '0x5050': ['IS', '1', 'DepthOfScanField'],
        '0x5100': ['CS', '1', 'PatientPosition'],
        '0x5101': ['CS', '1', 'ViewPosition'],
        '0x5104': ['SQ', '1', 'ProjectionEponymousNameCodeSequence'],
        '0x5210': ['DS', '6', 'ImageTransformationMatrix'],
        '0x5212': ['DS', '3', 'ImageTranslationVector'],
        '0x6000': ['DS', '1', 'Sensitivity'],
        '0x6011': ['SQ', '1', 'SequenceOfUltrasoundRegions'],
        '0x6012': ['US', '1', 'RegionSpatialFormat'],
        '0x6014': ['US', '1', 'RegionDataType'],
        '0x6016': ['UL', '1', 'RegionFlags'],
        '0x6018': ['UL', '1', 'RegionLocationMinX0'],
        '0x601A': ['UL', '1', 'RegionLocationMinY0'],
        '0x601C': ['UL', '1', 'RegionLocationMaxX1'],
        '0x601E': ['UL', '1', 'RegionLocationMaxY1'],
        '0x6020': ['SL', '1', 'ReferencePixelX0'],
        '0x6022': ['SL', '1', 'ReferencePixelY0'],
        '0x6024': ['US', '1', 'PhysicalUnitsXDirection'],
        '0x6026': ['US', '1', 'PhysicalUnitsYDirection'],
        '0x6028': ['FD', '1', 'ReferencePixelPhysicalValueX'],
        '0x602A': ['FD', '1', 'ReferencePixelPhysicalValueY'],
        '0x602C': ['FD', '1', 'PhysicalDeltaX'],
        '0x602E': ['FD', '1', 'PhysicalDeltaY'],
        '0x6030': ['UL', '1', 'TransducerFrequency'],
        '0x6031': ['CS', '1', 'TransducerType'],
        '0x6032': ['UL', '1', 'PulseRepetitionFrequency'],
        '0x6034': ['FD', '1', 'DopplerCorrectionAngle'],
        '0x6036': ['FD', '1', 'SteeringAngle'],
        '0x6038': ['UL', '1', 'DopplerSampleVolumeXPosition'],
        '0x603A': ['UL', '1', 'DopplerSampleVolumeYPosition'],
        '0x603C': ['UL', '1', 'TMLinePositionX0'],
        '0x603E': ['UL', '1', 'TMLinePositionY0'],
        '0x6040': ['UL', '1', 'TMLinePositionX1'],
        '0x6042': ['UL', '1', 'TMLinePositionY1'],
        '0x6044': ['US', '1', 'PixelComponentOrganization'],
        '0x6046': ['UL', '1', 'PixelComponentMask'],
        '0x6048': ['UL', '1', 'PixelComponentRangeStart'],
        '0x604A': ['UL', '1', 'PixelComponentRangeStop'],
        '0x604C': ['US', '1', 'PixelComponentPhysicalUnits'],
        '0x604E': ['US', '1', 'PixelComponentDataType'],
        '0x6050': ['UL', '1', 'NumberOfTableBreakPoints'],
        '0x6052': ['UL', '1-n', 'TableOfXBreakPoints'],
        '0x6054': ['FD', '1-n', 'TableOfYBreakPoints'],
        '0x6056': ['UL', '1', 'NumberOfTableEntries'],
        '0x6058': ['UL', '1-n', 'TableOfPixelValues'],
        '0x605A': ['FL', '1-n', 'TableOfParameterValues'],
        '0x7000': ['CS', '1', 'DetectorConditionsNominalFlag'],
        '0x7001': ['DS', '1', 'DetectorTemperature'],
        '0x7004': ['CS', '1', 'DetectorType'],
        '0x7005': ['CS', '1', 'DetectorConfiguration'],
        '0x7006': ['LT', '1', 'DetectorDescription'],
        '0x7008': ['LT', '1', 'DetectorMode'],
        '0x700A': ['SH', '1', 'DetectorID'],
        '0x700C': ['DA', '1', 'DateofLastDetectorCalibration'],
        '0x700E': ['TM', '1', 'TimeofLastDetectorCalibration'],
        '0x7010': ['IS', '1', 'ExposuresOnDetectorSinceLastCalibration'],
        '0x7011': ['IS', '1', 'ExposuresOnDetectorSinceManufactured'],
        '0x7012': ['DS', '1', 'DetectorTimeSinceLastExposure'],
        '0x7014': ['DS', '1', 'DetectorActiveTime'],
        '0x7016': ['DS', '1', 'DetectorActivationOffsetFromExposure'],
        '0x701A': ['DS', '2', 'DetectorBinning'],
        '0x7020': ['DS', '2', 'DetectorElementPhysicalSize'],
        '0x7022': ['DS', '2', 'DetectorElementSpacing'],
        '0x7024': ['CS', '1', 'DetectorActiveShape'],
        '0x7026': ['DS', '1-2', 'DetectorActiveDimensions'],
        '0x7028': ['DS', '2', 'DetectorActiveOrigin'],
        '0x7030': ['DS', '2', 'FieldofViewOrigin'],
        '0x7032': ['DS', '1', 'FieldofViewRotation'],
        '0x7034': ['CS', '1', 'FieldofViewHorizontalFlip'],
        '0x7040': ['LT', '1', 'GridAbsorbingMaterial'],
        '0x7041': ['LT', '1', 'GridSpacingMaterial'],
        '0x7042': ['DS', '1', 'GridThickness'],
        '0x7044': ['DS', '1', 'GridPitch'],
        '0x7046': ['IS', '2', 'GridAspectRatio'],
        '0x7048': ['DS', '1', 'GridPeriod'],
        '0x704C': ['DS', '1', 'GridFocalDistance'],
        '0x7050': ['LT', '1-n', 'FilterMaterial'],
        '0x7052': ['DS', '1-n', 'FilterThicknessMinimum'],
        '0x7054': ['DS', '1-n', 'FilterThicknessMaximum'],
        '0x7060': ['CS', '1', 'ExposureControlMode'],
        '0x7062': ['LT', '1', 'ExposureControlModeDescription'],
        '0x7064': ['CS', '1', 'ExposureStatus'],
        '0x7065': ['DS', '1', 'PhototimerSetting'],
    },
    '0x0020': {
        '0x0000': ['UL', '1', 'ImageGroupLength'],
        '0x000D': ['UI', '1', 'StudyInstanceUID'],
        '0x000E': ['UI', '1', 'SeriesInstanceUID'],
        '0x0010': ['SH', '1', 'StudyID'],
        '0x0011': ['IS', '1', 'SeriesNumber'],
        '0x0012': ['IS', '1', 'AcquisitionNumber'],
        '0x0013': ['IS', '1', 'ImageNumber'],
        '0x0014': ['IS', '1', 'IsotopeNumber'],
        '0x0015': ['IS', '1', 'PhaseNumber'],
        '0x0016': ['IS', '1', 'IntervalNumber'],
        '0x0017': ['IS', '1', 'TimeSlotNumber'],
        '0x0018': ['IS', '1', 'AngleNumber'],
        '0x0019': ['IS', '1', 'ItemNumber'],
        '0x0020': ['CS', '2', 'PatientOrientation'],
        '0x0022': ['IS', '1', 'OverlayNumber'],
        '0x0024': ['IS', '1', 'CurveNumber'],
        '0x0026': ['IS', '1', 'LUTNumber'],
        '0x0030': ['DS', '3', 'ImagePosition'],
        '0x0032': ['DS', '3', 'ImagePositionPatient'],
        '0x0035': ['DS', '6', 'ImageOrientation'],
        '0x0037': ['DS', '6', 'ImageOrientationPatient'],
        '0x0050': ['DS', '1', 'Location'],
        '0x0052': ['UI', '1', 'FrameOfReferenceUID'],
        '0x0060': ['CS', '1', 'Laterality'],
        '0x0062': ['CS', '1', 'ImageLaterality'],
        '0x0070': ['LT', '1', 'ImageGeometryType'],
        '0x0080': ['CS', '1-n', 'MaskingImage'],
        '0x0100': ['IS', '1', 'TemporalPositionIdentifier'],
        '0x0105': ['IS', '1', 'NumberOfTemporalPositions'],
        '0x0110': ['DS', '1', 'TemporalResolution'],
        '0x0200': ['UI', '1', 'SynchronizationFrameofReferenceUID'],
        '0x1000': ['IS', '1', 'SeriesInStudy'],
        '0x1001': ['IS', '1', 'AcquisitionsInSeries'],
        '0x1002': ['IS', '1', 'ImagesInAcquisition'],
        '0x1003': ['IS', '1', 'ImagesInSeries'],
        '0x1004': ['IS', '1', 'AcquisitionsInStudy'],
        '0x1005': ['IS', '1', 'ImagesInStudy'],
        '0x1020': ['CS', '1-n', 'Reference'],
        '0x1040': ['LO', '1', 'PositionReferenceIndicator'],
        '0x1041': ['DS', '1', 'SliceLocation'],
        '0x1070': ['IS', '1-n', 'OtherStudyNumbers'],
        '0x1200': ['IS', '1', 'NumberOfPatientRelatedStudies'],
        '0x1202': ['IS', '1', 'NumberOfPatientRelatedSeries'],
        '0x1204': ['IS', '1', 'NumberOfPatientRelatedImages'],
        '0x1206': ['IS', '1', 'NumberOfStudyRelatedSeries'],
        '0x1208': ['IS', '1', 'NumberOfStudyRelatedImages'],
        '0x1209': ['IS', '1', 'NumberOfSeriesRelatedInstances'],
        '0x3100': ['CS', '1-n', 'SourceImageID'],
        '0x3401': ['CS', '1', 'ModifyingDeviceID'],
        '0x3402': ['CS', '1', 'ModifiedImageID'],
        '0x3403': ['DA', '1', 'ModifiedImageDate'],
        '0x3404': ['LO', '1', 'ModifyingDeviceManufacturer'],
        '0x3405': ['TM', '1', 'ModifiedImageTime'],
        '0x3406': ['LT', '1', 'ModifiedImageDescription'],
        '0x4000': ['LT', '1', 'ImageComments'],
        '0x5000': ['AT', '1-n', 'OriginalImageIdentification'],
        '0x5002': ['CS', '1-n', 'OriginalImageIdentificationNomenclature'],
    },
    '0x0028': {
        '0x0000': ['UL', '1', 'ImagePresentationGroupLength'],
        '0x0002': ['US', '1', 'SamplesPerPixel'],
        '0x0004': ['CS', '1', 'PhotometricInterpretation'],
        '0x0005': ['US', '1', 'ImageDimensions'],
        '0x0006': ['US', '1', 'PlanarConfiguration'],
        '0x0008': ['IS', '1', 'NumberOfFrames'],
        '0x0009': ['AT', '1', 'FrameIncrementPointer'],
        '0x0010': ['US', '1', 'Rows'],
        '0x0011': ['US', '1', 'Columns'],
        '0x0012': ['US', '1', 'Planes'],
        '0x0014': ['US', '1', 'UltrasoundColorDataPresent'],
        '0x0030': ['DS', '2', 'PixelSpacing'],
        '0x0031': ['DS', '2', 'ZoomFactor'],
        '0x0032': ['DS', '2', 'ZoomCenter'],
        '0x0034': ['IS', '2', 'PixelAspectRatio'],
        '0x0040': ['CS', '1', 'ImageFormat'],
        '0x0050': ['LT', '1-n', 'ManipulatedImage'],
        '0x0051': ['CS', '1', 'CorrectedImage'],
        '0x005F': ['CS', '1', 'CompressionRecognitionCode'],
        '0x0060': ['CS', '1', 'CompressionCode'],
        '0x0061': ['SH', '1', 'CompressionOriginator'],
        '0x0062': ['SH', '1', 'CompressionLabel'],
        '0x0063': ['SH', '1', 'CompressionDescription'],
        '0x0065': ['CS', '1-n', 'CompressionSequence'],
        '0x0066': ['AT', '1-n', 'CompressionStepPointers'],
        '0x0068': ['US', '1', 'RepeatInterval'],
        '0x0069': ['US', '1', 'BitsGrouped'],
        '0x0070': ['US', '1-n', 'PerimeterTable'],
        '0x0071': ['XS', '1', 'PerimeterValue'],
        '0x0080': ['US', '1', 'PredictorRows'],
        '0x0081': ['US', '1', 'PredictorColumns'],
        '0x0082': ['US', '1-n', 'PredictorConstants'],
        '0x0090': ['CS', '1', 'BlockedPixels'],
        '0x0091': ['US', '1', 'BlockRows'],
        '0x0092': ['US', '1', 'BlockColumns'],
        '0x0093': ['US', '1', 'RowOverlap'],
        '0x0094': ['US', '1', 'ColumnOverlap'],
        '0x0100': ['US', '1', 'BitsAllocated'],
        '0x0101': ['US', '1', 'BitsStored'],
        '0x0102': ['US', '1', 'HighBit'],
        '0x0103': ['US', '1', 'PixelRepresentation'],
        '0x0104': ['XS', '1', 'SmallestValidPixelValue'],
        '0x0105': ['XS', '1', 'LargestValidPixelValue'],
        '0x0106': ['XS', '1', 'SmallestImagePixelValue'],
        '0x0107': ['XS', '1', 'LargestImagePixelValue'],
        '0x0108': ['XS', '1', 'SmallestPixelValueInSeries'],
        '0x0109': ['XS', '1', 'LargestPixelValueInSeries'],
        '0x0110': ['XS', '1', 'SmallestPixelValueInPlane'],
        '0x0111': ['XS', '1', 'LargestPixelValueInPlane'],
        '0x0120': ['XS', '1', 'PixelPaddingValue'],
        '0x0200': ['US', '1', 'ImageLocation'],
        '0x0300': ['CS', '1', 'QualityControlImage'],
        '0x0301': ['CS', '1', 'BurnedInAnnotation'],
        '0x0400': ['CS', '1', 'TransformLabel'],
        '0x0401': ['CS', '1', 'TransformVersionNumber'],
        '0x0402': ['US', '1', 'NumberOfTransformSteps'],
        '0x0403': ['CS', '1-n', 'SequenceOfCompressedData'],
        '0x0404': ['AT', '1-n', 'DetailsOfCoefficients'],
        '0x0410': ['US', '1', 'RowsForNthOrderCoefficients'],
        '0x0411': ['US', '1', 'ColumnsForNthOrderCoefficients'],
        '0x0412': ['CS', '1-n', 'CoefficientCoding'],
        '0x0413': ['AT', '1-n', 'CoefficientCodingPointers'],
        '0x0700': ['CS', '1', 'DCTLabel'],
        '0x0701': ['CS', '1-n', 'DataBlockDescription'],
        '0x0702': ['AT', '1-n', 'DataBlock'],
        '0x0710': ['US', '1', 'NormalizationFactorFormat'],
        '0x0720': ['US', '1', 'ZonalMapNumberFormat'],
        '0x0721': ['AT', '1-n', 'ZonalMapLocation'],
        '0x0722': ['US', '1', 'ZonalMapFormat'],
        '0x0730': ['US', '1', 'AdaptiveMapFormat'],
        '0x0740': ['US', '1', 'CodeNumberFormat'],
        '0x0800': ['CS', '1-n', 'CodeLabel'],
        '0x0802': ['US', '1', 'NumberOfTables'],
        '0x0803': ['AT', '1-n', 'CodeTableLocation'],
        '0x0804': ['US', '1', 'BitsForCodeWord'],
        '0x0808': ['AT', '1-n', 'ImageDataLocation'],
        '0x1040': ['CS', '1', 'PixelIntensityRelationship'],
        '0x1041': ['SS', '1', 'PixelIntensityRelationshipSign'],
        '0x1050': ['DS', '1-n', 'WindowCenter'],
        '0x1051': ['DS', '1-n', 'WindowWidth'],
        '0x1052': ['DS', '1', 'RescaleIntercept'],
        '0x1053': ['DS', '1', 'RescaleSlope'],
        '0x1054': ['LO', '1', 'RescaleType'],
        '0x1055': ['LO', '1-n', 'WindowCenterWidthExplanation'],
        '0x1080': ['CS', '1', 'GrayScale'],
        '0x1090': ['CS', '1', 'RecommendedViewingMode'],
        '0x1100': ['XS', '3', 'GrayLookupTableDescriptor'],
        '0x1101': ['XS', '3', 'RedPaletteColorLookupTableDescriptor'],
        '0x1102': ['XS', '3', 'GreenPaletteColorLookupTableDescriptor'],
        '0x1103': ['XS', '3', 'BluePaletteColorLookupTableDescriptor'],
        '0x1111': ['US', '4', 'LargeRedPaletteColorLookupTableDescriptor'],
        '0x1112': ['US', '4', 'LargeGreenPaletteColorLookupTabe'],
        '0x1113': ['US', '4', 'LargeBluePaletteColorLookupTabl'],
        '0x1199': ['UI', '1', 'PaletteColorLookupTableUID'],
        '0x1200': ['XS', '1-n', 'GrayLookupTableData'],
        '0x1201': ['XS', '1-n', 'RedPaletteColorLookupTableData'],
        '0x1202': ['XS', '1-n', 'GreenPaletteColorLookupTableData'],
        '0x1203': ['XS', '1-n', 'BluePaletteColorLookupTableData'],
        '0x1211': ['OW', '1', 'LargeRedPaletteColorLookupTableData'],
        '0x1212': ['OW', '1', 'LargeGreenPaletteColorLookupTableData'],
        '0x1213': ['OW', '1', 'LargeBluePaletteColorLookupTableData'],
        '0x1214': ['UI', '1', 'LargePaletteColorLookupTableUID'],
        '0x1221': ['OW', '1', 'SegmentedRedPaletteColorLookupTableData'],
        '0x1222': ['OW', '1', 'SegmentedGreenPaletteColorLookupTableData'],
        '0x1223': ['OW', '1', 'SegmentedBluePaletteColorLookupTableData'],
        '0x1300': ['CS', '1', 'ImplantPresent'],
        '0x2110': ['CS', '1', 'LossyImageCompression'],
        '0x2112': ['DS', '1-n', 'LossyImageCompressionRatio'],
        '0x3000': ['SQ', '1', 'ModalityLUTSequence'],
        '0x3002': ['XS', '3', 'LUTDescriptor'],
        '0x3003': ['LO', '1', 'LUTExplanation'],
        '0x3004': ['LO', '1', 'ModalityLUTType'],
        '0x3006': ['XS', '1-n', 'LUTData'],
        '0x3010': ['SQ', '1', 'VOILUTSequence'],
        '0x3110': ['SQ', '1', 'SoftcopyVOILUTSequence'],
        '0x4000': ['LT', '1-n', 'ImagePresentationComments'],
        '0x5000': ['SQ', '1', 'BiPlaneAcquisitionSequence'],
        '0x6010': ['US', '1', 'RepresentativeFrameNumber'],
        '0x6020': ['US', '1-n', 'FrameNumbersOfInterest'],
        '0x6022': ['LO', '1-n', 'FrameOfInterestDescription'],
        '0x6030': ['US', '1-n', 'MaskPointer'],
        '0x6040': ['US', '1-n', 'RWavePointer'],
        '0x6100': ['SQ', '1', 'MaskSubtractionSequence'],
        '0x6101': ['CS', '1', 'MaskOperation'],
        '0x6102': ['US', '1-n', 'ApplicableFrameRange'],
        '0x6110': ['US', '1-n', 'MaskFrameNumbers'],
        '0x6112': ['US', '1', 'ContrastFrameAveraging'],
        '0x6114': ['FL', '2', 'MaskSubPixelShift'],
        '0x6120': ['SS', '1', 'TIDOffset'],
        '0x6190': ['ST', '1', 'MaskOperationExplanation'],
    },
    '0x0032': {
        '0x0000': ['UL', '1', 'StudyGroupLength'],
        '0x000A': ['CS', '1', 'StudyStatusID'],
        '0x000C': ['CS', '1', 'StudyPriorityID'],
        '0x0012': ['LO', '1', 'StudyIDIssuer'],
        '0x0032': ['DA', '1', 'StudyVerifiedDate'],
        '0x0033': ['TM', '1', 'StudyVerifiedTime'],
        '0x0034': ['DA', '1', 'StudyReadDate'],
        '0x0035': ['TM', '1', 'StudyReadTime'],
        '0x1000': ['DA', '1', 'ScheduledStudyStartDate'],
        '0x1001': ['TM', '1', 'ScheduledStudyStartTime'],
        '0x1010': ['DA', '1', 'ScheduledStudyStopDate'],
        '0x1011': ['TM', '1', 'ScheduledStudyStopTime'],
        '0x1020': ['LO', '1', 'ScheduledStudyLocation'],
        '0x1021': ['AE', '1-n', 'ScheduledStudyLocationAETitle'],
        '0x1030': ['LO', '1', 'ReasonForStudy'],
        '0x1032': ['PN', '1', 'RequestingPhysician'],
        '0x1033': ['LO', '1', 'RequestingService'],
        '0x1040': ['DA', '1', 'StudyArrivalDate'],
        '0x1041': ['TM', '1', 'StudyArrivalTime'],
        '0x1050': ['DA', '1', 'StudyCompletionDate'],
        '0x1051': ['TM', '1', 'StudyCompletionTime'],
        '0x1055': ['CS', '1', 'StudyComponentStatusID'],
        '0x1060': ['LO', '1', 'RequestedProcedureDescription'],
        '0x1064': ['SQ', '1', 'RequestedProcedureCodeSequence'],
        '0x1070': ['LO', '1', 'RequestedContrastAgent'],
        '0x4000': ['LT', '1', 'StudyComments'],
    },
    '0x0038': {
        '0x0000': ['UL', '1', 'VisitGroupLength'],
        '0x0004': ['SQ', '1', 'ReferencedPatientAliasSequence'],
        '0x0008': ['CS', '1', 'VisitStatusID'],
        '0x0010': ['LO', '1', 'AdmissionID'],
        '0x0011': ['LO', '1', 'IssuerOfAdmissionID'],
        '0x0016': ['LO', '1', 'RouteOfAdmissions'],
        '0x001A': ['DA', '1', 'ScheduledAdmissionDate'],
        '0x001B': ['TM', '1', 'ScheduledAdmissionTime'],
        '0x001C': ['DA', '1', 'ScheduledDischargeDate'],
        '0x001D': ['TM', '1', 'ScheduledDischargeTime'],
        '0x001E': ['LO', '1', 'ScheduledPatientInstitutionResidence'],
        '0x0020': ['DA', '1', 'AdmittingDate'],
        '0x0021': ['TM', '1', 'AdmittingTime'],
        '0x0030': ['DA', '1', 'DischargeDate'],
        '0x0032': ['TM', '1', 'DischargeTime'],
        '0x0040': ['LO', '1', 'DischargeDiagnosisDescription'],
        '0x0044': ['SQ', '1', 'DischargeDiagnosisCodeSequence'],
        '0x0050': ['LO', '1', 'SpecialNeeds'],
        '0x0300': ['LO', '1', 'CurrentPatientLocation'],
        '0x0400': ['LO', '1', 'PatientInstitutionResidence'],
        '0x0500': ['LO', '1', 'PatientState'],
        '0x4000': ['LT', '1', 'VisitComments'],
    },
    '0x003A': {
        '0x0004': ['CS', '1', 'WaveformOriginality'],
        '0x0005': ['US', '1', 'NumberofChannels'],
        '0x0010': ['UL', '1', 'NumberofSamples'],
        '0x001A': ['DS', '1', 'SamplingFrequency'],
        '0x0020': ['SH', '1', 'MultiplexGroupLabel'],
        '0x0200': ['SQ', '1', 'ChannelDefinitionSequence'],
        '0x0202': ['IS', '1', 'WVChannelNumber'],
        '0x0203': ['SH', '1', 'ChannelLabel'],
        '0x0205': ['CS', '1-n', 'ChannelStatus'],
        '0x0208': ['SQ', '1', 'ChannelSourceSequence'],
        '0x0209': ['SQ', '1', 'ChannelSourceModifiersSequence'],
        '0x020A': ['SQ', '1', 'SourceWaveformSequence'],
        '0x020C': ['LO', '1', 'ChannelDerivationDescription'],
        '0x0210': ['DS', '1', 'ChannelSensitivity'],
        '0x0211': ['SQ', '1', 'ChannelSensitivityUnits'],
        '0x0212': ['DS', '1', 'ChannelSensitivityCorrectionFactor'],
        '0x0213': ['DS', '1', 'ChannelBaseline'],
        '0x0214': ['DS', '1', 'ChannelTimeSkew'],
        '0x0215': ['DS', '1', 'ChannelSampleSkew'],
        '0x0218': ['DS', '1', 'ChannelOffset'],
        '0x021A': ['US', '1', 'WaveformBitsStored'],
        '0x0220': ['DS', '1', 'FilterLowFrequency'],
        '0x0221': ['DS', '1', 'FilterHighFrequency'],
        '0x0222': ['DS', '1', 'NotchFilterFrequency'],
        '0x0223': ['DS', '1', 'NotchFilterBandwidth'],
    },
    '0x0040': {
        '0x0000': ['UL', '1', 'ModalityWorklistGroupLength'],
        '0x0001': ['AE', '1', 'ScheduledStationAETitle'],
        '0x0002': ['DA', '1', 'ScheduledProcedureStepStartDate'],
        '0x0003': ['TM', '1', 'ScheduledProcedureStepStartTime'],
        '0x0004': ['DA', '1', 'ScheduledProcedureStepEndDate'],
        '0x0005': ['TM', '1', 'ScheduledProcedureStepEndTime'],
        '0x0006': ['PN', '1', 'ScheduledPerformingPhysicianName'],
        '0x0007': ['LO', '1', 'ScheduledProcedureStepDescription'],
        '0x0008': ['SQ', '1', 'ScheduledProcedureStepCodeSequence'],
        '0x0009': ['SH', '1', 'ScheduledProcedureStepID'],
        '0x0010': ['SH', '1', 'ScheduledStationName'],
        '0x0011': ['SH', '1', 'ScheduledProcedureStepLocation'],
        '0x0012': ['LO', '1', 'ScheduledPreOrderOfMedication'],
        '0x0020': ['CS', '1', 'ScheduledProcedureStepStatus'],
        '0x0100': ['SQ', '1-n', 'ScheduledProcedureStepSequence'],
        '0x0220': ['SQ', '1', 'ReferencedStandaloneSOPInstanceSequence'],
        '0x0241': ['AE', '1', 'PerformedStationAETitle'],
        '0x0242': ['SH', '1', 'PerformedStationName'],
        '0x0243': ['SH', '1', 'PerformedLocation'],
        '0x0244': ['DA', '1', 'PerformedProcedureStepStartDate'],
        '0x0245': ['TM', '1', 'PerformedProcedureStepStartTime'],
        '0x0250': ['DA', '1', 'PerformedProcedureStepEndDate'],
        '0x0251': ['TM', '1', 'PerformedProcedureStepEndTime'],
        '0x0252': ['CS', '1', 'PerformedProcedureStepStatus'],
        '0x0253': ['CS', '1', 'PerformedProcedureStepID'],
        '0x0254': ['LO', '1', 'PerformedProcedureStepDescription'],
        '0x0255': ['LO', '1', 'PerformedProcedureTypeDescription'],
        '0x0260': ['SQ', '1', 'PerformedActionItemSequence'],
        '0x0270': ['SQ', '1', 'ScheduledStepAttributesSequence'],
        '0x0275': ['SQ', '1', 'RequestAttributesSequence'],
        '0x0280': ['ST', '1', 'CommentsOnThePerformedProcedureSteps'],
        '0x0293': ['SQ', '1', 'QuantitySequence'],
        '0x0294': ['DS', '1', 'Quantity'],
        '0x0295': ['SQ', '1', 'MeasuringUnitsSequence'],
        '0x0296': ['SQ', '1', 'BillingItemSequence'],
        '0x0300': ['US', '1', 'TotalTimeOfFluoroscopy'],
        '0x0301': ['US', '1', 'TotalNumberOfExposures'],
        '0x0302': ['US', '1', 'EntranceDose'],
        '0x0303': ['US', '1-2', 'ExposedArea'],
        '0x0306': ['DS', '1', 'DistanceSourceToEntrance'],
        '0x0307': ['DS', '1', 'DistanceSourceToSupport'],
        '0x0310': ['ST', '1', 'CommentsOnRadiationDose'],
        '0x0312': ['DS', '1', 'XRayOutput'],
        '0x0314': ['DS', '1', 'HalfValueLayer'],
        '0x0316': ['DS', '1', 'OrganDose'],
        '0x0318': ['CS', '1', 'OrganExposed'],
        '0x0320': ['SQ', '1', 'BillingProcedureStepSequence'],
        '0x0321': ['SQ', '1', 'FilmConsumptionSequence'],
        '0x0324': ['SQ', '1', 'BillingSuppliesAndDevicesSequence'],
        '0x0330': ['SQ', '1', 'ReferencedProcedureStepSequence'],
        '0x0340': ['SQ', '1', 'PerformedSeriesSequence'],
        '0x0400': ['LT', '1', 'CommentsOnScheduledProcedureStep'],
        '0x050A': ['LO', '1', 'SpecimenAccessionNumber'],
        '0x0550': ['SQ', '1', 'SpecimenSequence'],
        '0x0551': ['LO', '1', 'SpecimenIdentifier'],
        '0x0555': ['SQ', '1', 'AcquisitionContextSequence'],
        '0x0556': ['ST', '1', 'AcquisitionContextDescription'],
        '0x059A': ['SQ', '1', 'SpecimenTypeCodeSequence'],
        '0x06FA': ['LO', '1', 'SlideIdentifier'],
        '0x071A': ['SQ', '1', 'ImageCenterPointCoordinatesSequence'],
        '0x072A': ['DS', '1', 'XOffsetInSlideCoordinateSystem'],
        '0x073A': ['DS', '1', 'YOffsetInSlideCoordinateSystem'],
        '0x074A': ['DS', '1', 'ZOffsetInSlideCoordinateSystem'],
        '0x08D8': ['SQ', '1', 'PixelSpacingSequence'],
        '0x08DA': ['SQ', '1', 'CoordinateSystemAxisCodeSequence'],
        '0x08EA': ['SQ', '1', 'MeasurementUnitsCodeSequence'],
        '0x1001': ['SH', '1', 'RequestedProcedureID'],
        '0x1002': ['LO', '1', 'ReasonForRequestedProcedure'],
        '0x1003': ['SH', '1', 'RequestedProcedurePriority'],
        '0x1004': ['LO', '1', 'PatientTransportArrangements'],
        '0x1005': ['LO', '1', 'RequestedProcedureLocation'],
        '0x1006': ['SH', '1', 'PlacerOrderNumberOfProcedure'],
        '0x1007': ['SH', '1', 'FillerOrderNumberOfProcedure'],
        '0x1008': ['LO', '1', 'ConfidentialityCode'],
        '0x1009': ['SH', '1', 'ReportingPriority'],
        '0x1010': ['PN', '1-n', 'NamesOfIntendedRecipientsOfResults'],
        '0x1400': ['LT', '1', 'RequestedProcedureComments'],
        '0x2001': ['LO', '1', 'ReasonForTheImagingServiceRequest'],
        '0x2002': ['LO', '1', 'ImagingServiceRequestDescription'],
        '0x2004': ['DA', '1', 'IssueDateOfImagingServiceRequest'],
        '0x2005': ['TM', '1', 'IssueTimeOfImagingServiceRequest'],
        '0x2006': ['SH', '1', 'PlacerOrderNumberOfImagingServiceRequest'],
        '0x2007': ['SH', '0', 'FillerOrderNumberOfImagingServiceRequest'],
        '0x2008': ['PN', '1', 'OrderEnteredBy'],
        '0x2009': ['SH', '1', 'OrderEntererLocation'],
        '0x2010': ['SH', '1', 'OrderCallbackPhoneNumber'],
        '0x2016': ['LO', '1', 'PlacerOrderNumberImagingServiceRequest'],
        '0x2017': ['LO', '1', 'FillerOrderNumberImagingServiceRequest'],
        '0x2400': ['LT', '1', 'ImagingServiceRequestComments'],
        '0x3001': ['LT', '1', 'ConfidentialityConstraint'],
        '0xA010': ['CS', '1', 'RelationshipType'],
        '0xA027': ['LO', '1', 'VerifyingOrganization'],
        '0xA030': ['DT', '1', 'VerificationDateTime'],
        '0xA032': ['DT', '1', 'ObservationDateTime'],
        '0xA040': ['CS', '1', 'ValueType'],
        '0xA043': ['SQ', '1', 'ConceptNameCodeSequence'],
        '0xA050': ['CS', '1', 'ContinuityOfContent'],
        '0xA073': ['SQ', '1', 'VerifyingObserverSequence'],
        '0xA075': ['PN', '1', 'VerifyingObserverName'],
        '0xA088': ['SQ', '1', 'VerifyingObserverIdentificationCodeSeque'],
        '0xA0B0': ['US', '2-2n', 'ReferencedWaveformChannels'],
        '0xA120': ['DT', '1', 'DateTime'],
        '0xA121': ['DA', '1', 'Date'],
        '0xA122': ['TM', '1', 'Time'],
        '0xA123': ['PN', '1', 'PersonName'],
        '0xA124': ['UI', '1', 'UID'],
        '0xA130': ['CS', '1', 'TemporalRangeType'],
        '0xA132': ['UL', '1-n', 'ReferencedSamplePositionsU'],
        '0xA136': ['US', '1-n', 'ReferencedFrameNumbers'],
        '0xA138': ['DS', '1-n', 'ReferencedTimeOffsets'],
        '0xA13A': ['DT', '1-n', 'ReferencedDatetime'],
        '0xA160': ['UT', '1', 'TextValue'],
        '0xA168': ['SQ', '1', 'ConceptCodeSequence'],
        '0xA180': ['US', '1', 'AnnotationGroupNumber'],
        '0xA195': ['SQ', '1', 'ConceptNameCodeSequenceModifier'],
        '0xA300': ['SQ', '1', 'MeasuredValueSequence'],
        '0xA30A': ['DS', '1-n', 'NumericValue'],
        '0xA360': ['SQ', '1', 'PredecessorDocumentsSequence'],
        '0xA370': ['SQ', '1', 'ReferencedRequestSequence'],
        '0xA372': ['SQ', '1', 'PerformedProcedureCodeSequence'],
        '0xA375': ['SQ', '1', 'CurrentRequestedProcedureEvidenceSequenSequence'],
        '0xA385': ['SQ', '1', 'PertinentOtherEvidenceSequence'],
        '0xA491': ['CS', '1', 'CompletionFlag'],
        '0xA492': ['LO', '1', 'CompletionFlagDescription'],
        '0xA493': ['CS', '1', 'VerificationFlag'],
        '0xA504': ['SQ', '1', 'ContentTemplateSequence'],
        '0xA525': ['SQ', '1', 'IdenticalDocumentsSequence'],
        '0xA730': ['SQ', '1', 'ContentSequence'],
        '0xB020': ['SQ', '1', 'AnnotationSequence'],
        '0xDB00': ['CS', '1', 'TemplateIdentifier'],
        '0xDB06': ['DT', '1', 'TemplateVersion'],
        '0xDB07': ['DT', '1', 'TemplateLocalVersion'],
        '0xDB0B': ['CS', '1', 'TemplateExtensionFlag'],
        '0xDB0C': ['UI', '1', 'TemplateExtensionOrganizationUID'],
        '0xDB0D': ['UI', '1', 'TemplateExtensionCreatorUID'],
        '0xDB73': ['UL', '1-n', 'ReferencedContentItemIdentifier'],
    },
    '0x0050': {
        '0x0000': ['UL', '1', 'XRayAngioDeviceGroupLength'],
        '0x0004': ['CS', '1', 'CalibrationObject'],
        '0x0010': ['SQ', '1', 'DeviceSequence'],
        '0x0012': ['CS', '1', 'DeviceType'],
        '0x0014': ['DS', '1', 'DeviceLength'],
        '0x0016': ['DS', '1', 'DeviceDiameter'],
        '0x0017': ['CS', '1', 'DeviceDiameterUnits'],
        '0x0018': ['DS', '1', 'DeviceVolume'],
        '0x0019': ['DS', '1', 'InterMarkerDistance'],
        '0x0020': ['LO', '1', 'DeviceDescription'],
        '0x0030': ['SQ', '1', 'CodedInterventionalDeviceSequence'],
    },
    '0x0054': {
        '0x0000': ['UL', '1', 'NuclearMedicineGroupLength'],
        '0x0010': ['US', '1-n', 'EnergyWindowVector'],
        '0x0011': ['US', '1', 'NumberOfEnergyWindows'],
        '0x0012': ['SQ', '1', 'EnergyWindowInformationSequence'],
        '0x0013': ['SQ', '1', 'EnergyWindowRangeSequence'],
        '0x0014': ['DS', '1', 'EnergyWindowLowerLimit'],
        '0x0015': ['DS', '1', 'EnergyWindowUpperLimit'],
        '0x0016': ['SQ', '1', 'RadiopharmaceuticalInformationSequence'],
        '0x0017': ['IS', '1', 'ResidualSyringeCounts'],
        '0x0018': ['SH', '1', 'EnergyWindowName'],
        '0x0020': ['US', '1-n', 'DetectorVector'],
        '0x0021': ['US', '1', 'NumberOfDetectors'],
        '0x0022': ['SQ', '1', 'DetectorInformationSequence'],
        '0x0030': ['US', '1-n', 'PhaseVector'],
        '0x0031': ['US', '1', 'NumberOfPhases'],
        '0x0032': ['SQ', '1', 'PhaseInformationSequence'],
        '0x0033': ['US', '1', 'NumberOfFramesInPhase'],
        '0x0036': ['IS', '1', 'PhaseDelay'],
        '0x0038': ['IS', '1', 'PauseBetweenFrames'],
        '0x0050': ['US', '1-n', 'RotationVector'],
        '0x0051': ['US', '1', 'NumberOfRotations'],
        '0x0052': ['SQ', '1', 'RotationInformationSequence'],
        '0x0053': ['US', '1', 'NumberOfFramesInRotation'],
        '0x0060': ['US', '1-n', 'RRIntervalVector'],
        '0x0061': ['US', '1', 'NumberOfRRIntervals'],
        '0x0062': ['SQ', '1', 'GatedInformationSequence'],
        '0x0063': ['SQ', '1', 'DataInformationSequence'],
        '0x0070': ['US', '1-n', 'TimeSlotVector'],
        '0x0071': ['US', '1', 'NumberOfTimeSlots'],
        '0x0072': ['SQ', '1', 'TimeSlotInformationSequence'],
        '0x0073': ['DS', '1', 'TimeSlotTime'],
        '0x0080': ['US', '1-n', 'SliceVector'],
        '0x0081': ['US', '1', 'NumberOfSlices'],
        '0x0090': ['US', '1-n', 'AngularViewVector'],
        '0x0100': ['US', '1-n', 'TimeSliceVector'],
        '0x0101': ['US', '1', 'NumberOfTimeSlices'],
        '0x0200': ['DS', '1', 'StartAngle'],
        '0x0202': ['CS', '1', 'TypeOfDetectorMotion'],
        '0x0210': ['IS', '1-n', 'TriggerVector'],
        '0x0211': ['US', '1', 'NumberOfTriggersInPhase'],
        '0x0220': ['SQ', '1', 'ViewCodeSequence'],
        '0x0222': ['SQ', '1', 'ViewAngulationModifierCodeSequence'],
        '0x0300': ['SQ', '1', 'RadionuclideCodeSequence'],
        '0x0302': ['SQ', '1', 'AdministrationRouteCodeSequence'],
        '0x0304': ['SQ', '1', 'RadiopharmaceuticalCodeSequence'],
        '0x0306': ['SQ', '1', 'CalibrationDataSequence'],
        '0x0308': ['US', '1', 'EnergyWindowNumber'],
        '0x0400': ['SH', '1', 'ImageID'],
        '0x0410': ['SQ', '1', 'PatientOrientationCodeSequence'],
        '0x0412': ['SQ', '1', 'PatientOrientationModifierCodeSequence'],
        '0x0414': ['SQ', '1', 'PatientGantryRelationshipCodeSequence'],
        '0x1000': ['CS', '2', 'SeriesType'],
        '0x1001': ['CS', '1', 'Units'],
        '0x1002': ['CS', '1', 'CountsSource'],
        '0x1004': ['CS', '1', 'ReprojectionMethod'],
        '0x1100': ['CS', '1', 'RandomsCorrectionMethod'],
        '0x1101': ['LO', '1', 'AttenuationCorrectionMethod'],
        '0x1102': ['CS', '1', 'DecayCorrection'],
        '0x1103': ['LO', '1', 'ReconstructionMethod'],
        '0x1104': ['LO', '1', 'DetectorLinesOfResponseUsed'],
        '0x1105': ['LO', '1', 'ScatterCorrectionMethod'],
        '0x1200': ['DS', '1', 'AxialAcceptance'],
        '0x1201': ['IS', '2', 'AxialMash'],
        '0x1202': ['IS', '1', 'TransverseMash'],
        '0x1203': ['DS', '2', 'DetectorElementSize'],
        '0x1210': ['DS', '1', 'CoincidenceWindowWidth'],
        '0x1220': ['CS', '1-n', 'SecondaryCountsType'],
        '0x1300': ['DS', '1', 'FrameReferenceTime'],
        '0x1310': ['IS', '1', 'PrimaryPromptsCountsAccumulated'],
        '0x1311': ['IS', '1-n', 'SecondaryCountsAccumulated'],
        '0x1320': ['DS', '1', 'SliceSensitivityFactor'],
        '0x1321': ['DS', '1', 'DecayFactor'],
        '0x1322': ['DS', '1', 'DoseCalibrationFactor'],
        '0x1323': ['DS', '1', 'ScatterFractionFactor'],
        '0x1324': ['DS', '1', 'DeadTimeFactor'],
        '0x1330': ['US', '1', 'ImageIndex'],
        '0x1400': ['CS', '1-n', 'CountsIncluded'],
        '0x1401': ['CS', '1', 'DeadTimeCorrectionFlag'],
    },
    '0x0060': {
        '0x0000': ['UL', '1', 'HistogramGroupLength'],
        '0x3000': ['SQ', '1', 'HistogramSequence'],
        '0x3002': ['US', '1', 'HistogramNumberofBins'],
        '0x3004': ['US/SS', '1', 'HistogramFirstBinValue'],
        '0x3006': ['US/SS', '1', 'HistogramLastBinValue'],
        '0x3008': ['US', '1', 'HistogramBinWidth'],
        '0x3010': ['LO', '1', 'HistogramExplanation'],
        '0x3020': ['UL', '1-n', 'HistogramData'],
    },
    '0x0070': {
        '0x0001': ['SQ', '1', 'GraphicAnnotationSequence'],
        '0x0002': ['CS', '1', 'GraphicLayer'],
        '0x0003': ['CS', '1', 'BoundingBoxAnnotationUnits'],
        '0x0004': ['CS', '1', 'AnchorPointAnnotationUnits'],
        '0x0005': ['CS', '1', 'GraphicAnnotationUnits'],
        '0x0006': ['ST', '1', 'UnformattedTextValue'],
        '0x0008': ['SQ', '1', 'TextObjectSequence'],
        '0x0009': ['SQ', '1', 'GraphicObjectSequence'],
        '0x0010': ['FL', '2', 'BoundingBoxTopLeftHandCorner'],
        '0x0011': ['FL', '2', 'BoundingBoxBottomRightHandCorner'],
        '0x0012': ['CS', '1', 'BoundingBoxTextHorizontalJustification'],
        '0x0014': ['FL', '2', 'AnchorPoint'],
        '0x0015': ['CS', '1', 'AnchorPointVisibility'],
        '0x0020': ['US', '1', 'GraphicDimensions'],
        '0x0021': ['US', '1', 'NumberOfGraphicPoints'],
        '0x0022': ['FL', '2-n', 'GraphicData'],
        '0x0023': ['CS', '1', 'GraphicType'],
        '0x0024': ['CS', '1', 'GraphicFilled'],
        '0x0040': ['IS', '1', 'ImageRotationFrozenDraftRetired'],
        '0x0041': ['CS', '1', 'ImageHorizontalFlip'],
        '0x0042': ['US', '1', 'ImageRotation'],
        '0x0050': ['US', '2', 'DisplayedAreaTLHCFrozenDraftRetired'],
        '0x0051': ['US', '2', 'DisplayedAreaBRHCFrozenDraftRetired'],
        '0x0052': ['SL', '2', 'DisplayedAreaTopLeftHandCorner'],
        '0x0053': ['SL', '2', 'DisplayedAreaBottomRightHandCorner'],
        '0x005A': ['SQ', '1', 'DisplayedAreaSelectionSequence'],
        '0x0060': ['SQ', '1', 'GraphicLayerSequence'],
        '0x0062': ['IS', '1', 'GraphicLayerOrder'],
        '0x0066': ['US', '1', 'GraphicLayerRecommendedDisplayGrayscaleValue'],
        '0x0067': ['US', '3', 'GraphicLayerRecommendedDisplayRGBValue'],
        '0x0068': ['LO', '1', 'GraphicLayerDescription'],
        '0x0080': ['CS', '1', 'PresentationLabel'],
        '0x0081': ['LO', '1', 'PresentationDescription'],
        '0x0082': ['DA', '1', 'PresentationCreationDate'],
        '0x0083': ['TM', '1', 'PresentationCreationTime'],
        '0x0084': ['PN', '1', 'PresentationCreatorsName'],
        '0x0100': ['CS', '1', 'PresentationSizeMode'],
        '0x0101': ['DS', '2', 'PresentationPixelSpacing'],
        '0x0102': ['IS', '2', 'PresentationPixelAspectRatio'],
        '0x0103': ['FL', '1', 'PresentationPixelMagnificationRatio'],
    },
    '0x0088': {
        '0x0000': ['UL', '1', 'StorageGroupLength'],
        '0x0130': ['SH', '1', 'StorageMediaFilesetID'],
        '0x0140': ['UI', '1', 'StorageMediaFilesetUID'],
        '0x0200': ['SQ', '1', 'IconImage'],
        '0x0904': ['LO', '1', 'TopicTitle'],
        '0x0906': ['ST', '1', 'TopicSubject'],
        '0x0910': ['LO', '1', 'TopicAuthor'],
        '0x0912': ['LO', '3', 'TopicKeyWords'],
    },
    '0x1000': {
        '0x0000': ['UL', '1', 'CodeTableGroupLength'],
        '0x0010': ['US', '3', 'EscapeTriplet'],
        '0x0011': ['US', '3', 'RunLengthTriplet'],
        '0x0012': ['US', '1', 'HuffmanTableSize'],
        '0x0013': ['US', '3', 'HuffmanTableTriplet'],
        '0x0014': ['US', '1', 'ShiftTableSize'],
        '0x0015': ['US', '3', 'ShiftTableTriplet'],
    },
    '0x1010': {
        '0x0000': ['UL', '1', 'ZonalMapGroupLength'],
        '0x0004': ['US', '1-n', 'ZonalMap'],
    },
    '0x2000': {
        '0x0000': ['UL', '1', 'FilmSessionGroupLength'],
        '0x0010': ['IS', '1', 'NumberOfCopies'],
        '0x001E': ['SQ', '1', 'PrinterConfigurationSequence'],
        '0x0020': ['CS', '1', 'PrintPriority'],
        '0x0030': ['CS', '1', 'MediumType'],
        '0x0040': ['CS', '1', 'FilmDestination'],
        '0x0050': ['LO', '1', 'FilmSessionLabel'],
        '0x0060': ['IS', '1', 'MemoryAllocation'],
        '0x0061': ['IS', '1', 'MaximumMemoryAllocation'],
        '0x0062': ['CS', '1', 'ColorImagePrintingFlag'],
        '0x0063': ['CS', '1', 'CollationFlag'],
        '0x0065': ['CS', '1', 'AnnotationFlag'],
        '0x0067': ['CS', '1', 'ImageOverlayFlag'],
        '0x0069': ['CS', '1', 'PresentationLUTFlag'],
        '0x006A': ['CS', '1', 'ImageBoxPresentationLUTFlag'],
        '0x00A0': ['US', '1', 'MemoryBitDepth'],
        '0x00A1': ['US', '1', 'PrintingBitDepth'],
        '0x00A2': ['SQ', '1', 'MediaInstalledSequence'],
        '0x00A4': ['SQ', '1', 'OtherMediaAvailableSequence'],
        '0x00A8': ['SQ', '1', 'SupportedImageDisplayFormatsSequence'],
        '0x0500': ['SQ', '1', 'ReferencedFilmBoxSequence'],
        '0x0510': ['SQ', '1', 'ReferencedStoredPrintSequence'],
    },
    '0x2010': {
        '0x0000': ['UL', '1', 'FilmBoxGroupLength'],
        '0x0010': ['ST', '1', 'ImageDisplayFormat'],
        '0x0030': ['CS', '1', 'AnnotationDisplayFormatID'],
        '0x0040': ['CS', '1', 'FilmOrientation'],
        '0x0050': ['CS', '1', 'FilmSizeID'],
        '0x0052': ['CS', '1', 'PrinterResolutionID'],
        '0x0054': ['CS', '1', 'DefaultPrinterResolutionID'],
        '0x0060': ['CS', '1', 'MagnificationType'],
        '0x0080': ['CS', '1', 'SmoothingType'],
        '0x00A6': ['CS', '1', 'DefaultMagnificationType'],
        '0x00A7': ['CS', '1-n', 'OtherMagnificationTypesAvailable'],
        '0x00A8': ['CS', '1', 'DefaultSmoothingType'],
        '0x00A9': ['CS', '1-n', 'OtherSmoothingTypesAvailable'],
        '0x0100': ['CS', '1', 'BorderDensity'],
        '0x0110': ['CS', '1', 'EmptyImageDensity'],
        '0x0120': ['US', '1', 'MinDensity'],
        '0x0130': ['US', '1', 'MaxDensity'],
        '0x0140': ['CS', '1', 'Trim'],
        '0x0150': ['ST', '1', 'ConfigurationInformation'],
        '0x0152': ['LT', '1', 'ConfigurationInformationDescription'],
        '0x0154': ['IS', '1', 'MaximumCollatedFilms'],
        '0x015E': ['US', '1', 'Illumination'],
        '0x0160': ['US', '1', 'ReflectedAmbientLight'],
        '0x0376': ['DS', '2', 'PrinterPixelSpacing'],
        '0x0500': ['SQ', '1', 'ReferencedFilmSessionSequence'],
        '0x0510': ['SQ', '1', 'ReferencedImageBoxSequence'],
        '0x0520': ['SQ', '1', 'ReferencedBasicAnnotationBoxSequence'],
    },
    '0x2020': {
        '0x0000': ['UL', '1', 'ImageBoxGroupLength'],
        '0x0010': ['US', '1', 'ImageBoxPosition'],
        '0x0020': ['CS', '1', 'Polarity'],
        '0x0030': ['DS', '1', 'RequestedImageSize'],
        '0x0040': ['CS', '1', 'RequestedDecimateCropBehavior'],
        '0x0050': ['CS', '1', 'RequestedResolutionID'],
        '0x00A0': ['CS', '1', 'RequestedImageSizeFlag'],
        '0x00A2': ['CS', '1', 'DecimateCropResult'],
        '0x0110': ['SQ', '1', 'PreformattedGrayscaleImageSequence'],
        '0x0111': ['SQ', '1', 'PreformattedColorImageSequence'],
        '0x0130': ['SQ', '1', 'ReferencedImageOverlayBoxSequence'],
        '0x0140': ['SQ', '1', 'ReferencedVOILUTBoxSequence'],
    },
    '0x2030': {
        '0x0000': ['UL', '1', 'AnnotationGroupLength'],
        '0x0010': ['US', '1', 'AnnotationPosition'],
        '0x0020': ['LO', '1', 'TextString'],
    },
    '0x2040': {
        '0x0000': ['UL', '1', 'OverlayBoxGroupLength'],
        '0x0010': ['SQ', '1', 'ReferencedOverlayPlaneSequence'],
        '0x0011': ['US', '9', 'ReferencedOverlayPlaneGroups'],
        '0x0020': ['SQ', '1', 'OverlayPixelDataSequence'],
        '0x0060': ['CS', '1', 'OverlayMagnificationType'],
        '0x0070': ['CS', '1', 'OverlaySmoothingType'],
        '0x0072': ['CS', '1', 'OverlayOrImageMagnification'],
        '0x0074': ['US', '1', 'MagnifyToNumberOfColumns'],
        '0x0080': ['CS', '1', 'OverlayForegroundDensity'],
        '0x0082': ['CS', '1', 'OverlayBackgroundDensity'],
        '0x0090': ['CS', '1', 'OverlayMode'],
        '0x0100': ['CS', '1', 'ThresholdDensity'],
        '0x0500': ['SQ', '1', 'ReferencedOverlayImageBoxSequence'],
    },
    '0x2050': {
        '0x0000': ['UL', '1', 'PresentationLUTGroupLength'],
        '0x0010': ['SQ', '1', 'PresentationLUTSequence'],
        '0x0020': ['CS', '1', 'PresentationLUTShape'],
        '0x0500': ['SQ', '1', 'ReferencedPresentationLUTSequence'],
    },
    '0x2100': {
        '0x0000': ['UL', '1', 'PrintJobGroupLength'],
        '0x0010': ['SH', '1', 'PrintJobID'],
        '0x0020': ['CS', '1', 'ExecutionStatus'],
        '0x0030': ['CS', '1', 'ExecutionStatusInfo'],
        '0x0040': ['DA', '1', 'CreationDate'],
        '0x0050': ['TM', '1', 'CreationTime'],
        '0x0070': ['AE', '1', 'Originator'],
        '0x0140': ['AE', '1', 'DestinationAE'],
        '0x0160': ['SH', '1', 'OwnerID'],
        '0x0170': ['IS', '1', 'NumberOfFilms'],
        '0x0500': ['SQ', '1', 'ReferencedPrintJobSequence'],
    },
    '0x2110': {
        '0x0000': ['UL', '1', 'PrinterGroupLength'],
        '0x0010': ['CS', '1', 'PrinterStatus'],
        '0x0020': ['CS', '1', 'PrinterStatusInfo'],
        '0x0030': ['LO', '1', 'PrinterName'],
        '0x0099': ['SH', '1', 'PrintQueueID'],
    },
    '0x2120': {
        '0x0000': ['UL', '1', 'QueueGroupLength'],
        '0x0010': ['CS', '1', 'QueueStatus'],
        '0x0050': ['SQ', '1', 'PrintJobDescriptionSequence'],
        '0x0070': ['SQ', '1', 'QueueReferencedPrintJobSequence'],
    },
    '0x2130': {
        '0x0000': ['UL', '1', 'PrintContentGroupLength'],
        '0x0010': ['SQ', '1', 'PrintManagementCapabilitiesSequence'],
        '0x0015': ['SQ', '1', 'PrinterCharacteristicsSequence'],
        '0x0030': ['SQ', '1', 'FilmBoxContentSequence'],
        '0x0040': ['SQ', '1', 'ImageBoxContentSequence'],
        '0x0050': ['SQ', '1', 'AnnotationContentSequence'],
        '0x0060': ['SQ', '1', 'ImageOverlayBoxContentSequence'],
        '0x0080': ['SQ', '1', 'PresentationLUTContentSequence'],
        '0x00A0': ['SQ', '1', 'ProposedStudySequence'],
        '0x00C0': ['SQ', '1', 'OriginalImageSequence'],
    },
    '0x3002': {
        '0x0000': ['UL', '1', 'RTImageGroupLength'],
        '0x0002': ['SH', '1', 'RTImageLabel'],
        '0x0003': ['LO', '1', 'RTImageName'],
        '0x0004': ['ST', '1', 'RTImageDescription'],
        '0x000A': ['CS', '1', 'ReportedValuesOrigin'],
        '0x000C': ['CS', '1', 'RTImagePlane'],
        '0x000D': ['DS', '3', 'XRayImageReceptorTranslation'],
        '0x000E': ['DS', '1', 'XRayImageReceptorAngle'],
        '0x0010': ['DS', '6', 'RTImageOrientation'],
        '0x0011': ['DS', '2', 'ImagePlanePixelSpacing'],
        '0x0012': ['DS', '2', 'RTImagePosition'],
        '0x0020': ['SH', '1', 'RadiationMachineName'],
        '0x0022': ['DS', '1', 'RadiationMachineSAD'],
        '0x0024': ['DS', '1', 'RadiationMachineSSD'],
        '0x0026': ['DS', '1', 'RTImageSID'],
        '0x0028': ['DS', '1', 'SourceToReferenceObjectDistance'],
        '0x0029': ['IS', '1', 'FractionNumber'],
        '0x0030': ['SQ', '1', 'ExposureSequence'],
        '0x0032': ['DS', '1', 'MetersetExposure'],
        '0x0034': ['DS', '4', 'DiaphragmPosition'],
    },
    '0x3004': {
        '0x0000': ['UL', '1', 'RTDoseGroupLength'],
        '0x0001': ['CS', '1', 'DVHType'],
        '0x0002': ['CS', '1', 'DoseUnits'],
        '0x0004': ['CS', '1', 'DoseType'],
        '0x0006': ['LO', '1', 'DoseComment'],
        '0x0008': ['DS', '3', 'NormalizationPoint'],
        '0x000A': ['CS', '1', 'DoseSummationType'],
        '0x000C': ['DS', '2-n', 'GridFrameOffsetVector'],
        '0x000E': ['DS', '1', 'DoseGridScaling'],
        '0x0010': ['SQ', '1', 'RTDoseROISequence'],
        '0x0012': ['DS', '1', 'DoseValue'],
        '0x0040': ['DS', '3', 'DVHNormalizationPoint'],
        '0x0042': ['DS', '1', 'DVHNormalizationDoseValue'],
        '0x0050': ['SQ', '1', 'DVHSequence'],
        '0x0052': ['DS', '1', 'DVHDoseScaling'],
        '0x0054': ['CS', '1', 'DVHVolumeUnits'],
        '0x0056': ['IS', '1', 'DVHNumberOfBins'],
        '0x0058': ['DS', '2-2n', 'DVHData'],
        '0x0060': ['SQ', '1', 'DVHReferencedROISequence'],
        '0x0062': ['CS', '1', 'DVHROIContributionType'],
        '0x0070': ['DS', '1', 'DVHMinimumDose'],
        '0x0072': ['DS', '1', 'DVHMaximumDose'],
        '0x0074': ['DS', '1', 'DVHMeanDose'],
    },
    '0x3006': {
        '0x0000': ['UL', '1', 'RTStructureSetGroupLength'],
        '0x0002': ['SH', '1', 'StructureSetLabel'],
        '0x0004': ['LO', '1', 'StructureSetName'],
        '0x0006': ['ST', '1', 'StructureSetDescription'],
        '0x0008': ['DA', '1', 'StructureSetDate'],
        '0x0009': ['TM', '1', 'StructureSetTime'],
        '0x0010': ['SQ', '1', 'ReferencedFrameOfReferenceSequence'],
        '0x0012': ['SQ', '1', 'RTReferencedStudySequence'],
        '0x0014': ['SQ', '1', 'RTReferencedSeriesSequence'],
        '0x0016': ['SQ', '1', 'ContourImageSequence'],
        '0x0020': ['SQ', '1', 'StructureSetROISequence'],
        '0x0022': ['IS', '1', 'ROINumber'],
        '0x0024': ['UI', '1', 'ReferencedFrameOfReferenceUID'],
        '0x0026': ['LO', '1', 'ROIName'],
        '0x0028': ['ST', '1', 'ROIDescription'],
        '0x002A': ['IS', '3', 'ROIDisplayColor'],
        '0x002C': ['DS', '1', 'ROIVolume'],
        '0x0030': ['SQ', '1', 'RTRelatedROISequence'],
        '0x0033': ['CS', '1', 'RTROIRelationship'],
        '0x0036': ['CS', '1', 'ROIGenerationAlgorithm'],
        '0x0038': ['LO', '1', 'ROIGenerationDescription'],
        '0x0039': ['SQ', '1', 'ROIContourSequence'],
        '0x0040': ['SQ', '1', 'ContourSequence'],
        '0x0042': ['CS', '1', 'ContourGeometricType'],
        '0x0044': ['DS', '1', 'ContourSlabThickness'],
        '0x0045': ['DS', '3', 'ContourOffsetVector'],
        '0x0046': ['IS', '1', 'NumberOfContourPoints'],
        '0x0048': ['IS', '1', 'ContourNumber'],
        '0x0049': ['IS', '1-n', 'AttachedContours'],
        '0x0050': ['DS', '3-3n', 'ContourData'],
        '0x0080': ['SQ', '1', 'RTROIObservationsSequence'],
        '0x0082': ['IS', '1', 'ObservationNumber'],
        '0x0084': ['IS', '1', 'ReferencedROINumber'],
        '0x0085': ['SH', '1', 'ROIObservationLabel'],
        '0x0086': ['SQ', '1', 'RTROIIdentificationCodeSequence'],
        '0x0088': ['ST', '1', 'ROIObservationDescription'],
        '0x00A0': ['SQ', '1', 'RelatedRTROIObservationsSequence'],
        '0x00A4': ['CS', '1', 'RTROIInterpretedType'],
        '0x00A6': ['PN', '1', 'ROIInterpreter'],
        '0x00B0': ['SQ', '1', 'ROIPhysicalPropertiesSequence'],
        '0x00B2': ['CS', '1', 'ROIPhysicalProperty'],
        '0x00B4': ['DS', '1', 'ROIPhysicalPropertyValue'],
        '0x00C0': ['SQ', '1', 'FrameOfReferenceRelationshipSequence'],
        '0x00C2': ['UI', '1', 'RelatedFrameOfReferenceUID'],
        '0x00C4': ['CS', '1', 'FrameOfReferenceTransformationType'],
        '0x00C6': ['DS', '16', 'FrameOfReferenceTransformationMatrix'],
        '0x00C8': ['LO', '1', 'FrameOfReferenceTransformationComment'],
    },
    '0x3008': {
        '0x0010': ['SQ', '1', 'MeasuredDoseReferenceSequence'],
        '0x0012': ['ST', '1', 'MeasuredDoseDescription'],
        '0x0014': ['CS', '1', 'MeasuredDoseType'],
        '0x0016': ['DS', '1', 'MeasuredDoseValue'],
        '0x0020': ['SQ', '1', 'TreatmentSessionBeamSequence'],
        '0x0022': ['IS', '1', 'CurrentFractionNumber'],
        '0x0024': ['DA', '1', 'TreatmentControlPointDate'],
        '0x0025': ['TM', '1', 'TreatmentControlPointTime'],
        '0x002A': ['CS', '1', 'TreatmentTerminationStatus'],
        '0x002B': ['SH', '1', 'TreatmentTerminationCode'],
        '0x002C': ['CS', '1', 'TreatmentVerificationStatus'],
        '0x0030': ['SQ', '1', 'ReferencedTreatmentRecordSequence'],
        '0x0032': ['DS', '1', 'SpecifiedPrimaryMeterset'],
        '0x0033': ['DS', '1', 'SpecifiedSecondaryMeterset'],
        '0x0036': ['DS', '1', 'DeliveredPrimaryMeterset'],
        '0x0037': ['DS', '1', 'DeliveredSecondaryMeterset'],
        '0x003A': ['DS', '1', 'SpecifiedTreatmentTime'],
        '0x003B': ['DS', '1', 'DeliveredTreatmentTime'],
        '0x0040': ['SQ', '1', 'ControlPointDeliverySequence'],
        '0x0042': ['DS', '1', 'SpecifiedMeterset'],
        '0x0044': ['DS', '1', 'DeliveredMeterset'],
        '0x0048': ['DS', '1', 'DoseRateDelivered'],
        '0x0050': ['SQ', '1', 'TreatmentSummaryCalculatedDoseReferenceSequence'],
        '0x0052': ['DS', '1', 'CumulativeDosetoDoseReference'],
        '0x0054': ['DA', '1', 'FirstTreatmentDate'],
        '0x0056': ['DA', '1', 'MostRecentTreatmentDate'],
        '0x005A': ['IS', '1', 'NumberofFractionsDelivered'],
        '0x0060': ['SQ', '1', 'OverrideSequence'],
        '0x0062': ['AT', '1', 'OverrideParameterPointer'],
        '0x0064': ['IS', '1', 'MeasuredDoseReferenceNumber'],
        '0x0066': ['ST', '1', 'OverrideReason'],
        '0x0070': ['SQ', '1', 'CalculatedDoseReferenceSequence'],
        '0x0072': ['IS', '1', 'CalculatedDoseReferenceNumber'],
        '0x0074': ['ST', '1', 'CalculatedDoseReferenceDescription'],
        '0x0076': ['DS', '1', 'CalculatedDoseReferenceDoseValue'],
        '0x0078': ['DS', '1', 'StartMeterset'],
        '0x007A': ['DS', '1', 'EndMeterset'],
        '0x0080': ['SQ', '1', 'ReferencedMeasuredDoseReferenceSequence'],
        '0x0082': ['IS', '1', 'ReferencedMeasuredDoseReferenceNumber'],
        '0x0090': ['SQ', '1', 'ReferencedCalculatedDoseReferenceSequence'],
        '0x0092': ['IS', '1', 'ReferencedCalculatedDoseReferenceNumber'],
        '0x00A0': ['SQ', '1', 'BeamLimitingDeviceLeafPairsSequence'],
        '0x00B0': ['SQ', '1', 'RecordedWedgeSequence'],
        '0x00C0': ['SQ', '1', 'RecordedCompensatorSequence'],
        '0x00D0': ['SQ', '1', 'RecordedBlockSequence'],
        '0x00E0': ['SQ', '1', 'TreatmentSummaryMeasuredDoseReferenceSequence'],
        '0x0100': ['SQ', '1', 'RecordedSourceSequence'],
        '0x0105': ['LO', '1', 'SourceSerialNumber'],
        '0x0110': ['SQ', '1', 'TreatmentSessionApplicationSetupSequence'],
        '0x0116': ['CS', '1', 'ApplicationSetupCheck'],
        '0x0120': ['SQ', '1', 'RecordedBrachyAccessoryDeviceSequence'],
        '0x0122': ['IS', '1', 'ReferencedBrachyAccessoryDeviceNumber'],
        '0x0130': ['SQ', '1', 'RecordedChannelSequence'],
        '0x0132': ['DS', '1', 'SpecifiedChannelTotalTime'],
        '0x0134': ['DS', '1', 'DeliveredChannelTotalTime'],
        '0x0136': ['IS', '1', 'SpecifiedNumberofPulses'],
        '0x0138': ['IS', '1', 'DeliveredNumberofPulses'],
        '0x013A': ['DS', '1', 'SpecifiedPulseRepetitionInterval'],
        '0x013C': ['DS', '1', 'DeliveredPulseRepetitionInterval'],
        '0x0140': ['SQ', '1', 'RecordedSourceApplicatorSequence'],
        '0x0142': ['IS', '1', 'ReferencedSourceApplicatorNumber'],
        '0x0150': ['SQ', '1', 'RecordedChannelShieldSequence'],
        '0x0152': ['IS', '1', 'ReferencedChannelShieldNumber'],
        '0x0160': ['SQ', '1', 'BrachyControlPointDeliveredSequence'],
        '0x0162': ['DA', '1', 'SafePositionExitDate'],
        '0x0164': ['TM', '1', 'SafePositionExitTime'],
        '0x0166': ['DA', '1', 'SafePositionReturnDate'],
        '0x0168': ['TM', '1', 'SafePositionReturnTime'],
        '0x0200': ['CS', '1', 'CurrentTreatmentStatus'],
        '0x0202': ['ST', '1', 'TreatmentStatusComment'],
        '0x0220': ['SQ', '1', 'FractionGroupSummarySequence'],
        '0x0223': ['IS', '1', 'ReferencedFractionNumber'],
        '0x0224': ['CS', '1', 'FractionGroupType'],
        '0x0230': ['CS', '1', 'BeamStopperPosition'],
        '0x0240': ['SQ', '1', 'FractionStatusSummarySequence'],
        '0x0250': ['DA', '1', 'TreatmentDate'],
        '0x0251': ['TM', '1', 'TreatmentTime'],
    },
    '0x300A': {
        '0x0000': ['UL', '1', 'RTPlanGroupLength'],
        '0x0002': ['SH', '1', 'RTPlanLabel'],
        '0x0003': ['LO', '1', 'RTPlanName'],
        '0x0004': ['ST', '1', 'RTPlanDescription'],
        '0x0006': ['DA', '1', 'RTPlanDate'],
        '0x0007': ['TM', '1', 'RTPlanTime'],
        '0x0009': ['LO', '1-n', 'TreatmentProtocols'],
        '0x000A': ['CS', '1', 'TreatmentIntent'],
        '0x000B': ['LO', '1-n', 'TreatmentSites'],
        '0x000C': ['CS', '1', 'RTPlanGeometry'],
        '0x000E': ['ST', '1', 'PrescriptionDescription'],
        '0x0010': ['SQ', '1', 'DoseReferenceSequence'],
        '0x0012': ['IS', '1', 'DoseReferenceNumber'],
        '0x0014': ['CS', '1', 'DoseReferenceStructureType'],
        '0x0015': ['CS', '1', 'NominalBeamEnergyUnit'],
        '0x0016': ['LO', '1', 'DoseReferenceDescription'],
        '0x0018': ['DS', '3', 'DoseReferencePointCoordinates'],
        '0x001A': ['DS', '1', 'NominalPriorDose'],
        '0x0020': ['CS', '1', 'DoseReferenceType'],
        '0x0021': ['DS', '1', 'ConstraintWeight'],
        '0x0022': ['DS', '1', 'DeliveryWarningDose'],
        '0x0023': ['DS', '1', 'DeliveryMaximumDose'],
        '0x0025': ['DS', '1', 'TargetMinimumDose'],
        '0x0026': ['DS', '1', 'TargetPrescriptionDose'],
        '0x0027': ['DS', '1', 'TargetMaximumDose'],
        '0x0028': ['DS', '1', 'TargetUnderdoseVolumeFraction'],
        '0x002A': ['DS', '1', 'OrganAtRiskFullVolumeDose'],
        '0x002B': ['DS', '1', 'OrganAtRiskLimitDose'],
        '0x002C': ['DS', '1', 'OrganAtRiskMaximumDose'],
        '0x002D': ['DS', '1', 'OrganAtRiskOverdoseVolumeFraction'],
        '0x0040': ['SQ', '1', 'ToleranceTableSequence'],
        '0x0042': ['IS', '1', 'ToleranceTableNumber'],
        '0x0043': ['SH', '1', 'ToleranceTableLabel'],
        '0x0044': ['DS', '1', 'GantryAngleTolerance'],
        '0x0046': ['DS', '1', 'BeamLimitingDeviceAngleTolerance'],
        '0x0048': ['SQ', '1', 'BeamLimitingDeviceToleranceSequence'],
        '0x004A': ['DS', '1', 'BeamLimitingDevicePositionTolerance'],
        '0x004C': ['DS', '1', 'PatientSupportAngleTolerance'],
        '0x004E': ['DS', '1', 'TableTopEccentricAngleTolerance'],
        '0x0051': ['DS', '1', 'TableTopVerticalPositionTolerance'],
        '0x0052': ['DS', '1', 'TableTopLongitudinalPositionTolerance'],
        '0x0053': ['DS', '1', 'TableTopLateralPositionTolerance'],
        '0x0055': ['CS', '1', 'RTPlanRelationship'],
        '0x0070': ['SQ', '1', 'FractionGroupSequence'],
        '0x0071': ['IS', '1', 'FractionGroupNumber'],
        '0x0078': ['IS', '1', 'NumberOfFractionsPlanned'],
        // '0x0079': ['IS','1','NumberOfFractionsPerDay'], /// Changed
        '0x0079': ['IS', '1', 'NumberOfFractionsPatternDigistsPerDay'],
        '0x007A': ['IS', '1', 'RepeatFractionCycleLength'],
        '0x007B': ['LT', '1', 'FractionPattern'],
        '0x0080': ['IS', '1', 'NumberOfBeams'],
        '0x0082': ['DS', '3', 'BeamDoseSpecificationPoint'],
        '0x0084': ['DS', '1', 'BeamDose'],
        '0x0086': ['DS', '1', 'BeamMeterset'],
        '0x00A0': ['IS', '1', 'NumberOfBrachyApplicationSetups'],
        '0x00A2': ['DS', '3', 'BrachyApplicationSetupDoseSpecificationPoint'],
        '0x00A4': ['DS', '1', 'BrachyApplicationSetupDose'],
        '0x00B0': ['SQ', '1', 'BeamSequence'],
        '0x00B2': ['SH', '1', 'TreatmentMachineName'],
        '0x00B3': ['CS', '1', 'PrimaryDosimeterUnit'],
        '0x00B4': ['DS', '1', 'SourceAxisDistance'],
        '0x00B6': ['SQ', '1', 'BeamLimitingDeviceSequence'],
        '0x00B8': ['CS', '1', 'RTBeamLimitingDeviceType'],
        '0x00BA': ['DS', '1', 'SourceToBeamLimitingDeviceDistance'],
        '0x00BC': ['IS', '1', 'NumberOfLeafJawPairs'],
        '0x00BE': ['DS', '3-n', 'LeafPositionBoundaries'],
        '0x00C0': ['IS', '1', 'BeamNumber'],
        '0x00C2': ['LO', '1', 'BeamName'],
        '0x00C3': ['ST', '1', 'BeamDescription'],
        '0x00C4': ['CS', '1', 'BeamType'],
        '0x00C6': ['CS', '1', 'RadiationType'],
        '0x00C8': ['IS', '1', 'ReferenceImageNumber'],
        '0x00CA': ['SQ', '1', 'PlannedVerificationImageSequence'],
        '0x00CC': ['LO', '1-n', 'ImagingDeviceSpecificAcquisitionParameters'],
        '0x00CE': ['CS', '1', 'TreatmentDeliveryType'],
        '0x00D0': ['IS', '1', 'NumberOfWedges'],
        '0x00D1': ['SQ', '1', 'WedgeSequence'],
        '0x00D2': ['IS', '1', 'WedgeNumber'],
        '0x00D3': ['CS', '1', 'WedgeType'],
        '0x00D4': ['SH', '1', 'WedgeID'],
        '0x00D5': ['IS', '1', 'WedgeAngle'],
        '0x00D6': ['DS', '1', 'WedgeFactor'],
        '0x00D8': ['DS', '1', 'WedgeOrientation'],
        '0x00DA': ['DS', '1', 'SourceToWedgeTrayDistance'],
        '0x00E0': ['IS', '1', 'NumberOfCompensators'],
        '0x00E1': ['SH', '1', 'MaterialID'],
        '0x00E2': ['DS', '1', 'TotalCompensatorTrayFactor'],
        '0x00E3': ['SQ', '1', 'CompensatorSequence'],
        '0x00E4': ['IS', '1', 'CompensatorNumber'],
        '0x00E5': ['SH', '1', 'CompensatorID'],
        '0x00E6': ['DS', '1', 'SourceToCompensatorTrayDistance'],
        '0x00E7': ['IS', '1', 'CompensatorRows'],
        '0x00E8': ['IS', '1', 'CompensatorColumns'],
        '0x00E9': ['DS', '2', 'CompensatorPixelSpacing'],
        '0x00EA': ['DS', '2', 'CompensatorPosition'],
        '0x00EB': ['DS', '1-n', 'CompensatorTransmissionData'],
        '0x00EC': ['DS', '1-n', 'CompensatorThicknessData'],
        '0x00ED': ['IS', '1', 'NumberOfBoli'],
        '0x00EE': ['CS', '1', 'CompensatorType'],
        '0x00F0': ['IS', '1', 'NumberOfBlocks'],
        '0x00F2': ['DS', '1', 'TotalBlockTrayFactor'],
        '0x00F4': ['SQ', '1', 'BlockSequence'],
        '0x00F5': ['SH', '1', 'BlockTrayID'],
        '0x00F6': ['DS', '1', 'SourceToBlockTrayDistance'],
        '0x00F8': ['CS', '1', 'BlockType'],
        '0x00FA': ['CS', '1', 'BlockDivergence'],
        '0x00FC': ['IS', '1', 'BlockNumber'],
        '0x00FE': ['LO', '1', 'BlockName'],
        '0x0100': ['DS', '1', 'BlockThickness'],
        '0x0102': ['DS', '1', 'BlockTransmission'],
        '0x0104': ['IS', '1', 'BlockNumberOfPoints'],
        '0x0106': ['DS', '2-2n', 'BlockData'],
        '0x0107': ['SQ', '1', 'ApplicatorSequence'],
        '0x0108': ['SH', '1', 'ApplicatorID'],
        '0x0109': ['CS', '1', 'ApplicatorType'],
        '0x010A': ['LO', '1', 'ApplicatorDescription'],
        '0x010C': ['DS', '1', 'CumulativeDoseReferenceCoefficient'],
        '0x010E': ['DS', '1', 'FinalCumulativeMetersetWeight'],
        '0x0110': ['IS', '1', 'NumberOfControlPoints'],
        '0x0111': ['SQ', '1', 'ControlPointSequence'],
        '0x0112': ['IS', '1', 'ControlPointIndex'],
        '0x0114': ['DS', '1', 'NominalBeamEnergy'],
        '0x0115': ['DS', '1', 'DoseRateSet'],
        '0x0116': ['SQ', '1', 'WedgePositionSequence'],
        '0x0118': ['CS', '1', 'WedgePosition'],
        '0x011A': ['SQ', '1', 'BeamLimitingDevicePositionSequence'],
        '0x011C': ['DS', '2-2n', 'LeafJawPositions'],
        '0x011E': ['DS', '1', 'GantryAngle'],
        '0x011F': ['CS', '1', 'GantryRotationDirection'],
        '0x0120': ['DS', '1', 'BeamLimitingDeviceAngle'],
        '0x0121': ['CS', '1', 'BeamLimitingDeviceRotationDirection'],
        '0x0122': ['DS', '1', 'PatientSupportAngle'],
        '0x0123': ['CS', '1', 'PatientSupportRotationDirection'],
        '0x0124': ['DS', '1', 'TableTopEccentricAxisDistance'],
        '0x0125': ['DS', '1', 'TableTopEccentricAngle'],
        '0x0126': ['CS', '1', 'TableTopEccentricRotationDirection'],
        '0x0128': ['DS', '1', 'TableTopVerticalPosition'],
        '0x0129': ['DS', '1', 'TableTopLongitudinalPosition'],
        '0x012A': ['DS', '1', 'TableTopLateralPosition'],
        '0x012C': ['DS', '3', 'IsocenterPosition'],
        '0x012E': ['DS', '3', 'SurfaceEntryPoint'],
        '0x0130': ['DS', '1', 'SourceToSurfaceDistance'],
        '0x0134': ['DS', '1', 'CumulativeMetersetWeight'],
        '0x0140': ['FL', '1', 'TableTopPitchAngle'],
        '0x0142': ['CS', '1', 'TableTopPitchRotationDirection'],
        '0x0144': ['FL', '1', 'TableTopRollAngle'],
        '0x0146': ['CS', '1', 'TableTopRollRotationDirection'],
        '0x0148': ['FL', '1', 'HeadFixationAngle'],
        '0x014A': ['FL', '1', 'GantryPitchAngle'],
        '0x014C': ['CS', '1', 'GantryPitchRotationDirection'],
        '0x014E': ['FL', '1', 'GantryPitchAngleTolerance'],
        '0x0180': ['SQ', '1', 'PatientSetupSequence'],
        '0x0182': ['IS', '1', 'PatientSetupNumber'],
        '0x0184': ['LO', '1', 'PatientAdditionalPosition'],
        '0x0190': ['SQ', '1', 'FixationDeviceSequence'],
        '0x0192': ['CS', '1', 'FixationDeviceType'],
        '0x0194': ['SH', '1', 'FixationDeviceLabel'],
        '0x0196': ['ST', '1', 'FixationDeviceDescription'],
        '0x0198': ['SH', '1', 'FixationDevicePosition'],
        '0x01A0': ['SQ', '1', 'ShieldingDeviceSequence'],
        '0x01A2': ['CS', '1', 'ShieldingDeviceType'],
        '0x01A4': ['SH', '1', 'ShieldingDeviceLabel'],
        '0x01A6': ['ST', '1', 'ShieldingDeviceDescription'],
        '0x01A8': ['SH', '1', 'ShieldingDevicePosition'],
        '0x01B0': ['CS', '1', 'SetupTechnique'],
        '0x01B2': ['ST', '1', 'SetupTechniqueDescription'],
        '0x01B4': ['SQ', '1', 'SetupDeviceSequence'],
        '0x01B6': ['CS', '1', 'SetupDeviceType'],
        '0x01B8': ['SH', '1', 'SetupDeviceLabel'],
        '0x01BA': ['ST', '1', 'SetupDeviceDescription'],
        '0x01BC': ['DS', '1', 'SetupDeviceParameter'],
        '0x01D0': ['ST', '1', 'SetupReferenceDescription'],
        '0x01D2': ['DS', '1', 'TableTopVerticalSetupDisplacement'],
        '0x01D4': ['DS', '1', 'TableTopLongitudinalSetupDisplacement'],
        '0x01D6': ['DS', '1', 'TableTopLateralSetupDisplacement'],
        '0x0200': ['CS', '1', 'BrachyTreatmentTechnique'],
        '0x0202': ['CS', '1', 'BrachyTreatmentType'],
        '0x0206': ['SQ', '1', 'TreatmentMachineSequence'],
        '0x0210': ['SQ', '1', 'SourceSequence'],
        '0x0212': ['IS', '1', 'SourceNumber'],
        '0x0214': ['CS', '1', 'SourceType'],
        '0x0216': ['LO', '1', 'SourceManufacturer'],
        '0x0218': ['DS', '1', 'ActiveSourceDiameter'],
        '0x021A': ['DS', '1', 'ActiveSourceLength'],
        '0x0222': ['DS', '1', 'SourceEncapsulationNominalThickness'],
        '0x0224': ['DS', '1', 'SourceEncapsulationNominalTransmission'],
        '0x0226': ['LO', '1', 'SourceIsotopeName'],
        '0x0228': ['DS', '1', 'SourceIsotopeHalfLife'],
        '0x022A': ['DS', '1', 'ReferenceAirKermaRate'],
        '0x022C': ['DA', '1', 'AirKermaRateReferenceDate'],
        '0x022E': ['TM', '1', 'AirKermaRateReferenceTime'],
        '0x0230': ['SQ', '1', 'ApplicationSetupSequence'],
        '0x0232': ['CS', '1', 'ApplicationSetupType'],
        '0x0234': ['IS', '1', 'ApplicationSetupNumber'],
        '0x0236': ['LO', '1', 'ApplicationSetupName'],
        '0x0238': ['LO', '1', 'ApplicationSetupManufacturer'],
        '0x0240': ['IS', '1', 'TemplateNumber'],
        '0x0242': ['SH', '1', 'TemplateType'],
        '0x0244': ['LO', '1', 'TemplateName'],
        '0x0250': ['DS', '1', 'TotalReferenceAirKerma'],
        '0x0260': ['SQ', '1', 'BrachyAccessoryDeviceSequence'],
        '0x0262': ['IS', '1', 'BrachyAccessoryDeviceNumber'],
        '0x0263': ['SH', '1', 'BrachyAccessoryDeviceID'],
        '0x0264': ['CS', '1', 'BrachyAccessoryDeviceType'],
        '0x0266': ['LO', '1', 'BrachyAccessoryDeviceName'],
        '0x026A': ['DS', '1', 'BrachyAccessoryDeviceNominalThickness'],
        '0x026C': ['DS', '1', 'BrachyAccessoryDeviceNominalTransmission'],
        '0x0280': ['SQ', '1', 'ChannelSequence'],
        '0x0282': ['IS', '1', 'ChannelNumber'],
        '0x0284': ['DS', '1', 'ChannelLength'],
        '0x0286': ['DS', '1', 'ChannelTotalTime'],
        '0x0288': ['CS', '1', 'SourceMovementType'],
        '0x028A': ['IS', '1', 'NumberOfPulses'],
        '0x028C': ['DS', '1', 'PulseRepetitionInterval'],
        '0x0290': ['IS', '1', 'SourceApplicatorNumber'],
        '0x0291': ['SH', '1', 'SourceApplicatorID'],
        '0x0292': ['CS', '1', 'SourceApplicatorType'],
        '0x0294': ['LO', '1', 'SourceApplicatorName'],
        '0x0296': ['DS', '1', 'SourceApplicatorLength'],
        '0x0298': ['LO', '1', 'SourceApplicatorManufacturer'],
        '0x029C': ['DS', '1', 'SourceApplicatorWallNominalThickness'],
        '0x029E': ['DS', '1', 'SourceApplicatorWallNominalTransmission'],
        '0x02A0': ['DS', '1', 'SourceApplicatorStepSize'],
        '0x02A2': ['IS', '1', 'TransferTubeNumber'],
        '0x02A4': ['DS', '1', 'TransferTubeLength'],
        '0x02B0': ['SQ', '1', 'ChannelShieldSequence'],
        '0x02B2': ['IS', '1', 'ChannelShieldNumber'],
        '0x02B3': ['SH', '1', 'ChannelShieldID'],
        '0x02B4': ['LO', '1', 'ChannelShieldName'],
        '0x02B8': ['DS', '1', 'ChannelShieldNominalThickness'],
        '0x02BA': ['DS', '1', 'ChannelShieldNominalTransmission'],
        '0x02C8': ['DS', '1', 'FinalCumulativeTimeWeight'],
        '0x02D0': ['SQ', '1', 'BrachyControlPointSequence'],
        '0x02D2': ['DS', '1', 'ControlPointRelativePosition'],
        '0x02D4': ['DS', '3', 'ControlPointDPosition'],
        '0x02D6': ['DS', '1', 'CumulativeTimeWeight'],
    },
    '0x300C': {
        '0x0000': ['UL', '1', 'RTRelationshipGroupLength'],
        '0x0002': ['SQ', '1', 'ReferencedRTPlanSequence'],
        '0x0004': ['SQ', '1', 'ReferencedBeamSequence'],
        '0x0006': ['IS', '1', 'ReferencedBeamNumber'],
        '0x0007': ['IS', '1', 'ReferencedReferenceImageNumber'],
        '0x0008': ['DS', '1', 'StartCumulativeMetersetWeight'],
        '0x0009': ['DS', '1', 'EndCumulativeMetersetWeight'],
        '0x000A': ['SQ', '1', 'ReferencedBrachyApplicationSetupSequence'],
        '0x000C': ['IS', '1', 'ReferencedBrachyApplicationSetupNumber'],
        '0x000E': ['IS', '1', 'ReferencedSourceNumber'],
        '0x0020': ['SQ', '1', 'ReferencedFractionGroupSequence'],
        '0x0022': ['IS', '1', 'ReferencedFractionGroupNumber'],
        '0x0040': ['SQ', '1', 'ReferencedVerificationImageSequence'],
        '0x0042': ['SQ', '1', 'ReferencedReferenceImageSequence'],
        '0x0050': ['SQ', '1', 'ReferencedDoseReferenceSequence'],
        '0x0051': ['IS', '1', 'ReferencedDoseReferenceNumber'],
        '0x0055': ['SQ', '1', 'BrachyReferencedDoseReferenceSequence'],
        '0x0060': ['SQ', '1', 'ReferencedStructureSetSequence'],
        '0x006A': ['IS', '1', 'ReferencedPatientSetupNumber'],
        '0x0080': ['SQ', '1', 'ReferencedDoseSequence'],
        '0x00A0': ['IS', '1', 'ReferencedToleranceTableNumber'],
        '0x00B0': ['SQ', '1', 'ReferencedBolusSequence'],
        '0x00C0': ['IS', '1', 'ReferencedWedgeNumber'],
        '0x00D0': ['IS', '1', 'ReferencedCompensatorNumber'],
        '0x00E0': ['IS', '1', 'ReferencedBlockNumber'],
        '0x00F0': ['IS', '1', 'ReferencedControlPointIndex'],
    },
    '0x300E': {
        '0x0000': ['UL', '1', 'RTApprovalGroupLength'],
        '0x0002': ['CS', '1', 'ApprovalStatus'],
        '0x0004': ['DA', '1', 'ReviewDate'],
        '0x0005': ['TM', '1', 'ReviewTime'],
        '0x0008': ['PN', '1', 'ReviewerName'],
    },
    '0x4000': {
        '0x0000': ['UL', '1', 'TextGroupLength'],
        '0x0010': ['LT', '1-n', 'TextArbitrary'],
        '0x4000': ['LT', '1-n', 'TextComments'],
    },
    '0x4008': {
        '0x0000': ['UL', '1', 'ResultsGroupLength'],
        '0x0040': ['SH', '1', 'ResultsID'],
        '0x0042': ['LO', '1', 'ResultsIDIssuer'],
        '0x0050': ['SQ', '1', 'ReferencedInterpretationSequence'],
        '0x0100': ['DA', '1', 'InterpretationRecordedDate'],
        '0x0101': ['TM', '1', 'InterpretationRecordedTime'],
        '0x0102': ['PN', '1', 'InterpretationRecorder'],
        '0x0103': ['LO', '1', 'ReferenceToRecordedSound'],
        '0x0108': ['DA', '1', 'InterpretationTranscriptionDate'],
        '0x0109': ['TM', '1', 'InterpretationTranscriptionTime'],
        '0x010A': ['PN', '1', 'InterpretationTranscriber'],
        '0x010B': ['ST', '1', 'InterpretationText'],
        '0x010C': ['PN', '1', 'InterpretationAuthor'],
        '0x0111': ['SQ', '1', 'InterpretationApproverSequence'],
        '0x0112': ['DA', '1', 'InterpretationApprovalDate'],
        '0x0113': ['TM', '1', 'InterpretationApprovalTime'],
        '0x0114': ['PN', '1', 'PhysicianApprovingInterpretation'],
        '0x0115': ['LT', '1', 'InterpretationDiagnosisDescription'],
        '0x0117': ['SQ', '1', 'DiagnosisCodeSequence'],
        '0x0118': ['SQ', '1', 'ResultsDistributionListSequence'],
        '0x0119': ['PN', '1', 'DistributionName'],
        '0x011A': ['LO', '1', 'DistributionAddress'],
        '0x0200': ['SH', '1', 'InterpretationID'],
        '0x0202': ['LO', '1', 'InterpretationIDIssuer'],
        '0x0210': ['CS', '1', 'InterpretationTypeID'],
        '0x0212': ['CS', '1', 'InterpretationStatusID'],
        '0x0300': ['ST', '1', 'Impressions'],
        '0x4000': ['ST', '1', 'ResultsComments'],
    },
    '0x5000': {
        '0x0000': ['UL', '1', 'CurveGroupLength'],
        '0x0005': ['US', '1', 'CurveDimensions'],
        '0x0010': ['US', '1', 'NumberOfPoints'],
        '0x0020': ['CS', '1', 'TypeOfData'],
        '0x0022': ['LO', '1', 'CurveDescription'],
        '0x0030': ['SH', '1-n', 'AxisUnits'],
        '0x0040': ['SH', '1-n', 'AxisLabels'],
        '0x0103': ['US', '1', 'DataValueRepresentation'],
        '0x0104': ['US', '1-n', 'MinimumCoordinateValue'],
        '0x0105': ['US', '1-n', 'MaximumCoordinateValue'],
        '0x0106': ['SH', '1-n', 'CurveRange'],
        '0x0110': ['US', '1', 'CurveDataDescriptor'],
        '0x0112': ['US', '1', 'CoordinateStartValue'],
        '0x0114': ['US', '1', 'CoordinateStepValue'],
        '0x2000': ['US', '1', 'AudioType'],
        '0x2002': ['US', '1', 'AudioSampleFormat'],
        '0x2004': ['US', '1', 'NumberOfChannels'],
        '0x2006': ['UL', '1', 'NumberOfSamples'],
        '0x2008': ['UL', '1', 'SampleRate'],
        '0x200A': ['UL', '1', 'TotalTime'],
        '0x200C': ['OX', '1', 'AudioSampleData'],
        '0x200E': ['LT', '1', 'AudioComments'],
        '0x3000': ['OX', '1', 'CurveData'],
    },
    '0x5400': {
        '0x0100': ['SQ', '1', 'WaveformSequence'],
        '0x0110': ['OW/OB', '1', 'ChannelMinimumValue'],
        '0x0112': ['OW/OB', '1', 'ChannelMaximumValue'],
        '0x1004': ['US', '1', 'WaveformBitsAllocated'],
        '0x1006': ['CS', '1', 'WaveformSampleInterpretation'],
        '0x100A': ['OW/OB', '1', 'WaveformPaddingValue'],
        '0x1010': ['OW/OB', '1', 'WaveformData'],
    },
    '0x6000': {
        '0x0000': ['UL', '1', 'OverlayGroupLength'],
        '0x0010': ['US', '1', 'OverlayRows'],
        '0x0011': ['US', '1', 'OverlayColumns'],
        '0x0012': ['US', '1', 'OverlayPlanes'],
        '0x0015': ['IS', '1', 'OverlayNumberOfFrames'],
        '0x0040': ['CS', '1', 'OverlayType'],
        '0x0050': ['SS', '2', 'OverlayOrigin'],
        '0x0051': ['US', '1', 'OverlayImageFrameOrigin'],
        '0x0052': ['US', '1', 'OverlayPlaneOrigin'],
        '0x0060': ['CS', '1', 'OverlayCompressionCode'],
        '0x0061': ['SH', '1', 'OverlayCompressionOriginator'],
        '0x0062': ['SH', '1', 'OverlayCompressionLabel'],
        '0x0063': ['SH', '1', 'OverlayCompressionDescription'],
        '0x0066': ['AT', '1-n', 'OverlayCompressionStepPointers'],
        '0x0068': ['US', '1', 'OverlayRepeatInterval'],
        '0x0069': ['US', '1', 'OverlayBitsGrouped'],
        '0x0100': ['US', '1', 'OverlayBitsAllocated'],
        '0x0102': ['US', '1', 'OverlayBitPosition'],
        '0x0110': ['CS', '1', 'OverlayFormat'],
        '0x0200': ['US', '1', 'OverlayLocation'],
        '0x0800': ['CS', '1-n', 'OverlayCodeLabel'],
        '0x0802': ['US', '1', 'OverlayNumberOfTables'],
        '0x0803': ['AT', '1-n', 'OverlayCodeTableLocation'],
        '0x0804': ['US', '1', 'OverlayBitsForCodeWord'],
        '0x1100': ['US', '1', 'OverlayDescriptorGray'],
        '0x1101': ['US', '1', 'OverlayDescriptorRed'],
        '0x1102': ['US', '1', 'OverlayDescriptorGreen'],
        '0x1103': ['US', '1', 'OverlayDescriptorBlue'],
        '0x1200': ['US', '1-n', 'OverlayGray'],
        '0x1201': ['US', '1-n', 'OverlayRed'],
        '0x1202': ['US', '1-n', 'OverlayGreen'],
        '0x1203': ['US', '1-n', 'OverlayBlue'],
        '0x1301': ['IS', '1', 'ROIArea'],
        '0x1302': ['DS', '1', 'ROIMean'],
        '0x1303': ['DS', '1', 'ROIStandardDeviation'],
        '0x3000': ['OW', '1', 'OverlayData'],
        '0x4000': ['LT', '1-n', 'OverlayComments'],
    },
    '0x7F00': {
        '0x0000': ['UL', '1', 'VariablePixelDataGroupLength'],
        '0x0010': ['OX', '1', 'VariablePixelData'],
        '0x0011': ['AT', '1', 'VariableNextDataGroup'],
        '0x0020': ['OW', '1-n', 'VariableCoefficientsSDVN'],
        '0x0030': ['OW', '1-n', 'VariableCoefficientsSDHN'],
        '0x0040': ['OW', '1-n', 'VariableCoefficientsSDDN'],
    },
    '0x7FE0': {
        '0x0000': ['UL', '1', 'PixelDataGroupLength'],
        '0x0010': ['OX', '1', 'PixelData'],
        '0x0020': ['OW', '1-n', 'CoefficientsSDVN'],
        '0x0030': ['OW', '1-n', 'CoefficientsSDHN'],
        '0x0040': ['OW', '1-n', 'CoefficientsSDDN'],
    },
    '0xFFFC': {
        '0xFFFC': ['OB', '1', 'DataSetTrailingPadding'],
    },
    '0xFFFE': {
        '0xE000': ['NONE', '1', 'Item'],
        '0xE00D': ['NONE', '1', 'ItemDelimitationItem'],
        '0xE0DD': ['NONE', '1', 'SequenceDelimitationItem'],
    },
}; // dwv.dicom.Dictionnary
;/** 
 * Browser module.
 * @module browser
 */
var dwv = dwv || {};
/**
 * Namespace for browser related functions.
 * @class browser
 * @namespace dwv
 * @static
 */
dwv.browser = dwv.browser || {};

/**
 * Browser check for the FileAPI.
 * @method hasFileApi
 * @static
 */ 
dwv.browser.hasFileApi = function()
{
    // regular test does not work on Safari 5
    var isSafari5 = (navigator.appVersion.indexOf("Safari") !== -1) &&
        (navigator.appVersion.indexOf("Chrome") === -1) &&
        ( (navigator.appVersion.indexOf("5.0.") !== -1) ||
          (navigator.appVersion.indexOf("5.1.") !== -1) );
    if( isSafari5 ) 
    {
        console.warn("Assuming FileAPI support for Safari5...");
        return true;
    }
    // regular test
    return "FileReader" in window;
};

/**
 * Browser check for the XMLHttpRequest.
 * @method hasXmlHttpRequest
 * @static
 */ 
dwv.browser.hasXmlHttpRequest = function()
{
    return "XMLHttpRequest" in window && "withCredentials" in new XMLHttpRequest();
};

/**
 * Browser check for typed array.
 * @method hasTypedArray
 * @static
 */ 
dwv.browser.hasTypedArray = function()
{
    return "Uint8Array" in window && "Uint16Array" in window;
};

/**
 * Browser check for clamped array.
 * @method hasClampedArray
 * @static
 */ 
dwv.browser.hasClampedArray = function()
{
    return "Uint8ClampedArray" in window;
};

/**
 * Browser checks to see if it can run dwv. Throws an error if not.
 * TODO Maybe use http://modernizr.com/.
 * @method check
 * @static
 */ 
dwv.browser.check = function()
{
    var appnorun = "The application cannot be run.";
    var message = "";
    // Check for the File API support
    if( !dwv.browser.hasFileApi() ) {
        message = "The File APIs are not supported in this browser. ";
        alert(message+appnorun);
        throw new Error(message);
    }
    // Check for XMLHttpRequest
    if( !dwv.browser.hasXmlHttpRequest() ) {
        message = "The XMLHttpRequest is not supported in this browser. ";
        alert(message+appnorun);
        throw new Error(message);
    }
    // Check typed array
    if( !dwv.browser.hasTypedArray() ) {
        message = "The Typed arrays are not supported in this browser. ";
        alert(message+appnorun);
        throw new Error(message);
    }
    // check clamped array
    if( !dwv.browser.hasClampedArray() ) {
        // silent fail since IE does not support it...
        console.warn("The Uint8ClampedArray is not supported in this browser. This may impair performance. ");
    }
};
;/** 
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
dwv.gui.base = dwv.gui.base || {};
dwv.gui.filter = dwv.gui.filter || {};
dwv.gui.filter.base = dwv.gui.filter.base || {};

/**
 * Filter tool base gui.
 * @class Filter
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Filter = function (app)
{
    /**
     * Setup the filter tool HTML.
     * @method setup
     */
    this.setup = function (list)
    {
        // filter select
        var filterSelector = dwv.html.createHtmlSelect("filterSelect", list);
        filterSelector.onchange = app.onChangeFilter;
    
        // filter list element
        var filterLi = dwv.html.createHiddenElement("li", "filterLi");
        filterLi.setAttribute("class","ui-block-b");
        filterLi.appendChild(filterSelector);
        
        // append element
        dwv.html.appendElement("toolList", filterLi);
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        dwv.html.displayElement("filterLi", flag);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        // filter select: reset selected options
        var filterSelector = document.getElementById("filterSelect");
        filterSelector.selectedIndex = 0;
        dwv.gui.refreshSelect("#filterSelect");
    };

}; // class dwv.gui.base.Filter

/**
 * Threshold filter base gui.
 * @class Threshold
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Threshold = function (app)
{
    /**
     * Threshold slider.
     * @property slider
     * @private
     * @type Object
     */
    var slider = new dwv.gui.Slider(app);
    
    /**
     * Setup the threshold filter HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // threshold list element
        var thresholdLi = dwv.html.createHiddenElement("li", "thresholdLi");
        thresholdLi.setAttribute("class","ui-block-c");
        
        // node
        var node = document.getElementById("toolList");
        // append threshold
        node.appendChild(thresholdLi);
        // threshold slider
        slider.append();
        // trigger create event (mobile)
        $("#toolList").trigger("create");
    };
    
    /**
     * Clear the threshold filter HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        dwv.html.displayElement("thresholdLi", flag);
    };
    
    /**
     * Initialise the threshold filter HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        // threshold slider
        slider.initialise();
    };

}; // class dwv.gui.base.Threshold
    
/**
 * Create the apply filter button.
 * @method createFilterApplyButton
 * @static
 */
dwv.gui.filter.base.createFilterApplyButton = function (app)
{
    var button = document.createElement("button");
    button.id = "runFilterButton";
    button.onclick = app.onRunFilter;
    button.setAttribute("style","width:100%; margin-top:0.5em;");
    button.setAttribute("class","ui-btn ui-btn-b");
    button.appendChild(document.createTextNode("Apply"));
    return button;
};

/**
 * Sharpen filter base gui.
 * @class Sharpen
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Sharpen = function (app)
{
    /**
     * Setup the sharpen filter HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // sharpen list element
        var sharpenLi = dwv.html.createHiddenElement("li", "sharpenLi");
        sharpenLi.setAttribute("class","ui-block-c");
        sharpenLi.appendChild( dwv.gui.filter.base.createFilterApplyButton(app) );
        // append element
        dwv.html.appendElement("toolList", sharpenLi);
    };
    
    /**
     * Display the sharpen filter HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        dwv.html.displayElement("sharpenLi", flag);
    };
    
}; // class dwv.gui.base.Sharpen

/**
 * Sobel filter base gui.
 * @class Sobel
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Sobel = function (app)
{
    /**
     * Setup the sobel filter HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // sobel list element
        var sobelLi = dwv.html.createHiddenElement("li", "sobelLi");
        sobelLi.setAttribute("class","ui-block-c");
        sobelLi.appendChild( dwv.gui.filter.base.createFilterApplyButton(app) );
       // append element
        dwv.html.appendElement("toolList", sobelLi);
    };
    
    /**
     * Display the sobel filter HTML.
     * @method display
     * @param {Boolean} flag True to display, false to hide.
     */
    this.display = function (flag)
    {
        dwv.html.displayElement("sobelLi", flag);
    };
    
}; // class dwv.gui.base.Sobel

;/** 
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
 * Namespace for base GUI functions.
 * @class base
 * @namespace dwv.gui
 * @static
 */
dwv.gui.base = dwv.gui.base || {};

/**
 * Get the size of the image display window.
 * @method getWindowSize
 * @static
 */
dwv.gui.base.getWindowSize = function()
{
    return { 'width': ($(window).width()), 'height': ($(window).height() - 147) };
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
        dwv.gui.displayProgress(percent);
    }
};

/**
 * Display a progress value.
 * @method displayProgress
 * @static
 * @param {Number} percent The progress percentage.
 */
dwv.gui.base.displayProgress = function(percent)
{
    // jquery-mobile specific
    if( percent < 100 ) {
        $.mobile.loading("show", {text: percent+"%", textVisible: true, theme: "b"} );
    }
    else if( percent === 100 ) {
        $.mobile.loading("hide");
    }
};

/**
 * Refresh a HTML select. Mainly for jquery-mobile.
 * @method refreshSelect
 * @static
 * @param {String} selectName The name of the HTML select to refresh.
 */
dwv.gui.base.refreshSelect = function(selectName)
{
    // jquery-mobile
    if( $(selectName).selectmenu ) {
        $(selectName).selectmenu('refresh');
    }
};

/**
 * Set the selected item of a HTML select.
 * @method refreshSelect
 * @static
 * @param {String} selectName The name of the HTML select.
 * @param {String} itemName The name of the itme to mark as selected.
 */
dwv.gui.setSelected = function(selectName, itemName)
{
    var select = document.getElementById(selectName);
    if ( select ) {
        var index = 0;
        for( index in select.options){ 
            if( select.options[index].text === itemName ) {
                break;
            }
        }
        select.selectedIndex = index;
        dwv.gui.refreshSelect("#" + selectName);
    }
};

/**
 * Slider base gui.
 * @class Slider
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Slider = function (app)
{
    /**
     * Append the slider HTML.
     * @method append
     */
    this.append = function ()
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
                function(/*event*/) {
                    app.onChangeMinMax(
                        { "min":$("#threshold-min").val(),
                          "max":$("#threshold-max").val() } );
                }
            );
        // trigger creation
        $("#toolList").trigger("create");
    };
    
    /**
     * Initialise the slider HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        var min = app.getImage().getDataRange().min;
        var max = app.getImage().getDataRange().max;
        
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
    };

}; // class dwv.gui.base.Slider

/**
 * DICOM tags base gui.
 * @class DicomTags
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.DicomTags = function ()
{
    /**
     * Initialise the DICOM tags table. To be called once the DICOM has been parsed.
     * @method initialise
     * @param {Object} dataInfo The data information.
     */
    this.initialise = function (dataInfo)
    {
        // HTML node
        var node = document.getElementById("tags");
        if( node === null ) {
            return;
        }
        // remove possible previous
        while (node.hasChildNodes()) { 
            node.removeChild(node.firstChild);
        }
        // tag list table (without the pixel data)
        if(dataInfo.PixelData) {
            dataInfo.PixelData.value = "...";
        }
        // tags HTML table
        var table = dwv.html.toTable(dataInfo);
        table.id = "tagsTable";
        table.setAttribute("class", "tagsList");
        table.setAttribute("data-role", "table");
        table.setAttribute("data-mode", "columntoggle");
        // search form
        node.appendChild(dwv.html.getHtmlSearchForm(table));
        // tags table
        node.appendChild(table);
        // trigger create event (mobile)
        $("#tags").trigger("create");
    };
    
}; // class dwv.gui.base.DicomTags
;/** 
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
dwv.gui.base = dwv.gui.base || {};

/**
 * Append the version HTML.
 * @method appendVersionHtml
 */
dwv.gui.base.appendVersionHtml = function (version)
{
    var nodes = document.getElementsByClassName("dwv-version");
    if ( nodes ) {
        for( var i = 0; i < nodes.length; ++i ){
            nodes[i].appendChild( document.createTextNode(version) );
        }
    }
};

/**
 * Build the help HTML.
 * @method appendHelpHtml
 * @param {Boolean} mobile Flag for mobile or not environement.
 */
dwv.gui.base.appendHelpHtml = function(toolList, mobile)
{
    var actionType = "mouse";
    if( mobile ) {
        actionType = "touch";
    }
    
    var toolHelpDiv = document.createElement("div");
    
    // current location
    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));

    var tool = null;
    var tkeys = Object.keys(toolList);
    for ( var t=0; t < tkeys.length; ++t )
    {
        tool = toolList[tkeys[t]];
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
                img.src = dir + "/../../resources/"+keys[i]+".png";
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

    var dwvLink = document.createElement("a");
    dwvLink.href = "https://github.com/ivmartel/dwv/wiki";
    dwvLink.title = "DWV wiki on github.";
    dwvLink.appendChild(document.createTextNode("DWV"));
    
    var dwvExampleLink = document.createElement("a");
    var inputIdx = document.URL.indexOf("?input=");
    dwvExampleLink.href = document.URL.substr(0, inputIdx+7) + 
        "http%3A%2F%2Fx.babymri.org%2F%3F53320924%26.dcm";
    dwvExampleLink.title = "Brain MRI in DWV.";
    dwvExampleLink.target = "_top";
    dwvExampleLink.appendChild(document.createTextNode("MRI"));

    var bbmriLink = document.createElement("a");
    bbmriLink.href = "http://www.babymri.org";
    bbmriLink.title = "babymri.org";
    bbmriLink.appendChild(document.createTextNode("babymri.org"));

    var headPara = document.createElement("p");
    headPara.appendChild(dwvLink);
    headPara.appendChild(document.createTextNode(" can load DICOM data " +
        "either from a local file or from an URL. All DICOM tags are available " +
        "in a searchable table, press the 'tags' or grid button. " + 
        "You can choose to display the image information overlay by pressing the " + 
        "'info' or i button. For some example data, check this "));
    headPara.appendChild(dwvExampleLink);
    headPara.appendChild(document.createTextNode(" from the " ));
    headPara.appendChild(bbmriLink);
    headPara.appendChild(document.createTextNode(" database." ));
    helpNode.appendChild(headPara);
    
    var toolPara = document.createElement("p");
    toolPara.appendChild(document.createTextNode("Each tool defines the possible " + 
        "user interactions. The default tool is the window/level one. " + 
        "Here are the available tools:"));
    helpNode.appendChild(toolPara);
    helpNode.appendChild(toolHelpDiv);
};
;/** 
 * HTML module.
 * @module html
 */
var dwv = dwv || {};
/**
 * Namespace for HTML related functions.
 * @class html
 * @namespace dwv
 * @static
 */
dwv.html = dwv.html || {};

/**
 * Append a cell to a given row.
 * @method appendCell
 * @static
 * @param {Object} row The row to append the cell to.
 * @param {String} text The text of the cell.
 */
dwv.html.appendCell = function(row, text)
{
    var cell = row.insertCell(-1);
    var str = text;
    // special case for Uint8Array (no default toString)
    if ( text instanceof Uint8Array ) {
        str = "";
        for ( var i = 0; i < text.length; ++i ) {
            if ( i > 0 ) { 
                str += ",";
            }
            str += text[i];
        }
    }
    cell.appendChild(document.createTextNode(str));
};

/**
 * Append a header cell to a given row.
 * @method appendHCell
 * @static
 * @param {Object} row The row to append the header cell to.
 * @param {String} text The text of the header cell.
 */
dwv.html.appendHCell = function(row, text)
{
    var cell = document.createElement("th");
    // TODO jquery-mobile specific...
    if( text !== "Value" && text !== "Name" ) {
        cell.setAttribute("data-priority", "1");
    }
    cell.appendChild(document.createTextNode(text));
    row.appendChild(cell);
};

/**
 * Append a row to an array.
 * @method appendRowForArray
 * @static
 * @param {} table
 * @param {} input
 * @param {} level
 * @param {} maxLevel
 * @param {} rowHeader
 */
dwv.html.appendRowForArray = function(table, input, level, maxLevel, rowHeader)
{
    var row = null;
    // loop through
    for(var i=0; i<input.length; ++i) {
        // more to come
        if( typeof input[i] === 'number' ||
            typeof input[i] === 'string' ||
            input[i] === null ||
            input[i] === undefined ||
            level >= maxLevel ) {
            if( !row ) {
                row = table.insertRow(-1);
            }
            dwv.html.appendCell(row, input[i]);
        }
        // last level
        else {
            dwv.html.appendRow(table, input[i], level+i, maxLevel, rowHeader);
        }
    }
};

/**
 * Append a row to an object.
 * @method appendRowForObject
 * @static
 * @param {} table
 * @param {} input
 * @param {} level
 * @param {} maxLevel
 * @param {} rowHeader
 */
dwv.html.appendRowForObject = function(table, input, level, maxLevel, rowHeader)
{
    var keys = Object.keys(input);
    var row = null;
    for( var o=0; o<keys.length; ++o ) {
        // more to come
        if( typeof input[keys[o]] === 'number' ||
            typeof input[keys[o]] === 'string' ||
            input[keys[o]] === null ||
            input[keys[o]] === undefined ||
            level >= maxLevel ) {
            if( !row ) {
                row = table.insertRow(-1);
            }
            if( o === 0 && rowHeader) {
                dwv.html.appendCell(row, rowHeader);
            }
            dwv.html.appendCell(row, input[keys[o]]);
        }
        // last level
        else {
            dwv.html.appendRow(table, input[keys[o]], level+o, maxLevel, keys[o]);
        }
    }
    // header row
    // warn: need to create the header after the rest
    // otherwise the data will inserted in the thead...
    if( level === 2 ) {
        var header = table.createTHead();
        var th = header.insertRow(-1);
        if( rowHeader ) {
            dwv.html.appendHCell(th, "Name");
        }
        for( var k=0; k<keys.length; ++k ) {
            dwv.html.appendHCell(th, dwv.utils.capitaliseFirstLetter(keys[k]));
        }
    }
};

/**
 * Append a row to an object or an array.
 * @method appendRow
 * @static
 * @param {} table
 * @param {} input
 * @param {} level
 * @param {} maxLevel
 * @param {} rowHeader
 */
dwv.html.appendRow = function(table, input, level, maxLevel, rowHeader)
{
    // array
    if( input instanceof Array ) {
        dwv.html.appendRowForArray(table, input, level+1, maxLevel, rowHeader);
    }
    // object
    else if( typeof input === 'object') {
        dwv.html.appendRowForObject(table, input, level+1, maxLevel, rowHeader);
    }
    else {
        throw new Error("Unsupported input data type.");
    }
};

/**
 * Converts the input to an HTML table.
 * @method toTable
 * @static
 * @input {Mixed} input Allowed types are: array, array of object, object.
 * @return {Object} The created HTML table.
 * @warning Null is interpreted differently in browsers, firefox will not display it.
 */
dwv.html.toTable = function(input)
{
    var table = document.createElement('table');
    dwv.html.appendRow(table, input, 0, 2);
    return table;
};

/**
 * Get an HTML search form.
 * @method getHtmlSearchForm
 * @static
 * @param {Object} htmlTableToSearch The table to do the search on.
 * @return {Object} The HTML search form.
 */
dwv.html.getHtmlSearchForm = function(htmlTableToSearch)
{
    var form = document.createElement("form");
    form.setAttribute("class", "filter");
    var input = document.createElement("input");
    input.onkeyup = function() {
        dwv.html.filterTable(input, htmlTableToSearch);
    };
    form.appendChild(input);
    
    return form;
};

/**
 * Filter a table with a given parameter: sets the display css of rows to
 * true or false if it contains the term.
 * @method filterTable
 * @static
 * @param {String} term The term to filter the table with.
 * @param {Object} table The table to filter.
 */
dwv.html.filterTable = function(term, table) {
    // de-highlight
    dwv.html.dehighlight(table);
    // split search terms
    var terms = term.value.toLowerCase().split(" ");

    // search
    var text = 0;
    var display = 0;
    for (var r = 1; r < table.rows.length; ++r) {
        display = '';
        for (var i = 0; i < terms.length; ++i) {
            text = table.rows[r].innerHTML.replace(/<[^>]+>/g, "").toLowerCase();
            if (text.indexOf(terms[i]) < 0) {
                display = 'none';
            } else {
                if (terms[i].length) {
                    dwv.html.highlight(terms[i], table.rows[r]);
                }
            }
            table.rows[r].style.display = display;
        }
    }
};

/**
 * Transform back each
 * 'preText <span class="highlighted">term</span> postText'
 * into its original 'preText term postText'.
 * @method dehighlight
 * @static
 * @param {Object} container The container to de-highlight.
 */
dwv.html.dehighlight = function(container) {
    for (var i = 0; i < container.childNodes.length; i++) {
        var node = container.childNodes[i];

        if (node.attributes &&
                node.attributes['class'] &&
                node.attributes['class'].value === 'highlighted') {
            node.parentNode.parentNode.replaceChild(
                    document.createTextNode(
                        node.parentNode.innerHTML.replace(/<[^>]+>/g, "")),
                    node.parentNode);
            // Stop here and process next parent
            return;
        } else if (node.nodeType !== 3) {
            // Keep going onto other elements
            dwv.html.dehighlight(node);
        }
    }
};

/**
 * Create a
 * 'preText <span class="highlighted">term</span> postText'
 * around each search term.
 * @method highlight
 * @static
 * @param {String} term The term to highlight.
 * @param {Object} container The container where to highlight the term.
 */
dwv.html.highlight = function(term, container) {
    for (var i = 0; i < container.childNodes.length; i++) {
        var node = container.childNodes[i];

        if (node.nodeType === 3) {
            // Text node
            var data = node.data;
            var data_low = data.toLowerCase();
            if (data_low.indexOf(term) >= 0) {
                //term found!
                var new_node = document.createElement('span');
                node.parentNode.replaceChild(new_node, node);

                var result;
                while ((result = data_low.indexOf(term)) !== -1) {
                    // before term
                    new_node.appendChild(document.createTextNode(
                                data.substr(0, result)));
                    // term
                    new_node.appendChild(dwv.html.createHighlightNode(
                                document.createTextNode(data.substr(
                                        result, term.length))));
                    // reduce search string
                    data = data.substr(result + term.length);
                    data_low = data_low.substr(result + term.length);
                }
                new_node.appendChild(document.createTextNode(data));
            }
        } else {
            // Keep going onto other elements
            dwv.html.highlight(term, node);
        }
    }
};

/**
 * Highlight a HTML node.
 * @method createHighlightNode
 * @static
 * @param {Object} child The child to highlight.
 * @return {Object} The created HTML node.
 */
dwv.html.createHighlightNode = function(child) {
    var node = document.createElement('span');
    node.setAttribute('class', 'highlighted');
    node.attributes['class'].value = 'highlighted';
    node.appendChild(child);
    return node;
};

/**
 * Remove all children of a HTML node.
 * @method cleanNode
 * @static
 * @param {Object} node The node to remove kids.
 */
dwv.html.cleanNode = function(node) {
    // remove its children
    while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
};

/**
 * Remove a HTML node and all its children.
 * @method removeNode
 * @static
 * @param {String} nodeId The string id of the node to delete.
 */
dwv.html.removeNode = function(nodeId) {
    // find the node
    var node = document.getElementById(nodeId);
    // check node
    if( !node ) {
        return;
    }
    // remove its children
    dwv.html.cleanNode(node);
    // remove it from its parent
    var top = node.parentNode;
    top.removeChild(node);
};

/**
 * Create a HTML select from an input array of options.
 * The values of the options are the name of the option made lower case.
 * It is left to the user to set the 'onchange' method of the select.
 * @method createHtmlSelect
 * @static
 * @param {String} name The name of the HTML select.
 * @param {Mixed} list The list of options of the HTML select.
 * @return {Object} The created HTML select.
 */
dwv.html.createHtmlSelect = function(name, list) {
    // select
    var select = document.createElement("select");
    select.id = name;
    select.name = name;
    // options
    var option;
    if( list instanceof Array )
    {
        for ( var i in list )
        {
            option = document.createElement("option");
            option.value = list[i];
            option.appendChild(document.createTextNode(dwv.utils.capitaliseFirstLetter(list[i])));
            select.appendChild(option);
        }
    }
    else if( typeof list === 'object')
    {
        for ( var item in list )
        {
            option = document.createElement("option");
            option.value = item;
            option.appendChild(document.createTextNode(dwv.utils.capitaliseFirstLetter(item)));
            select.appendChild(option);
        }
    }
    else
    {
        throw new Error("Unsupported input list type.");
    }
    return select;
};

/**
 * Get a list of parameters from an input URI that looks like:
 *  [dwv root]?input=encodeURI([root]?key0=value0&key1=value1)
 * or
 *  [dwv root]?input=encodeURI([manifest link])&type=manifest
 *  
 * @method getUriParam
 * @static
 * @param {String } uri The URI to decode.
 * @param {Function} The function to call with the decoded urls.
 * @return {Array} The list of urls if in uri, null otherwise.
 */
dwv.html.getUriParam = function(uri, callback)
{
    // split key/value pairs
    var mainQueryPairs = dwv.utils.splitQueryString(uri);
    // check pairs
    if( Object.keys(mainQueryPairs).length === 0 ) {
        return null;
    }
    // has to have an input key
    var query = mainQueryPairs.query;
    if( !query || !query.input ) { 
        throw new Error("No input parameter in query URI.");
    }
    
    // if manifest
    if( query.type && query.type === "manifest" ) {
        dwv.html.decodeManifestUri( query.input, query.nslices, callback );
    }
    // if key/value uri
    else {
        var urls = dwv.html.decodeKeyValueUri( query.input, query.dwvReplaceMode );
        if ( typeof callback != "undefined" ) {
            callback(urls);
        }
        else {
            return urls;
        }
    }
    // default return
    return null;
};

/**
 * Decode a Key/Value pair uri. If a key is repeated, the result 
 * be an array of base + each key. 
 * @method decodeKeyValueUri
 * @static
 * @param {String} uri The uri to decode.
 * @param {String} replaceMode The key replace more.
 */
dwv.html.decodeKeyValueUri = function(uri, replaceMode)
{
    var result = [];

    // repeat key replace mode (default to keep key)
    var repeatKeyReplaceMode = "key";
    if( replaceMode ) {
        repeatKeyReplaceMode = replaceMode;
    }

    // decode input URI
    var queryUri = decodeURIComponent(uri);
    // get key/value pairs from input URI
    var inputQueryPairs = dwv.utils.splitQueryString(queryUri);
    if ( Object.keys(inputQueryPairs).length === 0 ) 
    {
        result.push(queryUri);
    }
    else
    {
        var keys = Object.keys(inputQueryPairs.query);
        // find repeat key
        var repeatKey = null;
        for( var i = 0; i < keys.length; ++i )
        {
            if( inputQueryPairs.query[keys[i]] instanceof Array )
            {
                repeatKey = keys[i];
                break;
            }
        }
    
        if( !repeatKey ) 
        {
            result.push(queryUri);
        }
        else
        {
            var repeatList = inputQueryPairs.query[repeatKey];
            // build base uri
            var baseUrl = inputQueryPairs.base;
            // do not add '?' when the repeatKey is 'file'
            // root/path/to/?file=0.jpg&file=1.jpg
            if( repeatKey !== "file" ) { 
                baseUrl += "?";
            }
            var gotOneArg = false;
            for( var j = 0; j < keys.length; ++j )
            {
                if( keys[j] !== repeatKey ) {
                    if( gotOneArg ) {
                        baseUrl += "&";
                    }
                    baseUrl += keys[j] + "=" + inputQueryPairs.query[keys[j]];
                    gotOneArg = true;
                }
            }
            // append built urls to result
            var url;
            for( var k = 0; k < repeatList.length; ++k )
            {
                url = baseUrl;
                if( gotOneArg ) {
                    url += "&";
                }
                if( repeatKeyReplaceMode === "key" ) {
                    url += repeatKey + "=";
                }
                // other than 'key' mode: do nothing
                url += repeatList[k];
                result.push(url);
            }
        }
    }
    // return
    return result;
};

/**
 * Decode a manifest uri. 
 * @method decodeManifestUri
 * @static
 * @param {String} uri The uri to decode.
 * @param {number} nslices The number of slices to load.
 * @param {Function} The function to call with the decoded urls.
 */
dwv.html.decodeManifestUri = function(uri, nslices, callback)
{
    // Request error
    var onErrorRequest = function(/*event*/)
    {
        console.warn( "RequestError while receiving manifest: "+this.status );
    };

    // Request handler
    var onLoadRequest = function(/*event*/)
    {
        var urls = dwv.html.decodeManifest(this.responseXML, nslices);
        callback(urls);
    };
    
    var request = new XMLHttpRequest();
    // synchronous request (third parameter)
    request.open('GET', decodeURIComponent(uri), true);
    request.responseType = "xml"; 
    request.onload = onLoadRequest;
    request.onerror = onErrorRequest;
    //request.onprogress = dwv.gui.updateProgress;
    request.send(null);
};

/**
 * Decode an XML manifest. 
 * @method decodeManifest
 * @static
 * @param {Object} manifest The manifest to decode.
 * @param {Number} nslices The number of slices to load.
 */
dwv.html.decodeManifest = function(manifest, nslices)
{
    var result = [];
    // wado url
    var wadoElement = manifest.getElementsByTagName("wado_query");
    var wadoURL = wadoElement[0].getAttribute("wadoURL");
    var rootURL = wadoURL + "?requestType=WADO&contentType=application/dicom&";
    // patient list
    var patientList = manifest.getElementsByTagName("Patient");
    if( patientList.length > 1 ) {
        console.warn("More than one patient, loading first one.");
    }
    // study list
    var studyList = patientList[0].getElementsByTagName("Study");
    if( studyList.length > 1 ) {
        console.warn("More than one study, loading first one.");
    }
    var studyUID = studyList[0].getAttribute("StudyInstanceUID");
    // series list
    var seriesList = studyList[0].getElementsByTagName("Series");
    if( seriesList.length > 1 ) {
        console.warn("More than one series, loading first one.");
    }
    var seriesUID = seriesList[0].getAttribute("SeriesInstanceUID");
    // instance list
    var instanceList = seriesList[0].getElementsByTagName("Instance");
    // loop on instances and push links
    var max = instanceList.length;
    if( nslices < max ) {
        max = nslices;
    }
    for( var i = 0; i < max; ++i ) {
        var sopInstanceUID = instanceList[i].getAttribute("SOPInstanceUID");
        var link = rootURL + 
        "&studyUID=" + studyUID +
        "&seriesUID=" + seriesUID +
        "&objectUID=" + sopInstanceUID;
        result.push( link );
    }
    // return
    return result;
};

/**
 * Display or not an element.
 * @method displayElement
 * @static
 * @param {Number} id The id of the element to toggle its display.
 * @param {Boolean} flag True to display the element.
 */
dwv.html.displayElement = function (id, flag)
{
    var element = document.getElementById(id);
    if ( element ) {
        element.style.display = flag ? "" : "none";
    }
};

/**
 * Toggle the display of an element.
 * @method toggleDisplay
 * @static
 * @param {Number} id The id of the element to toggle its display.
 */
dwv.html.toggleDisplay = function (id)
{
    var element = document.getElementById(id);
    if ( element ) {
        if ( element.style.display === "none" ) {
            element.style.display = '';
        }
        else {
            element.style.display = "none";
        }
    }
};

/**
 * Append an element.
 * @method appendElement
 * @static
 * @param {Number} parentId The id of the element to append to.
 * @param {Object} element The element to append.
 */
dwv.html.appendElement = function (parentId, element)
{
    var node = document.getElementById(parentId);
    if ( element ) {
        // append
        node.appendChild(element);
        // trigger create event (mobile)
        $('#'+parentId).trigger("create");
    }
};

/**
 * Create an element.
 * @method createElement
 * @static
 * @param {String} type The type of the elemnt.
 * @param {Number} id The id of the element
 */
dwv.html.createHiddenElement = function (type, id)
{
    var element = document.createElement(type);
    element.id = id;
    // hide by default
    element.style.display = "none";
    // return
    return element;
};
;/** 
 * HTML module.
 * @module html
 */
var dwv = dwv || {};
dwv.html = dwv.html || {};

/**
 * Window layer.
 * @class Layer
 * @namespace dwv.html
 * @constructor
 * @param {String} name The name of the layer.
 */
dwv.html.Layer = function(name)
{
    /**
     * The associated HTMLCanvasElement.
     * @property canvas
     * @private
     * @type Object
     */
    var canvas = null;
    /**
     * A cache of the initial canvas.
     * @property cacheCanvas
     * @private
     * @type Object
     */
    var cacheCanvas = null;
    /**
     * The associated CanvasRenderingContext2D.
     * @property context
     * @private
     * @type Object
     */
    var context = null;
    
    /**
     * Get the layer name.
     * @method getName
     * @return {String} The layer name.
     */
    this.getName = function() { return name; };
    /**
     * Get the layer canvas.
     * @method getCanvas
     * @return {Object} The layer canvas.
     */
    this.getCanvas = function() { return canvas; };
    /**
     * Get the layer context.
     * @method getContext
     * @return {Object} The layer context.
     */
    this.getContext = function() { return context; };
    /**
     * Get the layer offset on page.
     * @method getOffset
     * @return {Number} The layer offset on page.
     */
    this.getOffset = function() { return $('#'+name).offset(); };

    /**
     * The image data array.
     * @property imageData
     * @private
     * @type Array
     */
    var imageData = null;
    
    /**
     * The layer origin.
     * @property origin
     * @private
     * @type {Object}
     */
    var origin = {'x': 0, 'y': 0};
    /**
     * Get the layer origin.
     * @method getOrigin
     * @returns {Object} The layer origin as {'x','y'}.
     */
    this.getOrigin = function () {
        return origin;
    };
    /**
     * The image zoom.
     * @property zoom
     * @private
     * @type {Object}
     */
    var zoom = {'x': 1, 'y': 1};
    /**
     * Get the layer zoom.
     * @method getZoom
     * @returns {Object} The layer zoom as {'x','y'}.
     */
    this.getZoom = function () {
        return zoom;
    };
    
    /**
     * Set the canvas width.
     * @method setWidth
     * @param {Number} width The new width.
     */
    this.setWidth = function ( width ) {
        canvas.width = width;
    };
    /**
     * Set the canvas height.
     * @method setHeight
     * @param {Number} height The new height.
     */
    this.setHeight = function ( height ) {
        canvas.height = height;
    };
    
    /**
     * Set the layer zoom.
     * @method setZoom
     * @param {Number} newZoomX The zoom in the X direction.
     * @param {Number} newZoomY The zoom in the Y direction.
     * @param {Number} centerX The zoom center in the X direction.
     * @param {Number} centerY The zoom center in the Y direction.
     */
    this.zoom = function(newZoomX,newZoomY,centerX,centerY)
    {
        // The zoom is the ratio between the differences from the center
        // to the origins:
        // centerX - originX = ( centerX - originX0 ) * zoomX
        // (center in ~world coordinate system)  
        //originX = (centerX / zoomX) + originX - (centerX / newZoomX);
        //originY = (centerY / zoomY) + originY - (centerY / newZoomY);
        
        // center in image coordinate system        
        origin.x = centerX - (centerX - origin.x) * (newZoomX / zoom.x);
        origin.y = centerY - (centerY - origin.y) * (newZoomY / zoom.y);

        // save zoom
        zoom.x = newZoomX;
        zoom.y = newZoomY;
    };
    
    /**
     * Set the layer translation.
     * Translation is according to the last one.
     * @method setTranslate
     * @param {Number} tx The translation in the X direction.
     * @param {Number} ty The translation in the Y direction.
     */
    this.translate = function(tx,ty)
    {
        // new origin
        origin.x += tx * zoom.x;
        origin.y += ty * zoom.y;
    };
    
    /**
     * Set the image data array.
     * @method setImageData
     * @param {Array} data The data array.
     */
    this.setImageData = function(data)
    {
        imageData = data;
        // update the cached canvas
        cacheCanvas.getContext("2d").putImageData(imageData, 0, 0);
    };
    
    /**
     * Reset the layout.
     * @method resetLayout
     */ 
    this.resetLayout = function(izoom)
    {
        origin.x = 0;
        origin.y = 0;
        zoom.x = izoom;
        zoom.y = izoom;
    };
    
    /**
     * Transform a display position to an index.
     * @method displayToIndex
     */ 
    this.displayToIndex = function ( point2D ) {
        return {'x': (point2D.x - origin.x) / zoom.x,
            'y': (point2D.y - origin.y) / zoom.y };
    };
    
    /**
     * Draw the content (imageData) of the layer.
     * The imageData variable needs to be set
     * @method draw
     */
    this.draw = function ()
    {
        // clear the context: reset the transform first
        // store the current transformation matrix
        context.save();
        // use the identity matrix while clearing the canvas
        context.setTransform( 1, 0, 0, 1, 0, 0 );
        context.clearRect( 0, 0, canvas.width, canvas.height );
        // restore the transform
        context.restore();
        
        // draw the cached canvas on the context
        // transform takes as input a, b, c, d, e, f to create
        // the transform matrix (column-major order):
        // [ a c e ]
        // [ b d f ]
        // [ 0 0 1 ]
        context.setTransform( zoom.x, 0, 0, zoom.y, origin.x, origin.y );
        context.drawImage( cacheCanvas, 0, 0 );
    };
    
    /**
     * Initialise the layer: set the canvas and context
     * @method initialise
     * @input {Number} inputWidth The width of the canvas.
     * @input {Number} inputHeight The height of the canvas.
     */
    this.initialise = function(inputWidth, inputHeight)
    {
        // find the canvas element
        canvas = document.getElementById(name);
        if (!canvas)
        {
            alert("Error: cannot find the canvas element for '" + name + "'.");
            return;
        }
        // check that the getContext method exists
        if (!canvas.getContext)
        {
            alert("Error: no canvas.getContext method for '" + name + "'.");
            return;
        }
        // get the 2D context
        context = canvas.getContext('2d');
        if (!context)
        {
            alert("Error: failed to get the 2D context for '" + name + "'.");
            return;
        }
        // canvas sizes
        canvas.width = inputWidth;
        canvas.height = inputHeight;
        // original empty image data array
        context.clearRect (0, 0, canvas.width, canvas.height);
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        // cached canvas
        cacheCanvas = document.createElement("canvas");
        cacheCanvas.width = inputWidth;
        cacheCanvas.height = inputHeight;
    };
    
    /**
     * Fill the full context with the current style.
     * @method fillContext
     */
    this.fillContext = function()
    {
        context.fillRect( 0, 0, canvas.width, canvas.height );
    };
    
    /**
     * Clear the context and reset the image data.
     * @method clear
     */
    this.clear = function()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        this.resetLayout();
    };

    /**
     * Merge two layers.
     * @method merge
     * @input {Layer} layerToMerge The layer to merge. It will also be emptied.
     */
    this.merge = function(layerToMerge)
    {
        // basic resampling of the merge data to put it at zoom 1:1
        var mergeImageData = layerToMerge.getContext().getImageData(
            0, 0, canvas.width, canvas.height);
        var offMerge = 0;
        var offMergeJ = 0;
        var offThis = 0;
        var offThisJ = 0;
        var alpha = 0;
        for( var j=0; j < canvas.height; ++j ) {
            offMergeJ = parseInt( (origin.y + j * zoom.y), 10 ) * canvas.width;
            offThisJ = j * canvas.width;
            for( var i=0; i < canvas.width; ++i ) {
                // 4 component data: RGB + alpha
                offMerge = 4 * ( parseInt( (origin.x + i * zoom.x), 10 ) + offMergeJ );
                offThis = 4 * ( i + offThisJ );
                // merge non transparent 
                alpha = mergeImageData.data[offMerge+3];
                if( alpha !== 0 ) {
                    imageData.data[offThis] = mergeImageData.data[offMerge];
                    imageData.data[offThis+1] = mergeImageData.data[offMerge+1];
                    imageData.data[offThis+2] = mergeImageData.data[offMerge+2];
                    imageData.data[offThis+3] = alpha;
                }
            }
        }
        // empty and reset merged layer
        layerToMerge.clear();
        // draw the layer
        this.draw();
    };
    
    /**
     * Set the line color for the layer.
     * @method setLineColor
     * @input {String} color The line color.
     */
    this.setLineColor = function(color)
    {
        context.fillStyle = color;
        context.strokeStyle = color;
    };
    
    /**
     * Display the layer.
     * @method setStyleDisplay
     * @input {Boolean} val Whether to display the layer or not.
     */
    this.setStyleDisplay = function(val)
    {
        if( val === true )
        {
            canvas.style.display = '';
        }
        else
        {
            canvas.style.display = "none";
        }
    };
    
    /**
     * Check if the layer is visible.
     * @method isVisible
     * @return {Boolean} True if the layer is visible.
     */
    this.isVisible = function()
    {
        if( canvas.style.display === "none" ) {
            return false;
        }
        else {
            return true;
        }
    };
    
    /**
     * Align on another layer.
     * @method align
     * @param {Layer} rhs The layer to align on.
     */
    this.align = function(rhs)
    {
        canvas.style.top = rhs.getCanvas().offsetTop;
        canvas.style.left = rhs.getCanvas().offsetLeft;
    };
}; // Layer class

/**
 * Get the offset of an input event.
 * @method getEventOffset
 * @static
 * @param {Object} event The event to get the offset from.
 * @return {Array} The array of offsets.
 */
dwv.html.getEventOffset = function (event) {
    var positions = [];
    var ex = 0;
    var ey = 0;
    if ( event.targetTouches ) {
        // get the touch offset from all its parents
        var offsetLeft = 0;
        var offsetTop = 0;
        var offsetParent = event.targetTouches[0].target.offsetParent;
        while ( offsetParent ) {
            if (!isNaN(offsetParent.offsetLeft)) {
                offsetLeft += offsetParent.offsetLeft;
            }
            if (!isNaN(offsetParent.offsetTop)) {
                offsetTop += offsetParent.offsetTop;
            }
            offsetParent = offsetParent.offsetParent;
        }
        // set its position
        var touch = null;
        for ( var i = 0 ; i < event.targetTouches.length; ++i ) {
            touch = event.targetTouches[i];
            ex = touch.pageX - offsetLeft;
            ey = touch.pageY - offsetTop;
            positions.push({'x': ex, 'y': ey});
        }
    }
    else {
        // layerX is used by Firefox
        ex = event.offsetX === undefined ? event.layerX : event.offsetX;
        ey = event.offsetY === undefined ? event.layerY : event.offsetY;
        positions.push({'x': ex, 'y': ey});
    }
    return positions;
};
;/** 
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
dwv.gui.base = dwv.gui.base || {};

/**
 * Loadbox base gui.
 * @class Loadbox
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Loadbox = function (app, loaders)
{
    /**
     * Setup the loadbox HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // loader select
        var loaderSelector = dwv.html.createHtmlSelect("loaderSelect", app.getLoaders());
        loaderSelector.onchange = app.onChangeLoader;
        
        // node
        var node = document.getElementById("loaderlist");
        // clear it
        while(node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        // append
        node.appendChild(loaderSelector);
        // trigger create event (mobile)
        $("#loaderlist").trigger("create");
    };
    
    /**
     * Display a loader.
     * @param {String} name The name of the loader to show.
     */
    this.displayLoader = function (name)
    {
        var keys = Object.keys(loaders);
        for ( var i = 0; i < keys.length; ++i ) {
            if ( keys[i] === name ) {
                loaders[keys[i]].display(true);
            }
            else {
                loaders[keys[i]].display(false);
            }
        }
    };
    
}; // class dwv.gui.base.Loadbox

/**
 * FileLoad base gui.
 * @class FileLoad
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.FileLoad = function (app)
{
    /**
     * Setup the file load HTML to the page.
     * @method setup
     */
    this.setup = function()
    {
        // input
        var fileLoadInput = document.createElement("input");
        fileLoadInput.onchange = app.onChangeFiles;
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
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // file div element
        var filediv = document.getElementById("imagefilesdiv");
        filediv.style.display = bool ? "" : "none";
    };
    
}; // class dwv.gui.base.FileLoad

/**
 * FileLoad base gui.
 * @class FileLoad
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.UrlLoad = function (app)
{
    /**
     * Setup the url load HTML to the page.
     * @method setup
     */
    this.setup = function ()
    {
        // input
        var urlLoadInput = document.createElement("input");
        urlLoadInput.onchange = app.onChangeURL;
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
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // url div element
        var urldiv = document.getElementById("imageurldiv");
        urldiv.style.display = bool ? "" : "none";
    };

}; // class dwv.gui.base.UrlLoad
;/** 
 * HTML module.
 * @module html
 */
var dwv = dwv || {};
dwv.html = dwv.html || {};

/**
 * Style class.
 * @class Style
 * @namespace dwv.html
 * @constructor
 */
dwv.html.Style = function()
{
    /**
     * Font size.
     * @property fontSize
     * @private
     * @type Number
     */
    var fontSize = 12;
    /**
     * Font definition string.
     * @property fontStr
     * @private
     * @type String
     */
    var fontStr = "normal "+this.fontSize+"px sans-serif";
    /**
     * Line height.
     * @property lineHeight
     * @private
     * @type Number
     */
    var lineHeight = this.fontSize + this.fontSize/5;
    /**
     * Text color.
     * @property textColor
     * @private
     * @type String
     */
    var textColor = "#fff";
    /**
     * Line color.
     * @property lineColor
     * @private
     * @type String
     */
    var lineColor = 0;
    
    /**
     * Get the font size.
     * @method getFontSize
     * @return {Number} The font size.
     */
    dwv.html.Style.prototype.getFontSize = function() { return fontSize; };

    /**
     * Get the font definition string.
     * @method getFontStr
     * @return {String} The font definition string.
     */
    dwv.html.Style.prototype.getFontStr = function() { return fontStr; };

    /**
     * Get the line height.
     * @method getLineHeight
     * @return {Number} The line height.
     */
    dwv.html.Style.prototype.getLineHeight = function() { return lineHeight; };

    /**
     * Get the text color.
     * @method getTextColor
     * @return {String} The text color.
     */
    dwv.html.Style.prototype.getTextColor = function() { return textColor; };

    /**
     * Get the line color.
     * @method getLineColor
     * @return {String} The line color.
     */
    dwv.html.Style.prototype.getLineColor = function() { return lineColor; };

    /**
     * Set the line color.
     * @method setLineColor
     * @param {String} color The line color.
     */
    dwv.html.Style.prototype.setLineColor = function(color) { lineColor = color; };
};
;/** 
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
dwv.gui.base = dwv.gui.base || {};

/**
 * Toolbox base gui.
 * @class Toolbox
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Toolbox = function (app)
{
    /**
     * Setup the toolbox HTML.
     * @method setup
     */
    this.setup = function (list)
    {
        // tool select
        var toolSelector = dwv.html.createHtmlSelect("toolSelect", list);
        toolSelector.onchange = app.onChangeTool;
        
        // tool list element
        var toolLi = document.createElement("li");
        toolLi.id = "toolLi";
        toolLi.style.display = "none";
        toolLi.appendChild(toolSelector);
        toolLi.setAttribute("class","ui-block-a");
    
        // node
        var node = document.getElementById("toolList");
        // clear it
        while(node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        // append
        node.appendChild(toolLi);
        // trigger create event (mobile)
        $("#toolList").trigger("create");
    };
    
    /**
     * Display the toolbox HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // tool list element
        dwv.html.displayElement("toolLi", bool);
    };
    
    /**
     * Initialise the toolbox HTML.
     * @method initialise
     */
    this.initialise = function (displays)
    {
        // tool select: reset selected option
        var toolSelector = document.getElementById("toolSelect");
        
        // update list
        var options = toolSelector.options;
        var selectedIndex = -1;
        for ( var i = 0; i < options.length; ++i ) {
            if ( !displays[i] ) {
                options[i].style.display = "none";
            }
            else {
                if ( selectedIndex === -1 ) {
                    selectedIndex = i;
                }
                options[i].style.display = "";
            }
        }
        toolSelector.selectedIndex = selectedIndex;
        
        // refresh
        dwv.gui.refreshSelect("#toolSelect");
    };
    
}; // dwv.gui.base.Toolbox

/**
 * WindowLevel tool base gui.
 * @class WindowLevel
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.WindowLevel = function (app)
{
    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // preset select
        var wlSelector = dwv.html.createHtmlSelect("presetSelect", app.getPresets());
        wlSelector.onchange = app.onChangeWindowLevelPreset;
        // colour map select
        var cmSelector = dwv.html.createHtmlSelect("colourMapSelect",dwv.tool.colourMaps);
        cmSelector.onchange = app.onChangeColourMap;
    
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
        // append preset
        node.appendChild(wlLi);
        // append color map
        node.appendChild(cmLi);
        // trigger create event (mobile)
        $("#toolList").trigger("create");
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // presets list element
        dwv.html.displayElement("wlLi", bool);
        // color map list element
        dwv.html.displayElement("cmLi", bool);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        // create new preset select
        var wlSelector = dwv.html.createHtmlSelect("presetSelect", app.getPresets());
        wlSelector.onchange = app.onChangeWindowLevelPreset;
        wlSelector.title = "Select w/l preset.";
        
        // copy html list
        var wlLi = document.getElementById("wlLi");
        // clear node
        dwv.html.cleanNode(wlLi);
        // add children
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
    
}; // class dwv.gui.base.WindowLevel

/**
 * Draw tool base gui.
 * @class Draw
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Draw = function (app)
{
    // default colours
    var colours = [
       "Yellow", "Red", "White", "Green", "Blue", "Lime", "Fuchsia", "Black"
    ];
    /**
     * Get the available colours.
     * @method getColours
     */
    this.getColours = function () { return colours; };
    
    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function (shapeList)
    {
        // shape select
        var shapeSelector = dwv.html.createHtmlSelect("shapeSelect", shapeList);
        shapeSelector.onchange = app.onChangeShape;
        // colour select
        var colourSelector = dwv.html.createHtmlSelect("colourSelect", colours);
        colourSelector.onchange = app.onChangeLineColour;
    
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
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // color list element
        dwv.html.displayElement("colourLi", bool);
        // shape list element
        dwv.html.displayElement("shapeLi", bool);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
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
    
}; // class dwv.gui.base.Draw

/**
 * Livewire tool base gui.
 * @class Livewire
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Livewire = function (app)
{
    // default colours
    var colours = [
       "Yellow", "Red", "White", "Green", "Blue", "Lime", "Fuchsia", "Black"
    ];
    /**
     * Get the available colours.
     * @method getColours
     */
    this.getColours = function () { return colours; };

    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function ()
    {
        // colour select
        var colourSelector = dwv.html.createHtmlSelect("lwColourSelect", colours);
        colourSelector.onchange = app.onChangeLineColour;
        
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
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function (bool)
    {
        // colour list
        dwv.html.displayElement("lwColourLi", bool);
    };
    
    /**
     * Initialise the tool HTML.
     * @method initialise
     */
    this.initialise = function ()
    {
        var colourSelector = document.getElementById("lwColourSelect");
        colourSelector.selectedIndex = 0;
        dwv.gui.refreshSelect("#lwColourSelect");
    };
    
}; // class dwv.gui.base.Livewire

/**
 * ZoomAndPan tool base gui.
 * @class ZoomAndPan
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.ZoomAndPan = function (app)
{
    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function()
    {
        // reset button
        var button = document.createElement("button");
        button.id = "zoomResetButton";
        button.name = "zoomResetButton";
        button.onclick = app.onZoomReset;
        button.setAttribute("style","width:100%; margin-top:0.5em;");
        button.setAttribute("class","ui-btn ui-btn-b");
        var text = document.createTextNode("Reset");
        button.appendChild(text);
        
        // list element
        var liElement = document.createElement("li");
        liElement.id = "zoomLi";
        liElement.style.display = "none";
        liElement.setAttribute("class","ui-block-c");
        liElement.appendChild(button);
        
        // node
        var node = document.getElementById("toolList");
        // append element
        node.appendChild(liElement);
        // trigger create event (mobile)
        $("#toolList").trigger("create");
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function(bool)
    {
        // display list element
        dwv.html.displayElement("zoomLi", bool);
    };
    
}; // class dwv.gui.base.ZoomAndPan

/**
 * Scroll tool base gui.
 * @class Scroll
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Scroll = function ()
{
    /**
     * Setup the tool HTML.
     * @method setup
     */
    this.setup = function()
    {
        // list element
        var liElement = document.createElement("li");
        liElement.id = "scrollLi";
        liElement.style.display = "none";
        liElement.setAttribute("class","ui-block-c");
        
        // node
        var node = document.getElementById("toolList");
        // append element
        node.appendChild(liElement);
        // trigger create event (mobile)
        $("#toolList").trigger("create");
    };
    
    /**
     * Display the tool HTML.
     * @method display
     * @param {Boolean} bool True to display, false to hide.
     */
    this.display = function(bool)
    {
        // display list element
        dwv.html.displayElement("scrollLi", bool);
    };
    
}; // class dwv.gui.base.Scroll
;/** 
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
dwv.gui.base = dwv.gui.base || {};

/**
 * Undo base gui.
 * @class Undo
 * @namespace dwv.gui.base
 * @constructor
 */
dwv.gui.base.Undo = function ()
{
    /**
     * Setup the undo HTML.
     * @method setup
     * @static
     */
    this.setup = function ()
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
        while(node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        // append
        node.appendChild(paragraph);
    };
    
    /**
     * Clear the command list of the undo HTML.
     * @method cleanUndoHtml
     */
    this.initialise = function ()
    {
        var select = document.getElementById("history_list");
        if ( select && select.length !== 0 ) {
            for( var i = select.length - 1; i >= 0; --i)
            {
                select.remove(i);
            }
        }
    };
    
    /**
     * Add a command to the undo HTML.
     * @method addCommandToUndoHtml
     * @param {String} commandName The name of the command to add.
     */
    this.addCommandToUndoHtml = function (commandName)
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
     * @param {Boolean} enable Flag to enable or disable the command.
     */
    this.enableInUndoHtml = function (enable)
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

}; // class dwv.gui.base.Undo
;/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
dwv.image = dwv.image || {};
dwv.image.filter = dwv.image.filter || {};

/**
 * Threshold an image between an input minimum and maximum.
 * @class Threshold
 * @namespace dwv.image.filter
 * @constructor
 */
dwv.image.filter.Threshold = function()
{
    /**
     * Threshold minimum.
     * @property min
     * @private
     * @type Number
     */
    var min = 0;
    /**
     * Threshold maximum.
     * @property max
     * @private
     * @type Number
     */
    var max = 0;

    /**
     * Get the threshold minimum.
     * @method getMin
     * @return {Number} The threshold minimum.
     */
    this.getMin = function() { return min; };
    /**
     * Set the threshold minimum.
     * @method setMin
     * @param {Number} val The threshold minimum.
     */
    this.setMin = function(val) { min = val; };
    /**
     * Get the threshold maximum.
     * @method getMax
     * @return {Number} The threshold maximum.
     */
    this.getMax = function() { return max; };
    /**
     * Set the threshold maximum.
     * @method setMax
     * @param {Number} val The threshold maximum.
     */
    this.setMax = function(val) { max = val; };
    /**
     * Get the name of the filter.
     * @method getName
     * @return {String} The name of the filter.
     */
    this.getName = function() { return "Threshold"; };
    
    /**
     * Original image.
     * @property originalImage
     * @private
     * @type Object
     */
    var originalImage = null;
    /**
     * Set the original image.
     * @method setOriginalImage
     * @param {Object} image The original image.
     */
    this.setOriginalImage = function (image) { originalImage = image; };
    /**
     * Get the original image.
     * @method setOriginalImage
     * @return {Object} image The original image.
     */
    this.getOriginalImage = function () { return originalImage; };
};

/**
 * Transform the main image using this filter.
 * @method update
 * @return {Object} The transformed image.
 */ 
dwv.image.filter.Threshold.prototype.update = function ()
{
    var image = this.getOriginalImage();
    var imageMin = image.getDataRange().min;
    var self = this;
    var threshFunction = function (value) {
        if ( value < self.getMin() || value > self.getMax() ) {
            return imageMin;
        }
        else {
            return value;
        }
    };
    return image.transform( threshFunction );
};

/**
 * Sharpen an image using a sharpen convolution matrix.
 * @class Sharpen
 * @namespace dwv.image.filter
 * @constructor
 */
dwv.image.filter.Sharpen = function()
{
    /**
     * Get the name of the filter.
     * @method getName
     * @return {String} The name of the filter.
     */
    this.getName = function() { return "Sharpen"; };
    /**
     * Original image.
     * @property originalImage
     * @private
     * @type Object
     */
    var originalImage = null;
    /**
     * Set the original image.
     * @method setOriginalImage
     * @param {Object} image The original image.
     */
    this.setOriginalImage = function (image) { originalImage = image; };
    /**
     * Get the original image.
     * @method setOriginalImage
     * @return {Object} image The original image.
     */
    this.getOriginalImage = function () { return originalImage; };
};

/**
 * Transform the main image using this filter.
 * @method update
 * @return {Object} The transformed image.
 */ 
dwv.image.filter.Sharpen.prototype.update = function()
{
    var image = this.getOriginalImage();
    
    return image.convolute2D(
        [  0, -1,  0,
          -1,  5, -1,
           0, -1,  0 ] );
};

/**
 * Apply a Sobel filter to an image.
 * @class Sobel
 * @namespace dwv.image.filter
 * @constructor
 */
dwv.image.filter.Sobel = function()
{
    /**
     * Get the name of the filter.
     * @method getName
     * @return {String} The name of the filter.
     */
    this.getName = function() { return "Sobel"; };
    /**
     * Original image.
     * @property originalImage
     * @private
     * @type Object
     */
    var originalImage = null;
    /**
     * Set the original image.
     * @method setOriginalImage
     * @param {Object} image The original image.
     */
    this.setOriginalImage = function (image) { originalImage = image; };
    /**
     * Get the original image.
     * @method setOriginalImage
     * @return {Object} image The original image.
     */
    this.getOriginalImage = function () { return originalImage; };
};

/**
 * Transform the main image using this filter.
 * @method update
 * @return {Object} The transformed image.
 */ 
dwv.image.filter.Sobel.prototype.update = function()
{
    var image = this.getOriginalImage();
    
    var gradX = image.convolute2D(
        [ 1,  0,  -1,
          2,  0,  -2,
          1,  0,  -1 ] );

    var gradY = image.convolute2D(
        [  1,  2,  1,
           0,  0,  0,
          -1, -2, -1 ] );
    
    return gradX.compose( gradY, function (x,y) { return Math.sqrt(x*x+y*y); } );
};

;/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * 2D/3D Size class.
 * @class Size
 * @namespace dwv.image
 * @constructor
 * @param {Number} numberOfColumns The number of columns.
 * @param {Number} numberOfRows The number of rows.
 * @param {Number} numberOfSlices The number of slices.
*/
dwv.image.Size = function ( numberOfColumns, numberOfRows, numberOfSlices )
{
    /**
     * Get the number of columns.
     * @method getNumberOfColumns
     * @return {Number} The number of columns.
     */ 
    this.getNumberOfColumns = function () { return numberOfColumns; };
    /**
     * Get the number of rows.
     * @method getNumberOfRows
     * @return {Number} The number of rows.
     */ 
    this.getNumberOfRows = function () { return numberOfRows; };
    /**
     * Get the number of slices.
     * @method getNumberOfSlices
     * @return {Number} The number of slices.
     */ 
    this.getNumberOfSlices = function () { return (numberOfSlices || 1.0); };
};

/**
 * Get the size of a slice.
 * @method getSliceSize
 * @return {Number} The size of a slice.
 */ 
dwv.image.Size.prototype.getSliceSize = function () {
    return this.getNumberOfColumns() * this.getNumberOfRows();
};

/**
 * Get the total size.
 * @method getTotalSize
 * @return {Number} The total size.
 */ 
dwv.image.Size.prototype.getTotalSize = function () {
    return this.getSliceSize() * this.getNumberOfSlices();
};

/**
 * Check for equality.
 * @method equals
 * @param {Size} rhs The object to compare to.
 * @return {Boolean} True if both objects are equal.
 */ 
dwv.image.Size.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getNumberOfColumns() === rhs.getNumberOfColumns() &&
        this.getNumberOfRows() === rhs.getNumberOfRows() &&
        this.getNumberOfSlices() === rhs.getNumberOfSlices();
};

/**
 * Check that coordinates are within bounds.
 * @method isInBounds
 * @param {Number} i The column coordinate.
 * @param {Number} j The row coordinate.
 * @param {Number} k The slice coordinate.
 * @return {Boolean} True if the given coordinates are within bounds.
 */ 
dwv.image.Size.prototype.isInBounds = function ( i, j, k ) {
    if( i < 0 || i > this.getNumberOfColumns() - 1 ||
        j < 0 || j > this.getNumberOfRows() - 1 ||
        k < 0 || k > this.getNumberOfSlices() - 1 ) {
        return false;
    }
    return true;
};

/**
 * 2D/3D Spacing class. 
 * @class Spacing
 * @namespace dwv.image
 * @constructor
 * @param {Number} columnSpacing The column spacing.
 * @param {Number} rowSpacing The row spacing.
 * @param {Number} sliceSpacing The slice spacing.
 */
dwv.image.Spacing = function ( columnSpacing, rowSpacing, sliceSpacing )
{
    /**
     * Get the column spacing.
     * @method getColumnSpacing
     * @return {Number} The column spacing.
     */ 
    this.getColumnSpacing = function () { return columnSpacing; };
    /**
     * Get the row spacing.
     * @method getRowSpacing
     * @return {Number} The row spacing.
     */ 
    this.getRowSpacing = function () { return rowSpacing; };
    /**
     * Get the slice spacing.
     * @method getSliceSpacing
     * @return {Number} The slice spacing.
     */ 
    this.getSliceSpacing = function () { return (sliceSpacing || 1.0); };
};

/**
 * Check for equality.
 * @method equals
 * @param {Spacing} rhs The object to compare to.
 * @return {Boolean} True if both objects are equal.
 */ 
dwv.image.Spacing.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getColumnSpacing() === rhs.getColumnSpacing() &&
        this.getRowSpacing() === rhs.getRowSpacing() &&
        this.getSliceSpacing() === rhs.getSliceSpacing();
};

/**
 * 2D/3D Geometry class. 
 * @class Geometry
 * @namespace dwv.image
 * @constructor
 * @param {Object} origin The object origin.
 * @param {Object} size The object size.
 * @param {Object} spacing The object spacing.
 */
dwv.image.Geometry = function ( origin, size, spacing )
{
    // check input origin.
    if( typeof(origin) === 'undefined' ) {
        origin = new dwv.math.Point3D(0,0,0);
    }
    var origins = [origin];
    
    /**
     * Get the object first origin.
     * @method getOrigin
     * @return {Object} The object first origin.
     */ 
    this.getOrigin = function () { return origin; };
    /**
     * Get the object origins.
     * @method getOrigins
     * @return {Array} The object origins.
     */ 
    this.getOrigins = function () { return origins; };
    /**
     * Get the object size.
     * @method getSize
     * @return {Object} The object size.
     */ 
    this.getSize = function () { return size; };
    /**
     * Get the object spacing.
     * @method getSpacing
     * @return {Object} The object spacing.
     */ 
    this.getSpacing = function () { return spacing; };
    
    /**
     * Get the slice position of a point in the current slice layout.
     * @method getSliceIndex
     * @param {Object} point The point to evaluate.
     */
    this.getSliceIndex = function (point)
    {
        // cannot use this.worldToIndex(point).getK() since
        // we cannot guaranty consecutive slices...
        
        // find the closest index
        var closestSliceIndex = 0;
        var minDiff = Math.abs( origins[0].getZ() - point.getZ() );
        var diff = 0;
        for( var i = 0; i < origins.length; ++i )
        {
            diff = Math.abs( origins[i].getZ() - point.getZ() );
            if( diff < minDiff ) 
            {
                minDiff = diff;
                closestSliceIndex = i;
            }
        }
        diff = origins[closestSliceIndex].getZ() - point.getZ();
        var sliceIndex = ( diff > 0 ) ? closestSliceIndex : closestSliceIndex + 1;
        return sliceIndex;
    };
    
    /**
     * Append an origin to the geometry.
     * @param {Object} origin The origin to append.
     * @param {Number} index The index at which to append.
     */
    this.appendOrigin = function (origin, index)
    {
        // add in origin array
        origins.splice(index, 0, origin);
        // increment slice number
        size = new dwv.image.Size(
            size.getNumberOfColumns(),
            size.getNumberOfRows(),
            size.getNumberOfSlices() + 1);
    };

};

/**
 * Check for equality.
 * @method equals
 * @param {Geometry} rhs The object to compare to.
 * @return {Boolean} True if both objects are equal.
 */ 
dwv.image.Geometry.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getOrigin() === rhs.getOrigin() &&
        this.getSize() === rhs.getSize() &&
        this.getSpacing() === rhs.getSpacing();
};

/**
 * Convert an index to an offset in memory.
 * @param {Object} index The index to convert.
 */
dwv.image.Geometry.prototype.indexToOffset = function (index) {
    var size = this.getSize();
    return index.getI() +
       index.getJ() * size.getNumberOfColumns() +
       index.getK() * size.getSliceSize();
};

/**
 * Convert an index into world coordinates.
 * @param {Object} index The index to convert.
 */
dwv.image.Geometry.prototype.indexToWorld = function (index) {
    var origin = this.getOrigin();
    var spacing = this.getSpacing();
    return new dwv.math.Point3D(
        origin.getX() + index.getI() * spacing.getColumnSpacing(),
        origin.getY() + index.getJ() * spacing.getRowSpacing(),
        origin.getZ() + index.getK() * spacing.getSliceSpacing() );
};

/**
 * Convert world coordinates into an index.
 * @param {Object} THe point to convert.
 */
dwv.image.Geometry.prototype.worldToIndex = function (point) {
    var origin = this.getOrigin();
    var spacing = this.getSpacing();
    return new dwv.math.Point3D(
        point.getX() / spacing.getColumnSpacing() - origin.getX(),
        point.getY() / spacing.getRowSpacing() - origin.getY(),
        point.getZ() / spacing.getSliceSpacing() - origin.getZ() );
};
;/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Rescale Slope and Intercept
 * @class RescaleSlopeAndIntercept
 * @namespace dwv.image
 * @constructor
 * @param slope
 * @param intercept
 */
dwv.image.RescaleSlopeAndIntercept = function (slope, intercept)
{
    /*// Check the rescale slope.
    if(typeof(slope) === 'undefined') {
        slope = 1;
    }
    // Check the rescale intercept.
    if(typeof(intercept) === 'undefined') {
        intercept = 0;
    }*/
    
    /**
     * Get the slope of the RSI.
     * @method getSlope
     * @return {Number} The slope of the RSI.
     */ 
    this.getSlope = function ()
    {
        return slope;
    };
    /**
     * Get the intercept of the RSI.
     * @method getIntercept
     * @return {Number} The intercept of the RSI.
     */ 
    this.getIntercept = function ()
    {
        return intercept;
    };
    /**
     * Apply the RSI on an input value.
     * @method apply
     * @return {Number} The value to rescale.
     */ 
    this.apply = function (value)
    {
        return value * slope + intercept;
    };
};

/** 
 * Check for RSI equality.
 * @method equals
 * @param {Object} rhs The other RSI to compare to.
 * @return {Boolean} True if both RSI are equal.
 */ 
dwv.image.RescaleSlopeAndIntercept.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getSlope() === rhs.getSlope() &&
        this.getIntercept() === rhs.getIntercept();
};

/** 
 * Get a string representation of the RSI.
 * @method toString
 * @return {String} The RSI as a string.
 */ 
dwv.image.RescaleSlopeAndIntercept.prototype.toString = function () {
    return (this.getSlope() + ", " + this.getIntercept());
};

/**
 * Image class.
 * Usable once created, optional are:
 * - rescale slope and intercept (default 1:0), 
 * - photometric interpretation (default MONOCHROME2),
 * - planar configuration (default RGBRGB...).
 * @class Image
 * @namespace dwv.image
 * @constructor
 * @param {Object} geometry The geometry of the image.
 * @param {Array} buffer The image data.
 */
dwv.image.Image = function(geometry, buffer)
{
    /**
     * Rescale slope and intercept.
     * @property rsi
     * @private
     * @type Number
     */
    var rsis = [];
    for ( var s = 0; s < geometry.getSize().getNumberOfSlices(); ++s ) {
        rsis.push( new dwv.image.RescaleSlopeAndIntercept( 1, 0 ) );
    }
    /**
     * Photometric interpretation (MONOCHROME, RGB...).
     * @property photometricInterpretation
     * @private
     * @type String
     */
    var photometricInterpretation = "MONOCHROME2";
    /**
     * Planar configuration for RGB data (0:RGBRGBRGBRGB... or 1:RRR...GGG...BBB...).
     * @property planarConfiguration
     * @private
     * @type Number
     */
    var planarConfiguration = 0;
    /**
     * Number of components.
     * @property planarConfiguration
     * @private
     * @type Number
     */
    var numberOfComponents = buffer.length / geometry.getSize().getTotalSize();
    /**
     * Meta information.
     * @property meta
     * @private
     * @type Object
     */
    var meta = {};
    
    /**
     * Original buffer.
     * @property originalBuffer
     * @private
     * @type Array
     */
    var originalBuffer = new Int16Array(buffer);
    
    /**
     * Data range.
     * @property dataRange
     * @private
     * @type Object
     */
    var dataRange = null;
    /**
     * Rescaled data range.
     * @property rescaledDataRange
     * @private
     * @type Object
     */
    var rescaledDataRange = null;
    /**
     * Histogram.
     * @property histogram
     * @private
     * @type Array
     */
    var histogram = null;
     
    /**
     * Get the geometry of the image.
     * @method getGeometry
     * @return {Object} The size of the image.
     */ 
    this.getGeometry = function() { return geometry; };
    /**
     * Get the data buffer of the image. TODO dangerous...
     * @method getBuffer
     * @return {Array} The data buffer of the image.
     */ 
    this.getBuffer = function() { return buffer; };
    
    /**
     * Get the rescale slope and intercept.
     * @method getRescaleSlopeAndIntercept
     * @return {Object} The rescale slope and intercept.
     */ 
    this.getRescaleSlopeAndIntercept = function(k) { return rsis[k]; };
    /**
     * Set the rescale slope and intercept.
     * @method setRescaleSlopeAndIntercept
     * @param {Object} rsi The rescale slope and intercept.
     */ 
    this.setRescaleSlopeAndIntercept = function(inRsi, k) { 
        if ( typeof k === 'undefined' ) {
            k = 0;
        }
        rsis[k] = inRsi; 
    };
    /**
     * Get the photometricInterpretation of the image.
     * @method getPhotometricInterpretation
     * @return {String} The photometricInterpretation of the image.
     */ 
    this.getPhotometricInterpretation = function() { return photometricInterpretation; };
    /**
     * Set the photometricInterpretation of the image.
     * @method setPhotometricInterpretation
     * @pqrqm {String} interp The photometricInterpretation of the image.
     */ 
    this.setPhotometricInterpretation = function(interp) { photometricInterpretation = interp; };
    /**
     * Get the planarConfiguration of the image.
     * @method getPlanarConfiguration
     * @return {Number} The planarConfiguration of the image.
     */ 
    this.getPlanarConfiguration = function() { return planarConfiguration; };
    /**
     * Set the planarConfiguration of the image.
     * @method setPlanarConfiguration
     * @param {Number} config The planarConfiguration of the image.
     */ 
    this.setPlanarConfiguration = function(config) { planarConfiguration = config; };
    /**
     * Get the numberOfComponents of the image.
     * @method getNumberOfComponents
     * @return {Number} The numberOfComponents of the image.
     */ 
    this.getNumberOfComponents = function() { return numberOfComponents; };

    /**
     * Get the meta information of the image.
     * @method getMeta
     * @return {Object} The meta information of the image.
     */ 
    this.getMeta = function() { return meta; };
    /**
     * Set the meta information of the image.
     * @method setMeta
     * @param {Object} rhs The meta information of the image.
     */ 
    this.setMeta = function(rhs) { meta = rhs; };

    /**
     * Get value at offset. Warning: No size check...
     * @method getValueAtOffset
     * @param {Number} offset The desired offset.
     * @return {Number} The value at offset.
     */ 
    this.getValueAtOffset = function(offset) {
        return buffer[offset];
    };
    
    /**
     * Clone the image.
     * @method clone
     * @return {Image} A clone of this image.
     */ 
    this.clone = function()
    {
        var copy = new dwv.image.Image(this.getGeometry(), originalBuffer);
        var nslices = this.getGeometry().getSize().getNumberOfSlices();
        for ( var k = 0; k < nslices; ++k ) {
            copy.setRescaleSlopeAndIntercept(this.getRescaleSlopeAndIntercept(k), k);
        }
        copy.setPhotometricInterpretation(this.getPhotometricInterpretation());
        copy.setPlanarConfiguration(this.getPlanarConfiguration());
        copy.setMeta(this.getMeta());
        return copy;
    };
    
    /**
     * Append a slice to the image.
     * @method appendSlice
     * @param {Image} The slice to append.
     */ 
    this.appendSlice = function(rhs)
    {
        // check input
        if( rhs === null ) {
            throw new Error("Cannot append null slice");
        }
        var rhsSize = rhs.getGeometry().getSize();
        var size = geometry.getSize();
        if( rhsSize.getNumberOfSlices() !== 1 ) {
            throw new Error("Cannot append more than one slice");
        }
        if( size.getNumberOfColumns() !== rhsSize.getNumberOfColumns() ) {
            throw new Error("Cannot append a slice with different number of columns");
        }
        if( size.getNumberOfRows() !== rhsSize.getNumberOfRows() ) {
            throw new Error("Cannot append a slice with different number of rows");
        }
        if( photometricInterpretation !== rhs.getPhotometricInterpretation() ) {
            throw new Error("Cannot append a slice with different photometric interpretation");
        }
        // all meta should be equal
        for( var key in meta ) {
            if( meta[key] !== rhs.getMeta()[key] ) {
                throw new Error("Cannot append a slice with different "+key);
            }
        }
        
        // calculate slice size
        var mul = 1;
        if( photometricInterpretation === "RGB" ) {
            mul = 3;
        }
        var sliceSize = mul * size.getSliceSize();
        
        // create the new buffer
        var newBuffer = new Int16Array(sliceSize * (size.getNumberOfSlices() + 1) );
        
        // append slice at new position
        var newSliceNb = geometry.getSliceIndex( rhs.getGeometry().getOrigin() );
        if( newSliceNb === 0 )
        {
            newBuffer.set(rhs.getBuffer());
            newBuffer.set(buffer, sliceSize);
        }
        else if( newSliceNb === size.getNumberOfSlices() )
        {
            newBuffer.set(buffer);
            newBuffer.set(rhs.getBuffer(), size.getNumberOfSlices() * sliceSize);
        }
        else
        {
            var offset = newSliceNb * sliceSize;
            newBuffer.set(buffer.subarray(0, offset - 1));
            newBuffer.set(rhs.getBuffer(), offset);
            newBuffer.set(buffer.subarray(offset), offset + sliceSize);
        }
        
        // update geometry
        geometry.appendOrigin( rhs.getGeometry().getOrigin(), newSliceNb );
        // update rsi
        rsis.splice(newSliceNb, 0, rhs.getRescaleSlopeAndIntercept(0));
        
        // copy to class variables
        buffer = newBuffer;
        originalBuffer = new Int16Array(newBuffer);
    };
    
    /**
     * Get the data range.
     * @method getDataRange
     * @return {Object} The data range.
     */ 
    this.getDataRange = function() { 
        if( !dataRange ) {
            dataRange = this.calculateDataRange();
        }
        return dataRange;
    };

    /**
     * Get the rescaled data range.
     * @method getRescaledDataRange
     * @return {Object} The rescaled data range.
     */ 
    this.getRescaledDataRange = function() { 
        if( !rescaledDataRange ) {
            rescaledDataRange = this.calculateRescaledDataRange();
        }
        return rescaledDataRange;
    };

    /**
     * Get the histogram.
     * @method getHistogram
     * @return {Array} The histogram.
     */ 
    this.getHistogram = function() { 
        if( !histogram ) {
            var res = this.calculateHistogram();
            dataRange = res.dataRange;
            rescaledDataRange = res.rescaledDataRange;
            histogram = res.histogram;
        }
        return histogram;
    };
};

/**
 * Get the value of the image at a specific coordinate.
 * @method getValue
 * @param {Number} i The X index.
 * @param {Number} j The Y index.
 * @param {Number} k The Z index.
 * @return {Number} The value at the desired position.
 * Warning: No size check...
 */
dwv.image.Image.prototype.getValue = function( i, j, k )
{
    var index = new dwv.math.Index3D(i,j,k);
    return this.getValueAtOffset( this.getGeometry().indexToOffset(index) );
};

/**
 * Get the rescaled value of the image at a specific coordinate.
 * @method getRescaledValue
 * @param {Number} i The X index.
 * @param {Number} j The Y index.
 * @param {Number} k The Z index.
 * @return {Number} The rescaled value at the desired position.
 * Warning: No size check...
 */
dwv.image.Image.prototype.getRescaledValue = function( i, j, k )
{
    return this.getRescaleSlopeAndIntercept(k).apply( this.getValue(i,j,k) );
};

/**
 * Calculate the data range of the image.
 * @method calculateDataRange
 * @return {Object} The range {min, max}.
 */
dwv.image.Image.prototype.calculateDataRange = function ()
{
    var size = this.getGeometry().getSize().getTotalSize();
    var min = this.getValueAtOffset(0);
    var max = min;
    var value = 0;
    for ( var i = 0; i < size; ++i ) {    
        value = this.getValueAtOffset(i);
        if( value > max ) { max = value; }
        if( value < min ) { min = value; }
    }
    // return
    return { "min": min, "max": max };
};

/**
 * Calculate the rescaled data range of the image.
 * @method calculateRescaledDataRange
 * @return {Object} The range {min, max}.
 */
dwv.image.Image.prototype.calculateRescaledDataRange = function ()
{
    var size = this.getGeometry().getSize();
    var rmin = this.getRescaledValue(0,0,0);
    var rmax = rmin;
    var rvalue = 0;
    for ( var k = 0; k < size.getNumberOfSlices(); ++k ) {    
        for ( var j = 0; j < size.getNumberOfRows(); ++j ) {    
            for ( var i = 0; i < size.getNumberOfColumns(); ++i ) {    
                rvalue = this.getRescaledValue(i,j,k);
                if( rvalue > rmax ) { rmax = rvalue; }
                if( rvalue < rmin ) { rmin = rvalue; }
            }
        }
    }
    // return
    return { "min": rmin, "max": rmax };
};

/**
 * Calculate the histogram of the image.
 * @method calculateHistogram
 * @return {Object} The histogram, data range and rescaled data range.
 */
dwv.image.Image.prototype.calculateHistogram = function ()
{
    var size = this.getGeometry().getSize();
    var histo = [];
    var min = this.getValue(0,0,0);
    var max = min;
    var value = 0;
    var rmin = this.getRescaledValue(0,0,0);
    var rmax = rmin;
    var rvalue = 0;
    for ( var k = 0; k < size.getNumberOfSlices(); ++k ) {    
        for ( var j = 0; j < size.getNumberOfRows(); ++j ) {    
            for ( var i = 0; i < size.getNumberOfColumns(); ++i ) {    
                value = this.getValue(i,j,k);
                if( value > max ) { max = value; }
                if( value < min ) { min = value; }
                rvalue = this.getRescaleSlopeAndIntercept(k).apply(value);
                if( rvalue > rmax ) { rmax = rvalue; }
                if( rvalue < rmin ) { rmin = rvalue; }
                histo[rvalue] = ( histo[rvalue] || 0 ) + 1;
            }
        }
    }
    // set data range
    var dataRange = { "min": min, "max": max };
    var rescaledDataRange = { "min": rmin, "max": rmax };
    // generate data for plotting
    var histogram = [];
    for ( var b = rmin; b <= rmax; ++b ) {    
        histogram.push([b, ( histo[b] || 0 ) ]);
    }
    // return
    return { 'dataRange': dataRange, 'rescaledDataRange': rescaledDataRange,
        'histogram': histogram };
};

/**
 * Convolute the image with a given 2D kernel.
 * @method convolute2D
 * @param {Array} weights The weights of the 2D kernel as a 3x3 matrix.
 * @return {Image} The convoluted image.
 * Note: Uses the raw buffer values.
 */
dwv.image.Image.prototype.convolute2D = function(weights)
{
    if(weights.length !== 9) {
        throw new Error("The convolution matrix does not have a length of 9; it has "+weights.length);
    }

    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();

    var imgSize = this.getGeometry().getSize();
    var ncols = imgSize.getNumberOfColumns();
    var nrows = imgSize.getNumberOfRows();
    var nslices = imgSize.getNumberOfSlices();
    var ncomp = this.getNumberOfComponents();
    
    // adapt to number of component and planar configuration
    var factor = 1;
    var componentOffset = 1;
    if( ncomp === 3 )
    {
        if( this.getPlanarConfiguration() === 0 )
        {
            factor = 3;
        }
        else
        {
            componentOffset = imgSize.getTotalSize();
        }
    }
    
    // allow special indent for matrices
    /*jshint indent:false */

    // default weight offset matrix
    var wOff = [];
    wOff[0] = (-ncols-1) * factor; wOff[1] = (-ncols) * factor; wOff[2] = (-ncols+1) * factor;
    wOff[3] = -factor; wOff[4] = 0; wOff[5] = 1 * factor;
    wOff[6] = (ncols-1) * factor; wOff[7] = (ncols) * factor; wOff[8] = (ncols+1) * factor;
    
    // border weight offset matrices
    // borders are extended (see http://en.wikipedia.org/wiki/Kernel_%28image_processing%29)
    
    // i=0, j=0
    var wOff00 = [];
    wOff00[0] = wOff[4]; wOff00[1] = wOff[4]; wOff00[2] = wOff[5];
    wOff00[3] = wOff[4]; wOff00[4] = wOff[4]; wOff00[5] = wOff[5];
    wOff00[6] = wOff[7]; wOff00[7] = wOff[7]; wOff00[8] = wOff[8];
    // i=0, j=*
    var wOff0x = [];
    wOff0x[0] = wOff[1]; wOff0x[1] = wOff[1]; wOff0x[2] = wOff[2];
    wOff0x[3] = wOff[4]; wOff0x[4] = wOff[4]; wOff0x[5] = wOff[5];
    wOff0x[6] = wOff[7]; wOff0x[7] = wOff[7]; wOff0x[8] = wOff[8];
    // i=0, j=nrows
    var wOff0n = [];
    wOff0n[0] = wOff[1]; wOff0n[1] = wOff[1]; wOff0n[2] = wOff[2];
    wOff0n[3] = wOff[4]; wOff0n[4] = wOff[4]; wOff0n[5] = wOff[5];
    wOff0n[6] = wOff[4]; wOff0n[7] = wOff[4]; wOff0n[8] = wOff[5];
    
    // i=*, j=0
    var wOffx0 = [];
    wOffx0[0] = wOff[3]; wOffx0[1] = wOff[4]; wOffx0[2] = wOff[5];
    wOffx0[3] = wOff[3]; wOffx0[4] = wOff[4]; wOffx0[5] = wOff[5];
    wOffx0[6] = wOff[6]; wOffx0[7] = wOff[7]; wOffx0[8] = wOff[8];
    // i=*, j=* -> wOff
    // i=*, j=nrows
    var wOffxn = [];
    wOffxn[0] = wOff[0]; wOffxn[1] = wOff[1]; wOffxn[2] = wOff[2];
    wOffxn[3] = wOff[3]; wOffxn[4] = wOff[4]; wOffxn[5] = wOff[5];
    wOffxn[6] = wOff[3]; wOffxn[7] = wOff[4]; wOffxn[8] = wOff[5];
    
    // i=ncols, j=0
    var wOffn0 = [];
    wOffn0[0] = wOff[3]; wOffn0[1] = wOff[4]; wOffn0[2] = wOff[4];
    wOffn0[3] = wOff[3]; wOffn0[4] = wOff[4]; wOffn0[5] = wOff[4];
    wOffn0[6] = wOff[6]; wOffn0[7] = wOff[7]; wOffn0[8] = wOff[7];
    // i=ncols, j=*
    var wOffnx = [];
    wOffnx[0] = wOff[0]; wOffnx[1] = wOff[1]; wOffnx[2] = wOff[1];
    wOffnx[3] = wOff[3]; wOffnx[4] = wOff[4]; wOffnx[5] = wOff[4];
    wOffnx[6] = wOff[6]; wOffnx[7] = wOff[7]; wOffnx[8] = wOff[7];
    // i=ncols, j=nrows
    var wOffnn = [];
    wOffnn[0] = wOff[0]; wOffnn[1] = wOff[1]; wOffnn[2] = wOff[1];
    wOffnn[3] = wOff[3]; wOffnn[4] = wOff[4]; wOffnn[5] = wOff[4];
    wOffnn[6] = wOff[3]; wOffnn[7] = wOff[4]; wOffnn[8] = wOff[4];
    
    // restore indent for rest of method
    /*jshint indent:4 */

    // loop vars
    var pixelOffset = 0;
    var newValue = 0;
    var wOffFinal = [];
    // go through the destination image pixels
    for (var c=0; c<ncomp; c++) {
        // special component offset
        pixelOffset = c * componentOffset;
        for (var k=0; k<nslices; k++) {
            for (var j=0; j<nrows; j++) {
                for (var i=0; i<ncols; i++) {
                    wOffFinal = wOff;
                    // special border cases
                    if( i === 0 && j === 0 ) {
                        wOffFinal = wOff00;
                    }
                    else if( i === 0 && j === (nrows-1)  ) {
                        wOffFinal = wOff0n;
                    }
                    else if( i === (ncols-1) && j === 0 ) {
                        wOffFinal = wOffn0;
                    }
                    else if( i === (ncols-1) && j === (nrows-1) ) {
                        wOffFinal = wOffnn;
                    }
                    else if( i === 0 && j !== (nrows-1) && j !== 0 ) {
                        wOffFinal = wOff0x;
                    }
                    else if( i === (ncols-1) && j !== (nrows-1) && j !== 0 ) {
                        wOffFinal = wOffnx;
                    }
                    else if( i !== 0 && i !== (ncols-1) && j === 0 ) {
                        wOffFinal = wOffx0;
                    }
                    else if( i !== 0 && i !== (ncols-1) && j === (nrows-1) ) {
                        wOffFinal = wOffxn;
                    }
                        
                    // calculate the weighed sum of the source image pixels that
                    // fall under the convolution matrix
                    newValue = 0;
                    for( var wi=0; wi<9; ++wi )
                    {
                        newValue += this.getValueAtOffset(pixelOffset + wOffFinal[wi]) * weights[wi];
                    }
                    newBuffer[pixelOffset] = newValue;
                    // increment pixel offset
                    pixelOffset += factor;
                }
            }
        }
    }
    return newImage;
};

/**
 * Transform an image using a specific operator.
 * @method transform
 * @param {Function} operator The operator to use when transforming.
 * @return {Image} The transformed image.
 * Note: Uses the raw buffer values.
 */
dwv.image.Image.prototype.transform = function(operator)
{
    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();
    for( var i=0; i < newBuffer.length; ++i )
    {   
        newBuffer[i] = operator( newImage.getValueAtOffset(i) );
    }
    return newImage;
};

/**
 * Compose this image with another one and using a specific operator.
 * @method compose
 * @param {Image} rhs The image to compose with.
 * @param {Function} operator The operator to use when composing.
 * @return {Image} The composed image.
 * Note: Uses the raw buffer values.
 */
dwv.image.Image.prototype.compose = function(rhs, operator)
{
    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();
    for( var i=0; i < newBuffer.length; ++i )
    {   
        // using the operator on the local buffer, i.e. the latest (not original) data
        newBuffer[i] = Math.floor( operator( this.getValueAtOffset(i), rhs.getValueAtOffset(i) ) );
    }
    return newImage;
};

/**
 * Quantify a line according to image information.
 * @method quantifyLine
 * @param {Object} line The line to quantify.
 * @return {Object} A quantification object.
 */
dwv.image.Image.prototype.quantifyLine = function(line)
{
    var spacing = this.getGeometry().getSpacing();
    var length = line.getWorldLength( spacing.getColumnSpacing(), 
            spacing.getRowSpacing() );
    return {"length": length};
};

/**
 * Quantify a rectangle according to image information.
 * @method quantifyRect
 * @param {Object} rect The rectangle to quantify.
 * @return {Object} A quantification object.
 */
dwv.image.Image.prototype.quantifyRect = function(rect)
{
    var spacing = this.getGeometry().getSpacing();
    var surface = rect.getWorldSurface( spacing.getColumnSpacing(), 
            spacing.getRowSpacing());
    var subBuffer = [];
    var minJ = parseInt(rect.getBegin().getY(), 10);
    var maxJ = parseInt(rect.getEnd().getY(), 10);
    var minI = parseInt(rect.getBegin().getX(), 10);
    var maxI = parseInt(rect.getEnd().getX(), 10);
    for ( var j = minJ; j < maxJ; ++j ) {
        for ( var i = minI; i < maxI; ++i ) {
            subBuffer.push( this.getValue(i,j,0) );
        }
    }
    var quantif = dwv.math.getStats( subBuffer );
    return {"surface": surface, "min": quantif.min, 'max': quantif.max,
        "mean": quantif.mean, 'stdDev': quantif.stdDev};
};

/**
 * Quantify an ellipse according to image information.
 * @method quantifyEllipse
 * @param {Object} ellipse The ellipse to quantify.
 * @return {Object} A quantification object.
 */
dwv.image.Image.prototype.quantifyEllipse = function(ellipse)
{
    var spacing = this.getGeometry().getSpacing();
    var surface = ellipse.getWorldSurface( spacing.getColumnSpacing(), 
            spacing.getRowSpacing());
    return {"surface": surface};
};

/**
 * Image factory.
 * @class ImageFactory
 * @namespace dwv.image
 * @constructor
 */
dwv.image.ImageFactory = function () {};

/**
 * Get an Image object from the read DICOM file.
 * @method create
 * @param {Object} dicomElements The DICOM tags.
 * @param {Array} pixelBuffer The pixel buffer.
 * @returns {View} A new Image.
 */
dwv.image.ImageFactory.prototype.create = function (dicomElements, pixelBuffer)
{
    // size
    if ( !dicomElements.Columns ) {
        throw new Error("Missing DICOM image number of columns");
    }
    if ( !dicomElements.Rows ) {
        throw new Error("Missing DICOM image number of rows");
    }
    var size = new dwv.image.Size(
        dicomElements.Columns.value[0], 
        dicomElements.Rows.value[0] );
    
    // spacing
    var rowSpacing = 1;
    var columnSpacing = 1;
    if ( dicomElements.PixelSpacing ) {
        rowSpacing = parseFloat(dicomElements.PixelSpacing.value[0]);
        columnSpacing = parseFloat(dicomElements.PixelSpacing.value[1]);
    }
    else if ( dicomElements.ImagerPixelSpacing ) {
        rowSpacing = parseFloat(dicomElements.ImagerPixelSpacing.value[0]);
        columnSpacing = parseFloat(dicomElements.ImagerPixelSpacing.value[1]);
    }
    var spacing = new dwv.image.Spacing( columnSpacing, rowSpacing);

    // special jpeg 2000 case: openjpeg returns a Uint8 planar MONO or RGB image
    var syntax = dwv.utils.cleanString(
        dicomElements.TransferSyntaxUID.value[0] );
    var jpeg2000 = dwv.dicom.isJpeg2000TransferSyntax( syntax );
    
    // buffer data
    var buffer = null;
    // convert to 16bit if needed
    if ( jpeg2000 && dicomElements.BitsAllocated.value[0] === 16 )
    {
        var sliceSize = size.getSliceSize();
        buffer = new Int16Array( sliceSize );
        var k = 0;
        for ( var p = 0; p < sliceSize; ++p ) {
            buffer[p] = 256 * pixelBuffer[k] + pixelBuffer[k+1];
            k += 2;
        }
    }
    else
    {
        buffer = new Int16Array(pixelBuffer.length);
        // unsigned to signed data if needed
        var shift = false;
        if ( dicomElements.PixelRepresentation &&
                dicomElements.PixelRepresentation.value[0] == 1) {
            shift = true;
        }
        // copy
        for ( var i=0; i<pixelBuffer.length; ++i ) {
            buffer[i] = pixelBuffer[i];
            if ( shift && buffer[i] >= Math.pow(2, 15) ) {
                buffer[i] -= Math.pow(2, 16);
            }
        }
    }
    
    // slice position
    var slicePosition = new Array(0,0,0);
    if ( dicomElements.ImagePositionPatient ) {
        slicePosition = [ parseFloat(dicomElements.ImagePositionPatient.value[0]),
            parseFloat(dicomElements.ImagePositionPatient.value[1]),
            parseFloat(dicomElements.ImagePositionPatient.value[2]) ];
    }
    
    // geometry
    var origin = new dwv.math.Point3D(slicePosition[0], slicePosition[1], slicePosition[2]);
    var geometry = new dwv.image.Geometry( origin, size, spacing );
    
    // image
    var image = new dwv.image.Image( geometry, buffer );
    // photometricInterpretation
    if ( dicomElements.PhotometricInterpretation ) {
        var photo = dwv.utils.cleanString(
            dicomElements.PhotometricInterpretation.value[0]).toUpperCase();
        if ( jpeg2000 && photo.match(/YBR/) ) {
            photo = "RGB";
        }
        image.setPhotometricInterpretation( photo );
    }        
    // planarConfiguration
    if ( dicomElements.PlanarConfiguration ) {
        var planar = dicomElements.PlanarConfiguration.value[0];
        if ( jpeg2000 ) {
            planar = 1;
        }
        image.setPlanarConfiguration( planar );
    }        
    // rescale slope and intercept
    var slope = 1;
    if ( dicomElements.RescaleSlope ) {
        slope = parseFloat(dicomElements.RescaleSlope.value[0]);
    }
    var intercept = 0;
    if ( dicomElements.RescaleIntercept ) {
        intercept = parseFloat(dicomElements.RescaleIntercept.value[0]);
    }
    var rsi = new dwv.image.RescaleSlopeAndIntercept(slope, intercept);
    image.setRescaleSlopeAndIntercept( rsi );
    // meta information
    var meta = {};
    if ( dicomElements.Modality ) {
        meta.Modality = dicomElements.Modality.value[0];
    }
    if ( dicomElements.StudyInstanceUID ) {
        meta.StudyInstanceUID = dicomElements.StudyInstanceUID.value[0];
    }
    if ( dicomElements.SeriesInstanceUID ) {
        meta.SeriesInstanceUID = dicomElements.SeriesInstanceUID.value[0];
    }
    if ( dicomElements.BitsStored ) {
        meta.BitsStored = parseInt(dicomElements.BitsStored.value[0], 10);
    }
    image.setMeta(meta);
    
    return image;
};

;/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
dwv.image = dwv.image || {};
dwv.image.lut = dwv.image.lut || {};

/**
 * Rescale LUT class.
 * @class Rescale
 * @namespace dwv.image.lut
 * @constructor
 * @param {Object} rsi The rescale slope and intercept.
 */
dwv.image.lut.Rescale = function (rsi)
{
    /**
     * The internal array.
     * @property rescaleLut
     * @private
     * @type Array
     */
    var rescaleLut = null;
    
    /**
     * Get the Rescale Slope and Intercept (RSI).
     * @method getRSI
     * @return {Object} The rescale slope and intercept.
     */ 
    this.getRSI = function () { return rsi; };
    
    /**
     * Initialise the LUT.
     * @method initialise
     * @param {Number} bitsStored The number of bits used to store the data.
     */ 
    this.initialise = function (bitsStored)
    {
        var size = Math.pow(2, bitsStored);
        rescaleLut = new Float32Array(size);
        for ( var i = 0; i < size; ++i ) {
            rescaleLut[i] = rsi.apply(i);
        }
    };
    
    /**
     * Get the length of the LUT array.
     * @method getLength
     * @return {Number} The length of the LUT array.
     */ 
    this.getLength = function () { return rescaleLut.length; };
    
    /**
     * Get the value of the LUT at the given offset.
     * @method getValue
     * @return {Number} The value of the LUT at the given offset.
     */ 
    this.getValue = function (offset) { return rescaleLut[offset]; };
};

/**
 * Window LUT class.
 * @class Window
 * @namespace dwv.image.lut
 * @constructor
 * @param {Number} rescaleLut_ The associated rescale LUT.
 * @param {Boolean} isSigned_ Flag to know if the data is signed.
 */
dwv.image.lut.Window = function (rescaleLut, isSigned)
{
    /**
     * The internal array: Uint8ClampedArray clamps between 0 and 255.
     * (not supported on travis yet... using basic array, be sure not to overflow!)
     * @property rescaleLut
     * @private
     * @type Array
     */
    var windowLut = null;
    
    // check Uint8ClampedArray support
    if ( !dwv.browser.hasClampedArray() ) {
        windowLut = new Uint8Array(rescaleLut.getLength());
    }
    else {
        windowLut = new Uint8ClampedArray(rescaleLut.getLength());
    }
    
    /**
     * The window center.
     * @property center
     * @private
     * @type Number
     */
    var center = null;
    /**
     * The window width.
     * @property width
     * @private
     * @type Number
     */
    var width = null;
    
    /**
     * Flag to know if the lut needs update or not.
     * @property needsUpdate
     * @private
     * @type Boolean
     */
    var needsUpdate = false;
    
    /**
     * Get the window center.
     * @method getCenter
     * @return {Number} The window center.
     */ 
    this.getCenter = function() { return center; };
    /**
     * Get the window width.
     * @method getWidth
     * @return {Number} The window width.
     */ 
    this.getWidth = function() { return width; };
    /**
     * Get the signed flag.
     * @method isSigned
     * @return {Boolean} The signed flag.
     */ 
    this.isSigned = function() { return isSigned; };
    /**
     * Get the rescale lut.
     * @method getRescaleLut
     * @return {Object} The rescale lut.
     */ 
    this.getRescaleLut = function() { return rescaleLut; };
    
    /**
     * Set the window center and width.
     * @method setCenterAndWidth
     * @param {Number} inCenter The window center.
     * @param {Number} inWidth The window width.
     */ 
    this.setCenterAndWidth = function (inCenter, inWidth)
    {
        // store the window values
        center = inCenter;
        width = inWidth;
        needsUpdate = true;
    };
    
    /**
     * Update the lut if needed..
     * @method update
     */
    this.update = function ()
    {
        if ( !needsUpdate ) {
            return;
        }
        // pre calculate loop values
        var size = windowLut.length;
        var center0 = center - 0.5;
        if ( isSigned ) {
            center0 += rescaleLut.getRSI().getSlope() * (size / 2);
        }
        var width0 = width - 1;
        var dispval = 0;
        if( !dwv.browser.hasClampedArray() )
        {
            var yMax = 255;
            var yMin = 0;
            for(var j=0; j<size; ++j)
            {
                // from the DICOM specification (https://www.dabsoft.ch/dicom/3/C.11.2.1.2/)
                // y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin )+ ymin
                dispval = ((rescaleLut.getValue(j) - center0 ) / width0 + 0.5) * 255;
                dispval = parseInt(dispval, 10);
                if ( dispval <= yMin ) {
                    windowLut[j] = yMin;
                }
                else if ( dispval > yMax ) {
                    windowLut[j] = yMax;
                }
                else {
                    windowLut[j] = dispval;
                }
            }
        }
        else
        {
            // when using Uint8ClampedArray, values are clamped between 0 and 255
            // no need to check
            for(var i=0; i<size; ++i)
            {
                // from the DICOM specification (https://www.dabsoft.ch/dicom/3/C.11.2.1.2/)
                // y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin )+ ymin
                dispval = ((rescaleLut.getValue(i) - center0 ) / width0 + 0.5) * 255;
                windowLut[i]= parseInt(dispval, 10);
            }
        }
        needsUpdate = false;
    };
    
    /**
     * Get the length of the LUT array.
     * @method getLength
     * @return {Number} The length of the LUT array.
     */ 
    this.getLength = function() { return windowLut.length; };

    /**
     * Get the value of the LUT at the given offset.
     * @method getValue
     * @return {Number} The value of the LUT at the given offset.
     */ 
    this.getValue = function(offset)
    {
        var shift = isSigned ? windowLut.length / 2 : 0;
        return windowLut[offset+shift];
    };
};

/**
* Lookup tables for image color display. 
*/

dwv.image.lut.range_max = 256;

dwv.image.lut.buildLut = function(func)
{
    var lut = [];
    for( var i=0; i<dwv.image.lut.range_max; ++i ) {
        lut.push(func(i));
    }
    return lut;
};

dwv.image.lut.max = function(/*i*/)
{
    return dwv.image.lut.range_max-1;
};

dwv.image.lut.maxFirstThird = function(i)
{
    if( i < dwv.image.lut.range_max/3 ) {
        return dwv.image.lut.range_max-1;
    }
    return 0;
};

dwv.image.lut.maxSecondThird = function(i)
{
    var third = dwv.image.lut.range_max/3;
    if( i >= third && i < 2*third ) {
        return dwv.image.lut.range_max-1;
    }
    return 0;
};

dwv.image.lut.maxThirdThird = function(i)
{
    if( i >= 2*dwv.image.lut.range_max/3 ) {
        return dwv.image.lut.range_max-1;
    }
    return 0;
};

dwv.image.lut.toMaxFirstThird = function(i)
{
    var val = i * 3;
    if( val > dwv.image.lut.range_max-1 ) {
        return dwv.image.lut.range_max-1;
    }
    return val;
};

dwv.image.lut.toMaxSecondThird = function(i)
{
    var third = dwv.image.lut.range_max/3;
    var val = 0;
    if( i >= third ) {
        val = (i-third) * 3;
        if( val > dwv.image.lut.range_max-1 ) {
            return dwv.image.lut.range_max-1;
        }
    }
    return val;
};

dwv.image.lut.toMaxThirdThird = function(i)
{
    var third = dwv.image.lut.range_max/3;
    var val = 0;
    if( i >= 2*third ) {
        val = (i-2*third) * 3;
        if( val > dwv.image.lut.range_max-1 ) {
            return dwv.image.lut.range_max-1;
        }
    }
    return val;
};

dwv.image.lut.zero = function(/*i*/)
{
    return 0;
};

dwv.image.lut.id = function(i)
{
    return i;
};

dwv.image.lut.invId = function(i)
{
    return (dwv.image.lut.range_max-1)-i;
};

// plain
dwv.image.lut.plain = {
    "red":   dwv.image.lut.buildLut(dwv.image.lut.id),
    "green": dwv.image.lut.buildLut(dwv.image.lut.id),
    "blue":  dwv.image.lut.buildLut(dwv.image.lut.id)
};

// inverse plain
dwv.image.lut.invPlain = {
    "red":   dwv.image.lut.buildLut(dwv.image.lut.invId),
    "green": dwv.image.lut.buildLut(dwv.image.lut.invId),
    "blue":  dwv.image.lut.buildLut(dwv.image.lut.invId)
};

//rainbow 
dwv.image.lut.rainbow = {
    "blue":  [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144, 148, 152, 156, 160, 164, 168, 172, 176, 180, 184, 188, 192, 196, 200, 204, 208, 212, 216, 220, 224, 228, 232, 236, 240, 244, 248, 252, 255, 247, 239, 231, 223, 215, 207, 199, 191, 183, 175, 167, 159, 151, 143, 135, 127, 119, 111, 103, 95, 87, 79, 71, 63, 55, 47, 39, 31, 23, 15, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "green": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160, 168, 176, 184, 192, 200, 208, 216, 224, 232, 240, 248, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 253, 251, 249, 247, 245, 243, 241, 239, 237, 235, 233, 231, 229, 227, 225, 223, 221, 219, 217, 215, 213, 211, 209, 207, 205, 203, 201, 199, 197, 195, 193, 192, 189, 186, 183, 180, 177, 174, 171, 168, 165, 162, 159, 156, 153, 150, 147, 144, 141, 138, 135, 132, 129, 126, 123, 120, 117, 114, 111, 108, 105, 102, 99, 96, 93, 90, 87, 84, 81, 78, 75, 72, 69, 66, 63, 60, 57, 54, 51, 48, 45, 42, 39, 36, 33, 30, 27, 24, 21, 18, 15, 12, 9, 6, 3],
    "red":   [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 62, 60, 58, 56, 54, 52, 50, 48, 46, 44, 42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144, 148, 152, 156, 160, 164, 168, 172, 176, 180, 184, 188, 192, 196, 200, 204, 208, 212, 216, 220, 224, 228, 232, 236, 240, 244, 248, 252, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]
};

// hot
dwv.image.lut.hot = {
    "red":   dwv.image.lut.buildLut(dwv.image.lut.toMaxFirstThird),
    "green": dwv.image.lut.buildLut(dwv.image.lut.toMaxSecondThird),
    "blue":  dwv.image.lut.buildLut(dwv.image.lut.toMaxThirdThird)
};

// test
dwv.image.lut.test = {
    "red":   dwv.image.lut.buildLut(dwv.image.lut.id),
    "green": dwv.image.lut.buildLut(dwv.image.lut.zero),
    "blue":  dwv.image.lut.buildLut(dwv.image.lut.zero)
};

//red
/*dwv.image.lut.red = {
   "red":   dwv.image.lut.buildLut(dwv.image.lut.max),
   "green": dwv.image.lut.buildLut(dwv.image.lut.id),
   "blue":  dwv.image.lut.buildLut(dwv.image.lut.id)
};*/
;/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
/**
 * Namespace for image related functions.
 * @class image
 * @namespace dwv
 * @static
 */
dwv.image = dwv.image || {};

/**
 * Get data from an input image using a canvas.
 * @method getDataFromImage
 * @static
 * @param {Image} image The image.
 * @return {Mixed} The corresponding view and info.
 */
dwv.image.getDataFromImage = function(image)
{
    // draw the image in the canvas in order to get its data
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
    // get the image data
    var imageData = ctx.getImageData(0, 0, image.width, image.height);
    // remove alpha
    // TODO support passing the full image data
    var buffer = [];
    var j = 0;
    for( var i = 0; i < imageData.data.length; i+=4 ) {
        buffer[j] = imageData.data[i];
        buffer[j+1] = imageData.data[i+1];
        buffer[j+2] = imageData.data[i+2];
        j+=3;
    }
    // create dwv Image
    var imageSize = new dwv.image.Size(image.width, image.height);
    // TODO: wrong info...
    var imageSpacing = new dwv.image.Spacing(1,1);
    var sliceIndex = image.index ? image.index : 0;
    var origin = new dwv.math.Point3D(0,0,sliceIndex);
    var geometry = new dwv.image.Geometry(origin, imageSize, imageSpacing );
    var dwvImage = new dwv.image.Image( geometry, buffer );
    dwvImage.setPhotometricInterpretation("RGB");
    // meta information
    var meta = {};
    meta.BitsStored = 8;
    dwvImage.setMeta(meta);
    // view
    var view = new dwv.image.View(dwvImage);
    view.setWindowLevelMinMax();
    // properties
    var info = {};
    if( image.file )
    {
        info.fileName = { "value": image.file.name };
        info.fileType = { "value": image.file.type };
        info.fileLastModifiedDate = { "value": image.file.lastModifiedDate };
    }
    info.imageWidth = { "value": image.width };
    info.imageHeight = { "value": image.height };
    // return
    return {"view": view, "info": info};
};

/**
 * Get data from an input buffer using a DICOM parser.
 * @method getDataFromDicomBuffer
 * @static
 * @param {Array} buffer The input data buffer.
 * @return {Mixed} The corresponding view and info.
 */
dwv.image.getDataFromDicomBuffer = function(buffer)
{
    // DICOM parser
    var dicomParser = new dwv.dicom.DicomParser();
    // parse the buffer
    dicomParser.parse(buffer);
    // create the view
    var viewFactory = new dwv.image.ViewFactory();
    var view = viewFactory.create( dicomParser.getDicomElements(), dicomParser.getPixelBuffer() );
    // return
    return {"view": view, "info": dicomParser.getDicomElements()};
};

;/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * View class.
 * @class View
 * @namespace dwv.image
 * @constructor
 * @param {Image} image The associated image.
 * @param {Boolean} isSigned Is the data signed.
 * Need to set the window lookup table once created
 * (either directly or with helper methods). 
 */
dwv.image.View = function(image, isSigned)
{
    /**
     * Window lookup tables, indexed per Rescale Slope and Intercept (RSI).
     * @property windowLuts
     * @private
     * @type Window
     */
    var windowLuts = {};
    
    /**
     * Window presets.
     * @property windowPresets
     * @private
     * @type Object
     */
    var windowPresets = null;
    /**
     * Color map
     * @property colorMap
     * @private
     * @type Object
     */
    var colorMap = dwv.image.lut.plain;
    /**
     * Current position
     * @property currentPosition
     * @private
     * @type Object
     */
    var currentPosition = {"i":0,"j":0,"k":0};
    
    /**
     * Get the associated image.
     * @method getImage
     * @return {Image} The associated image.
     */ 
    this.getImage = function() { return image; };
    /**
     * Set the associated image.
     * @method setImage
     * @param {Image} inImage The associated image.
     */ 
    this.setImage = function(inImage) { image = inImage; };
    
    /**
     * Get the window LUT of the image.
     * @method getWindowLut
     * @return {Window} The window LUT of the image.
     */ 
    this.getWindowLut = function (rsi) { 
        if ( typeof rsi === "undefined" ) {
            var sliceNumber = this.getCurrentPosition().k;
            rsi = image.getRescaleSlopeAndIntercept(sliceNumber);
        }
        return windowLuts[ rsi.toString() ];
    };
    /**
     * Set the window LUT of the image.
     * @method setWindowLut
     * @param {Window} wlut The window LUT of the image.
     */ 
    this.setWindowLut = function (wlut) 
    {
        var rsi = wlut.getRescaleLut().getRSI();
        windowLuts[rsi.toString()] = wlut;
    };
    
    var self = this;
    
    /**
     * Initialise the view. Only called at construction.
     * @method initialise
     * @private
     */ 
    function initialise()
    {
        // create the rescale lookup table
        var rescaleLut = new dwv.image.lut.Rescale(
            image.getRescaleSlopeAndIntercept(0) );
        // initialise the rescale lookup table
        rescaleLut.initialise(image.getMeta().BitsStored);
        // create the window lookup table
        var windowLut = new dwv.image.lut.Window(rescaleLut, isSigned);
        self.setWindowLut(windowLut);
    }
    
    // default constructor
    initialise();

    /**
     * Get the window presets.
     * @method getWindowPresets
     * @return {Object} The window presets.
     */ 
    this.getWindowPresets = function() { return windowPresets; };
    /**
     * Set the window presets.
     * @method setWindowPresets
     * @param {Object} presets The window presets.
     */ 
    this.setWindowPresets = function(presets) { 
        windowPresets = presets;
        this.setWindowLevel(presets[0].center, presets[0].width);
    };
    
    /**
     * Get the color map of the image.
     * @method getColorMap
     * @return {Object} The color map of the image.
     */ 
    this.getColorMap = function() { return colorMap; };
    /**
     * Set the color map of the image.
     * @method setColorMap
     * @param {Object} map The color map of the image.
     */ 
    this.setColorMap = function(map) { 
        colorMap = map;
        // TODO Better handle this...
        if( this.getImage().getPhotometricInterpretation() === "MONOCHROME1") {
            colorMap = dwv.image.lut.invPlain;
        }
        this.fireEvent({"type": "colorchange", 
           "wc": this.getWindowLut().getCenter(),
           "ww": this.getWindowLut().getWidth() });
    };
    
    /**
     * Is the data signed data.
     * @method isSigned
     * @return {Boolean} The signed data flag.
     */ 
    this.isSigned = function() { return isSigned; };
    
    /**
     * Get the current position.
     * @method getCurrentPosition
     * @return {Object} The current position.
     */ 
    this.getCurrentPosition = function() { return currentPosition; };
    /**
     * Set the current position. Returns false if not in bounds.
     * @method setCurrentPosition
     * @param {Object} pos The current position.
     */ 
    this.setCurrentPosition = function(pos) { 
        if( !image.getGeometry().getSize().isInBounds(pos.i,pos.j,pos.k) ) {
            return false;
        }
        var oldPosition = currentPosition;
        currentPosition = pos;
        // only display value for monochrome data
        if( image.getPhotometricInterpretation().match(/MONOCHROME/) !== null )
        {
            this.fireEvent({"type": "positionchange", 
                "i": pos.i, "j": pos.j, "k": pos.k,
                "value": image.getRescaledValue(pos.i,pos.j,pos.k)});
        }
        else
        {
            this.fireEvent({"type": "positionchange", 
                "i": pos.i, "j": pos.j, "k": pos.k});
        }
        // slice change event (used to trigger redraw)
        if( oldPosition.k !== currentPosition.k ) {
            this.fireEvent({"type": "slicechange"});
        }
        return true;
    };
    
    /**
     * Append another view to this one.
     * @method append
     * @param {Object} rhs The view to append.
     */
    this.append = function( rhs )
    {  
       // append images
       this.getImage().appendSlice( rhs.getImage() );
       // init to update self
       this.setWindowLut(rhs.getWindowLut());
    };
    
    /**
     * Set the view window/level.
     * @method setWindowLevel
     * @param {Number} center The window center.
     * @param {Number} width The window width.
     * Warning: uses the latest set rescale LUT or the default linear one.
     */
    this.setWindowLevel = function ( center, width )
    {
        // window width shall be >= 1 (see https://www.dabsoft.ch/dicom/3/C.11.2.1.2/)
        if ( width >= 1 ) {
            for ( var key in windowLuts ) {
                windowLuts[key].setCenterAndWidth(center, width);
            }
            this.fireEvent({"type": "wlchange", "wc": center, "ww": width });
        }
    };

    /**
     * Clone the image using all meta data and the original data buffer.
     * @method clone
     * @return {View} A full copy of this {dwv.image.View}.
     */
    this.clone = function ()
    {
        var copy = new dwv.image.View(this.getImage());
        for ( var key in windowLuts ) {
            copy.setWindowLut(windowLuts[key]);
        }
        copy.setListeners(this.getListeners());
        return copy;
    };

    /**
     * View listeners
     * @property listeners
     * @private
     * @type Object
     */
    var listeners = {};
    /**
     * Get the view listeners.
     * @method getListeners
     * @return {Object} The view listeners.
     */ 
    this.getListeners = function() { return listeners; };
    /**
     * Set the view listeners.
     * @method setListeners
     * @param {Object} list The view listeners.
     */ 
    this.setListeners = function(list) { listeners = list; };
};

/**
 * Set the image window/level to cover the full data range.
 * @method setWindowLevelMinMax
 * Warning: uses the latest set rescale LUT or the default linear one.
 */
dwv.image.View.prototype.setWindowLevelMinMax = function()
{
    // calculate center and width
    var range = this.getImage().getRescaledDataRange();
    var min = range.min;
    var max = range.max;
    var width = max - min;
    var center = min + width/2;
    // set window level
    this.setWindowLevel(center,width);
};
/**
 * Go to first slice .
 * @method goFirstSlice
 * @return {Boolean} False if not in bounds.
 */
dwv.image.View.prototype.goFirstSlice = function()
{
    return this.setCurrentPosition({
        "i": this.getCurrentPosition().i,
        "j": this.getCurrentPosition().j,
        "k":  0 
    });
};
/**
 * Increment the current slice number.
 * @method incrementSliceNb
 * @return {Boolean} False if not in bounds.
 */
dwv.image.View.prototype.incrementSliceNb = function()
{
    return this.setCurrentPosition({
        "i": this.getCurrentPosition().i,
        "j": this.getCurrentPosition().j,
        "k": this.getCurrentPosition().k + 1 
    });
};

/**
 * Decrement the current slice number.
 * @method decrementSliceNb
 * @return {Boolean} False if not in bounds.
 */
dwv.image.View.prototype.decrementSliceNb = function()
{
    return this.setCurrentPosition({
        "i": this.getCurrentPosition().i,
        "j": this.getCurrentPosition().j,
        "k": this.getCurrentPosition().k - 1 
    });
};

/**
 * Generate display image data to be given to a canvas.
 * @method generateImageData
 * @param {Array} array The array to fill in.
 * @param {Number} sliceNumber The slice position.
 */
dwv.image.View.prototype.generateImageData = function( array )
{        
    var sliceNumber = this.getCurrentPosition().k;
    var image = this.getImage();
    var pxValue = 0;
    var photoInterpretation = image.getPhotometricInterpretation();
    var planarConfig = image.getPlanarConfiguration();
    var windowLut = this.getWindowLut();
    windowLut.update();
    var colorMap = this.getColorMap();
    var index = 0;
    var sliceSize = image.getGeometry().getSize().getSliceSize();
    var sliceOffset = 0;
    switch (photoInterpretation)
    {
    case "MONOCHROME1":
    case "MONOCHROME2":
        sliceOffset = (sliceNumber || 0) * sliceSize;
        var iMax = sliceOffset + sliceSize;
        for(var i=sliceOffset; i < iMax; ++i)
        {        
            pxValue = parseInt( windowLut.getValue( 
                    image.getValueAtOffset(i) ), 10 );
            array.data[index] = colorMap.red[pxValue];
            array.data[index+1] = colorMap.green[pxValue];
            array.data[index+2] = colorMap.blue[pxValue];
            array.data[index+3] = 0xff;
            index += 4;
        }
        break;
    
    case "RGB":
        // the planar configuration defines the memory layout
        if( planarConfig !== 0 && planarConfig !== 1 ) {
            throw new Error("Unsupported planar configuration: "+planarConfig);
        }
        sliceOffset = (sliceNumber || 0) * 3 * sliceSize;
        // default: RGBRGBRGBRGB...
        var posR = sliceOffset;
        var posG = sliceOffset + 1;
        var posB = sliceOffset + 2;
        var stepPos = 3;
        // RRRR...GGGG...BBBB...
        if (planarConfig === 1) { 
            posR = sliceOffset;
            posG = sliceOffset + sliceSize;
            posB = sliceOffset + 2 * sliceSize;
            stepPos = 1;
        }
        
        var redValue = 0;
        var greenValue = 0;
        var blueValue = 0;
        for(var j=0; j < sliceSize; ++j)
        {        
            redValue = parseInt( windowLut.getValue( 
                    image.getValueAtOffset(posR) ), 10 );
            greenValue = parseInt( windowLut.getValue( 
                    image.getValueAtOffset(posG) ), 10 );
            blueValue = parseInt( windowLut.getValue( 
                    image.getValueAtOffset(posB) ), 10 );
            
            array.data[index] = redValue;
            array.data[index+1] = greenValue;
            array.data[index+2] = blueValue;
            array.data[index+3] = 0xff;
            index += 4;
            
            posR += stepPos;
            posG += stepPos;
            posB += stepPos;
        }
        break;
    
    default: 
        throw new Error("Unsupported photometric interpretation: "+photoInterpretation);
    }
};

/**
 * Add an event listener on the view.
 * @method addEventListener
 * @param {String} type The event type.
 * @param {Object} listener The method associated with the provided event type.
 */
dwv.image.View.prototype.addEventListener = function(type, listener)
{
    var listeners = this.getListeners();
    if( !listeners[type] ) {
        listeners[type] = [];
    }
    listeners[type].push(listener);
};

/**
 * Remove an event listener on the view.
 * @method removeEventListener
 * @param {String} type The event type.
 * @param {Object} listener The method associated with the provided event type.
 */
dwv.image.View.prototype.removeEventListener = function(type, listener)
{
    var listeners = this.getListeners();
    if( !listeners[type] ) {
        return;
    }
    for(var i=0; i < listeners[type].length; ++i)
    {   
        if( listeners[type][i] === listener ) {
            listeners[type].splice(i,1);
        }
    }
};

/**
 * Fire an event: call all associated listeners.
 * @method fireEvent
 * @param {Object} event The event to fire.
 */
dwv.image.View.prototype.fireEvent = function(event)
{
    var listeners = this.getListeners();
    if( !listeners[event.type] ) {
        return;
    }
    for(var i=0; i < listeners[event.type].length; ++i)
    {   
        listeners[event.type][i](event);
    }
};

/**
 * View factory.
 * @class ViewFactory
 * @namespace dwv.image
 * @constructor
 */
dwv.image.ViewFactory = function () {};

/**
 * Get an View object from the read DICOM file.
 * @method create
 * @param {Object} dicomElements The DICOM tags.
 * @param {Array} pixelBuffer The pixel buffer.
 * @returns {View} The new View.
 */
dwv.image.ViewFactory.prototype.create = function (dicomElements, pixelBuffer)
{
    // create the image
    var imageFactory = new dwv.image.ImageFactory();
    var image = imageFactory.create(dicomElements, pixelBuffer);
    
    // pixel representation
    var isSigned = 0;
    if ( dicomElements.PixelRepresentation ) {
        isSigned = dicomElements.PixelRepresentation.value[0];
    }
    // view
    var view = new dwv.image.View(image, isSigned);
    // window center and width
    var windowPresets = [];
    if ( dicomElements.WindowCenter && dicomElements.WindowWidth ) {
        var name;
        for ( var j = 0; j < dicomElements.WindowCenter.value.length; ++j) {
            var width = parseFloat( dicomElements.WindowWidth.value[j], 10 );
            if ( width !== 0 ) {
                if ( dicomElements.WindowCenterWidthExplanation ) {
                    name = dicomElements.WindowCenterWidthExplanation.value[j];
                }
                else {
                    name = "Default"+j;
                }
                windowPresets.push({
                    "center": parseFloat( dicomElements.WindowCenter.value[j], 10 ),
                    "width": width, 
                    "name": name
                });
            }
        }
    }
    if ( windowPresets.length !== 0 ) {
        view.setWindowPresets( windowPresets );
    }
    else {
        view.setWindowLevelMinMax();
    }

    return view;
};;/** 
 * I/O module.
 * @module io
 */
var dwv = dwv || {};
/**
 * Namespace for I/O functions.
 * @class io
 * @namespace dwv
 * @static
 */
dwv.io = dwv.io || {};

/**
 * File loader.
 * @class File
 * @namespace dwv.io
 * @constructor
 */
dwv.io.File = function()
{
    this.onload = null;
    this.onerror = null;
};

/**
 * Load a list of files.
 * @method load
 * @param {Array} ioArray The list of files to load.
 */
dwv.io.File.prototype.load = function(ioArray) 
{
    // create closure to the onload method
    var onload = this.onload;
    var onerror = this.onerror;

    // Request error
    var onErrorImageReader = function(event)
    {
        onerror( {'name': "RequestError", 
            'message': "An error occurred while reading the image file: "+event.getMessage() } );
    };


    // Request error
    var onErrorDicomReader = function(event)
    {
        onerror( {'name': "RequestError", 
            'message': "An error occurred while reading the DICOM file: "+event.getMessage() } );
    };
    
    // Request error
    var onErrorJSONReader = function(event)
    {
        onerror( {'name': "RequestError", 
            'message': "An error occurred while reading the JSON file: "+event.getMessage() } );
    };

    // DICOM reader loader
    var onLoadDicomReader = function(event)
    {
        // parse DICOM file
        try {
            var tmpdata = dwv.image.getDataFromDicomBuffer(event.target.result);
            // call listener
            onload(tmpdata);
        } catch(error) {
            onerror(error);
        }
        // force 100% progress (sometimes with firefox)
        var endEvent = {lengthComputable: true, loaded: 1, total: 1};
        dwv.gui.updateProgress(endEvent);
    };

    // JSON loader
    var onLoadJSONReader = function(/*event*/)
    {
        // parse image file
        try {
            // call listener
            onload(event.target.result);
        } catch(error) {
            onerror(error);
        }
    };

    // Image loader
    var onLoadImageFile = function(/*event*/)
    {
        // parse image file
        try {
            var tmpdata = dwv.image.getDataFromImage(this);
            // call listener
            onload(tmpdata);
        } catch(error) {
            onerror(error);
        }
    };

    // Image reader loader
    var onLoadImageReader = function(event)
    {
        var theImage = new Image();
        theImage.src = event.target.result;
        // storing values to pass them on
        theImage.file = this.file;
        theImage.index = this.index;
        // triggered by ctx.drawImage
        theImage.onload = onLoadImageFile;
    };

    // loop on I/O elements
    for (var i = 0; i < ioArray.length; ++i)
    {
        var file = ioArray[i];
        var reader = new FileReader();
        if ( file.name.split('.').pop().toLowerCase() === "json" )
        {
            reader.onload = onLoadJSONReader;
            reader.onprogress = dwv.gui.updateProgress;
            reader.onerror = onErrorJSONReader;
            reader.readAsText(file);
        }
        else if ( file.type.match("image.*") )
        {
            // storing values to pass them on
            reader.file = file;
            reader.index = i;
            // callbacks
            reader.onload = onLoadImageReader;
            reader.onprogress = dwv.gui.updateProgress;
            reader.onerror = onErrorImageReader;
            reader.readAsDataURL(file);
        }
        else
        {
            reader.onload = onLoadDicomReader;
            reader.onprogress = dwv.gui.updateProgress;
            reader.onerror = onErrorDicomReader;
            reader.readAsArrayBuffer(file);
        }
    }
};
;/** 
 * I/O module.
 * @module io
 */
var dwv = dwv || {};
/**
 * Namespace for I/O functions.
 * @class io
 * @namespace dwv
 * @static
 */
dwv.io = dwv.io || {};

/**
 * Url loader.
 * @class Url
 * @namespace dwv.io
 * @constructor
 */
dwv.io.Url = function()
{
    this.onload = null;
    this.onerror = null;
};

/**
 * Load a list of URLs.
 * @method load
 * @param {Array} ioArray The list of urls to load.
 */
dwv.io.Url.prototype.load = function(ioArray) 
{
    // create closure to the class data
    var onload = this.onload;
    var onerror = this.onerror;
    
    // Request error
    var onErrorRequest = function(/*event*/)
    {
        onerror( {'name': "RequestError", 
            'message': "An error occurred while retrieving the file: (http) "+this.status } );
    };

    // DICOM request loader
    var onLoadDicomRequest = function(response)
    {
        // parse DICOM file
        try {
            var tmpdata = dwv.image.getDataFromDicomBuffer(response);
            // call listener
            onload(tmpdata);
        } catch(error) {
            onerror(error);
        }
    };

    // Image request loader
    var onLoadImageRequest = function(/*event*/)
    {
        // parse image data
        try {
            var tmpdata = dwv.image.getDataFromImage(this);
            // call listener
            onload(tmpdata);
        } catch(error) {
            onerror(error);
        }
    };

    // Request handler
    var onLoadRequest = function(/*event*/)
    {
        // find the image type from its signature
        var view = new DataView(this.response);
        var isJpeg = view.getUint32(0) === 0xffd8ffe0;
        var isPng = view.getUint32(0) === 0x89504e47;
        var isGif = view.getUint32(0) === 0x47494638;
        
        // check possible extension
        // (responseURL is supported on major browsers but not IE...)
        if ( !isJpeg && !isPng && !isGif && this.responseURL )
        {
            var ext = this.responseURL.split('.').pop().toLowerCase();
            isJpeg = (ext === "jpg") || (ext === "jpeg");
            isPng = (ext === "png");
            isGif = (ext === "gif");
        }
        
        // non DICOM
        if( isJpeg || isPng || isGif )
        {
            // image data as string
            var bytes = new Uint8Array(this.response);
            var imageDataStr = '';
            for( var i = 0; i < bytes.byteLength; ++i ) {
                imageDataStr += String.fromCharCode(bytes[i]);
            }
            // image type
            var imageType = "unknown";
            if(isJpeg) {
                imageType = "jpeg";
            }
            else if(isPng) {
                imageType = "png";
            }
            else if(isGif) {
                imageType = "gif";
            }
            // temporary image object
            var tmpImage = new Image();
            tmpImage.src = "data:image/" + imageType + ";base64," + window.btoa(imageDataStr);
            tmpImage.onload = onLoadImageRequest;
        }
        else
        {
            onLoadDicomRequest(this.response);
        }
    };

    // loop on I/O elements
    for (var i = 0; i < ioArray.length; ++i)
    {
        var url = ioArray[i];
        var request = new XMLHttpRequest();
        // TODO Verify URL...
        request.open('GET', url, true);
        request.responseType = "arraybuffer"; 
        request.onload = onLoadRequest;
        request.onerror = onErrorRequest;
        request.onprogress = dwv.gui.updateProgress;
        request.send(null);
    }
};
;/** 
 * Math module.
 * @module math
 */
var dwv = dwv || {};
dwv.math = dwv.math || {};

/** 
 * Circular Bucket Queue.
 *
 * Returns input'd points in sorted order. All operations run in roughly O(1)
 * time (for input with small cost values), but it has a strict requirement:
 *
 * If the most recent point had a cost of c, any points added should have a cost
 * c' in the range c <= c' <= c + (capacity - 1).
 * 
 * @class BucketQueue
 * @namespace dwv.math
 * @constructor
 * @input bits
 * @input cost_functor
 */
dwv.math.BucketQueue = function(bits, cost_functor)
{
    this.bucketCount = 1 << bits; // # of buckets = 2^bits
    this.mask = this.bucketCount - 1; // 2^bits - 1 = index mask
    this.size = 0;
    
    this.loc = 0; // Current index in bucket list
    
    // Cost defaults to item value
    this.cost = (typeof(cost_functor) !== 'undefined') ? cost_functor : function(item) {
        return item;
    };
    
    this.buckets = this.buildArray(this.bucketCount);
};

dwv.math.BucketQueue.prototype.push = function(item) {
    // Prepend item to the list in the appropriate bucket
    var bucket = this.getBucket(item);
    item.next = this.buckets[bucket];
    this.buckets[bucket] = item;
    
    this.size++;
};

dwv.math.BucketQueue.prototype.pop = function() {
    if ( this.size === 0 ) {
        throw new Error("Cannot pop, bucketQueue is empty.");
    }
    
    // Find first empty bucket
    while ( this.buckets[this.loc] === null ) {
        this.loc = (this.loc + 1) % this.bucketCount;
    }
    
    // All items in bucket have same cost, return the first one
    var ret = this.buckets[this.loc];
    this.buckets[this.loc] = ret.next;
    ret.next = null;
    
    this.size--;
    return ret;
};

dwv.math.BucketQueue.prototype.remove = function(item) {
    // Tries to remove item from queue. Returns true on success, false otherwise
    if ( !item ) {
        return false;
    }
    
    // To find node, go to bucket and search through unsorted list.
    var bucket = this.getBucket(item);
    var node = this.buckets[bucket];
    
    while ( node !== null && !item.equals(node.next) ) {
        node = node.next;
    }
    
    if ( node === null ) {
        // Item not in list, ergo item not in queue
        return false;
    } 
    else {
        // Found item, do standard list node deletion
        node.next = node.next.next;
        
        this.size--;
        return true;
    }
};

dwv.math.BucketQueue.prototype.isEmpty = function() {
    return this.size === 0;
};

dwv.math.BucketQueue.prototype.getBucket = function(item) {
    // Bucket index is the masked cost
    return this.cost(item) & this.mask;
};

dwv.math.BucketQueue.prototype.buildArray = function(newSize) {
    // Create array and initialze pointers to null
    var buckets = new Array(newSize);
    
    for ( var i = 0; i < buckets.length; i++ ) {
        buckets[i] = null;
    }
    
    return buckets;
};
;/** 
 * Math module.
 * @module math
 */
var dwv = dwv || {};
/**
 * Namespace for math functions.
 * @class math
 * @namespace dwv
 * @static
 */
dwv.math = dwv.math || {};

/** 
 * Immutable 2D point.
 * @class Point2D
 * @namespace dwv.math
 * @constructor
 * @param {Number} x The X coordinate for the point.
 * @param {Number} y The Y coordinate for the point.
 */
dwv.math.Point2D = function (x,y)
{
    /** 
     * Get the X position of the point.
     * @method getX
     * @return {Number} The X position of the point.
     */
    this.getX = function () { return x; };
    /** 
     * Get the Y position of the point.
     * @method getY
     * @return {Number} The Y position of the point. 
     */
    this.getY = function () { return y; };
}; // Point2D class

/** 
 * Check for Point2D equality.
 * @method equals
 * @param {Point2D} rhs The other Point2D to compare to.
 * @return {Boolean} True if both points are equal.
 */ 
dwv.math.Point2D.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getX() === rhs.getX() &&
        this.getY() === rhs.getY();
};

/** 
 * Get a string representation of the Point2D.
 * @method toString
 * @return {String} The Point2D as a string.
 */ 
dwv.math.Point2D.prototype.toString = function () {
    return "(" + this.getX() + ", " + this.getY() + ")";
};

/** 
 * Mutable 2D point.
 * @class FastPoint2D
 * @namespace dwv.math
 * @constructor
 * @param {Number} x The X coordinate for the point.
 * @param {Number} y The Y coordinate for the point.
 */
dwv.math.FastPoint2D = function (x,y)
{
    this.x = x;
    this.y = y;
}; // FastPoint2D class

/** 
 * Check for FastPoint2D equality.
 * @method equals
 * @param {FastPoint2D} other The other FastPoint2D to compare to.
 * @return {Boolean} True if both points are equal.
 */ 
dwv.math.FastPoint2D.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.x === rhs.x &&
        this.y === rhs.y;
};

/** 
 * Get a string representation of the FastPoint2D.
 * @method toString
 * @return {String} The Point2D as a string.
 */ 
dwv.math.FastPoint2D.prototype.toString = function () {
    return "(" + this.x + ", " + this.y + ")";
};

/** 
 * Immutable 3D point.
 * @class Point3D
 * @namespace dwv.math
 * @constructor
 * @param {Number} x The X coordinate for the point.
 * @param {Number} y The Y coordinate for the point.
 * @param {Number} z The Z coordinate for the point.
 */
dwv.math.Point3D = function (x,y,z)
{
    /** 
     * Get the X position of the point.
     * @method getX
     * @return {Number} The X position of the point.
     */
    this.getX = function () { return x; };
    /** 
     * Get the Y position of the point.
     * @method getY
     * @return {Number} The Y position of the point. 
     */
    this.getY = function () { return y; };
    /** 
     * Get the Z position of the point.
     * @method getZ
     * @return {Number} The Z position of the point. 
     */
    this.getZ = function () { return z; };
}; // Point3D class

/** 
 * Check for Point3D equality.
 * @method equals
 * @param {Point3D} rhs The other Point3D to compare to.
 * @return {Boolean} True if both points are equal.
 */ 
dwv.math.Point3D.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getX() === rhs.getX() &&
        this.getY() === rhs.getY() &&
        this.getZ() === rhs.getZ();
};

/** 
 * Get a string representation of the Point3D.
 * @method toString
 * @return {String} The Point3D as a string.
 */ 
dwv.math.Point3D.prototype.toString = function () {
    return "(" + this.getX() + 
        ", " + this.getY() +
        ", " + this.getZ() + ")";
};

/** 
 * Immutable 3D index.
 * @class Index3D
 * @namespace dwv.math
 * @constructor
 * @param {Number} i The column index.
 * @param {Number} j The row index.
 * @param {Number} k The slice index.
 */
dwv.math.Index3D = function (i,j,k)
{
    /** 
     * Get the column index.
     * @method getI
     * @return {Number} The column index.
     */
    this.getI = function () { return i; };
    /** 
     * Get the row index.
     * @method getJ
     * @return {Number} The row index. 
     */
    this.getJ = function () { return j; };
    /** 
     * Get the slice index.
     * @method getK
     * @return {Number} The slice index. 
     */
    this.getK = function () { return k; };
}; // Index3D class

/** 
 * Check for Index3D equality.
 * @method equals
 * @param {Index3D} rhs The other Index3D to compare to.
 * @return {Boolean} True if both points are equal.
 */ 
dwv.math.Index3D.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getI() === rhs.getI() &&
        this.getJ() === rhs.getJ() &&
        this.getK() === rhs.getK();
};

/** 
 * Get a string representation of the Index3D.
 * @method toString
 * @return {String} The Index3D as a string.
 */ 
dwv.math.Index3D.prototype.toString = function () {
    return "(" + this.getI() + 
        ", " + this.getJ() +
        ", " + this.getK() + ")";
};


;/** 
 * Math module.
 * @module math
 */
var dwv = dwv || {};
dwv.math = dwv.math || {};

// Pre-created to reduce allocation in inner loops
var __twothirdpi = ( 2 / (3 * Math.PI) );

/**
 * 
 */
dwv.math.computeGreyscale = function(data, width, height) {
    // Returns 2D augmented array containing greyscale data
    // Greyscale values found by averaging color channels
    // Input should be in a flat RGBA array, with values between 0 and 255
    var greyscale = [];

    // Compute actual values
    for (var y = 0; y < height; y++) {
        greyscale[y] = [];

        for (var x = 0; x < width; x++) {
            var p = (y*width + x)*4;
            greyscale[y][x] = (data[p] + data[p+1] + data[p+2]) / (3*255);
        }
    }

    // Augment with convenience functions
    greyscale.dx = function(x,y) {
        if ( x+1 === this[y].length ) {
            // If we're at the end, back up one
            x--;
        }
        return this[y][x+1] - this[y][x];
    };

    greyscale.dy = function(x,y) {
        if ( y+1 === this.length ) {
            // If we're at the end, back up one
            y--;
        }
        return this[y][x] - this[y+1][x];
    };

    greyscale.gradMagnitude = function(x,y) {
        var dx = this.dx(x,y); 
        var dy = this.dy(x,y);
        return Math.sqrt(dx*dx + dy*dy);
    };

    greyscale.laplace = function(x,y) { 
        // Laplacian of Gaussian
        var lap = -16 * this[y][x];
        lap += this[y-2][x];
        lap += this[y-1][x-1] + 2*this[y-1][x] + this[y-1][x+1];
        lap += this[y][x-2]   + 2*this[y][x-1] + 2*this[y][x+1] + this[y][x+2];
        lap += this[y+1][x-1] + 2*this[y+1][x] + this[y+1][x+1];
        lap += this[y+2][x];

        return lap;
    };

    return greyscale;
};

/**
 * 
 */
dwv.math.computeGradient = function(greyscale) {
    // Returns a 2D array of gradient magnitude values for greyscale. The values
    // are scaled between 0 and 1, and then flipped, so that it works as a cost
    // function.
    var gradient = [];

    var max = 0; // Maximum gradient found, for scaling purposes

    var x = 0;
    var y = 0;
    
    for (y = 0; y < greyscale.length-1; y++) {
        gradient[y] = [];

        for (x = 0; x < greyscale[y].length-1; x++) {
            gradient[y][x] = greyscale.gradMagnitude(x,y);
            max = Math.max(gradient[y][x], max);
        }

        gradient[y][greyscale[y].length-1] = gradient[y][greyscale.length-2];
    }

    gradient[greyscale.length-1] = [];
    for (var i = 0; i < gradient[0].length; i++) {
        gradient[greyscale.length-1][i] = gradient[greyscale.length-2][i];
    }

    // Flip and scale.
    for (y = 0; y < gradient.length; y++) {
        for (x = 0; x < gradient[y].length; x++) {
            gradient[y][x] = 1 - (gradient[y][x] / max);
        }
    }

    return gradient;
};

/**
 * 
 */
dwv.math.computeLaplace = function(greyscale) {
    // Returns a 2D array of Laplacian of Gaussian values
    var laplace = [];

    // Make the edges low cost here.

    laplace[0] = [];
    laplace[1] = [];
    for (var i = 1; i < greyscale.length; i++) {
        // Pad top, since we can't compute Laplacian
        laplace[0][i] = 1;
        laplace[1][i] = 1;
    }

    for (var y = 2; y < greyscale.length-2; y++) {
        laplace[y] = [];
        // Pad left, ditto
        laplace[y][0] = 1;
        laplace[y][1] = 1;

        for (var x = 2; x < greyscale[y].length-2; x++) {
            // Threshold needed to get rid of clutter.
            laplace[y][x] = (greyscale.laplace(x,y) > 0.33) ? 0 : 1;
        }

        // Pad right, ditto
        laplace[y][greyscale[y].length-2] = 1;
        laplace[y][greyscale[y].length-1] = 1;
    }
    
    laplace[greyscale.length-2] = [];
    laplace[greyscale.length-1] = [];
    for (var j = 1; j < greyscale.length; j++) {
        // Pad bottom, ditto
        laplace[greyscale.length-2][j] = 1;
        laplace[greyscale.length-1][j] = 1;
    }

    return laplace;
};

dwv.math.computeGradX = function(greyscale) {
    // Returns 2D array of x-gradient values for greyscale
    var gradX = [];

    for ( var y = 0; y < greyscale.length; y++ ) {
        gradX[y] = [];

        for ( var x = 0; x < greyscale[y].length-1; x++ ) {
            gradX[y][x] = greyscale.dx(x,y);
        }

        gradX[y][greyscale[y].length-1] = gradX[y][greyscale[y].length-2];
    }

    return gradX;
};

dwv.math.computeGradY = function(greyscale) {
    // Returns 2D array of y-gradient values for greyscale
    var gradY = [];

    for (var y = 0; y < greyscale.length-1; y++) {
        gradY[y] = [];

        for ( var x = 0; x < greyscale[y].length; x++ ) {
            gradY[y][x] = greyscale.dy(x,y);
        }
    }

    gradY[greyscale.length-1] = [];
    for ( var i = 0; i < greyscale[0].length; i++ ) {
        gradY[greyscale.length-1][i] = gradY[greyscale.length-2][i];
    }

    return gradY;
};

dwv.math.gradUnitVector = function(gradX, gradY, px, py, out) {
    // Returns the gradient vector at (px,py), scaled to a magnitude of 1
    var ox = gradX[py][px]; 
    var oy = gradY[py][px];

    var gvm = Math.sqrt(ox*ox + oy*oy);
    gvm = Math.max(gvm, 1e-100); // To avoid possible divide-by-0 errors

    out.x = ox / gvm;
    out.y = oy / gvm;
};

dwv.math.gradDirection = function(gradX, gradY, px, py, qx, qy) {
    var __dgpuv = new dwv.math.FastPoint2D(-1, -1); 
    var __gdquv = new dwv.math.FastPoint2D(-1, -1);
    // Compute the gradiant direction, in radians, between to points
    dwv.math.gradUnitVector(gradX, gradY, px, py, __dgpuv);
    dwv.math.gradUnitVector(gradX, gradY, qx, qy, __gdquv);

    var dp = __dgpuv.y * (qx - px) - __dgpuv.x * (qy - py);
    var dq = __gdquv.y * (qx - px) - __gdquv.x * (qy - py);

    // Make sure dp is positive, to keep things consistant
    if (dp < 0) {
        dp = -dp; 
        dq = -dq;
    }

    if ( px !== qx && py !== qy ) {
        // We're going diagonally between pixels
        dp *= Math.SQRT1_2;
        dq *= Math.SQRT1_2;
    }

    return __twothirdpi * (Math.acos(dp) + Math.acos(dq));
};

dwv.math.computeSides = function(dist, gradX, gradY, greyscale) {
    // Returns 2 2D arrays, containing inside and outside greyscale values.
    // These greyscale values are the intensity just a little bit along the
    // gradient vector, in either direction, from the supplied point. These
    // values are used when using active-learning Intelligent Scissors
    
    var sides = {};
    sides.inside = [];
    sides.outside = [];

    var guv = new dwv.math.FastPoint2D(-1, -1); // Current gradient unit vector

    for ( var y = 0; y < gradX.length; y++ ) {
        sides.inside[y] = [];
        sides.outside[y] = [];

        for ( var x = 0; x < gradX[y].length; x++ ) {
            dwv.math.gradUnitVector(gradX, gradY, x, y, guv);

            //(x, y) rotated 90 = (y, -x)

            var ix = Math.round(x + dist*guv.y);
            var iy = Math.round(y - dist*guv.x);
            var ox = Math.round(x - dist*guv.y);
            var oy = Math.round(y + dist*guv.x);

            ix = Math.max(Math.min(ix, gradX[y].length-1), 0);
            ox = Math.max(Math.min(ox, gradX[y].length-1), 0);
            iy = Math.max(Math.min(iy, gradX.length-1), 0);
            oy = Math.max(Math.min(oy, gradX.length-1), 0);

            sides.inside[y][x] = greyscale[iy][ix];
            sides.outside[y][x] = greyscale[oy][ox];
        }
    }

    return sides;
};

dwv.math.gaussianBlur = function(buffer, out) {
    // Smooth values over to fill in gaps in the mapping
    out[0] = 0.4*buffer[0] + 0.5*buffer[1] + 0.1*buffer[1];
    out[1] = 0.25*buffer[0] + 0.4*buffer[1] + 0.25*buffer[2] + 0.1*buffer[3];

    for ( var i = 2; i < buffer.length-2; i++ ) {
        out[i] = 0.05*buffer[i-2] + 0.25*buffer[i-1] + 0.4*buffer[i] + 0.25*buffer[i+1] + 0.05*buffer[i+2];
    }

    var len = buffer.length;
    out[len-2] = 0.25*buffer[len-1] + 0.4*buffer[len-2] + 0.25*buffer[len-3] + 0.1*buffer[len-4];
    out[len-1] = 0.4*buffer[len-1] + 0.5*buffer[len-2] + 0.1*buffer[len-3];
};


/**
 * Scissors
 * @class Scissors
 * @namespace dwv.math
 * @constructor
 * 
 * Ref: Eric N. Mortensen, William A. Barrett, Interactive Segmentation with
 *   Intelligent Scissors, Graphical Models and Image Processing, Volume 60,
 *   Issue 5, September 1998, Pages 349-384, ISSN 1077-3169,
 *   DOI: 10.1006/gmip.1998.0480.
 * 
 * (http://www.sciencedirect.com/science/article/B6WG4-45JB8WN-9/2/6fe59d8089fd1892c2bfb82283065579)
 * 
 * Highly inspired from http://code.google.com/p/livewire-javascript/
 */
dwv.math.Scissors = function()
{
    this.width = -1;
    this.height = -1;

    this.curPoint = null; // Corrent point we're searching on.
    this.searchGranBits = 8; // Bits of resolution for BucketQueue.
    this.searchGran = 1 << this.earchGranBits; //bits.
    this.pointsPerPost = 500;

    // Precomputed image data. All in ranges 0 >= x >= 1 and all inverted (1 - x).
    this.greyscale = null; // Greyscale of image
    this.laplace = null; // Laplace zero-crossings (either 0 or 1).
    this.gradient = null; // Gradient magnitudes.
    this.gradX = null; // X-differences.
    this.gradY = null; // Y-differences.

    this.parents = null; // Matrix mapping point => parent along shortest-path to root.

    this.working = false; // Currently computing shortest paths?

    // Begin Training:
    this.trained = false;
    this.trainingPoints = null;

    this.edgeWidth = 2;
    this.trainingLength = 32;

    this.edgeGran = 256;
    this.edgeTraining = null;

    this.gradPointsNeeded = 32;
    this.gradGran = 1024;
    this.gradTraining = null;

    this.insideGran = 256;
    this.insideTraining = null;

    this.outsideGran = 256;
    this.outsideTraining = null;
    // End Training
}; // Scissors class

// Begin training methods //
dwv.math.Scissors.prototype.getTrainingIdx = function(granularity, value) {
    return Math.round((granularity - 1) * value);
};

dwv.math.Scissors.prototype.getTrainedEdge = function(edge) {
    return this.edgeTraining[this.getTrainingIdx(this.edgeGran, edge)];
};

dwv.math.Scissors.prototype.getTrainedGrad = function(grad) {
    return this.gradTraining[this.getTrainingIdx(this.gradGran, grad)];
};

dwv.math.Scissors.prototype.getTrainedInside = function(inside) {
    return this.insideTraining[this.getTrainingIdx(this.insideGran, inside)];
};

dwv.math.Scissors.prototype.getTrainedOutside = function(outside) {
    return this.outsideTraining[this.getTrainingIdx(this.outsideGran, outside)];
};
// End training methods //

dwv.math.Scissors.prototype.setWorking = function(working) {
    // Sets working flag
    this.working = working;
};

dwv.math.Scissors.prototype.setDimensions = function(width, height) {
    this.width = width;
    this.height = height;
};

dwv.math.Scissors.prototype.setData = function(data) {
    if ( this.width === -1 || this.height === -1 ) {
        // The width and height should have already been set
        throw new Error("Dimensions have not been set.");
    }

    this.greyscale = dwv.math.computeGreyscale(data, this.width, this.height);
    this.laplace = dwv.math.computeLaplace(this.greyscale);
    this.gradient = dwv.math.computeGradient(this.greyscale);
    this.gradX = dwv.math.computeGradX(this.greyscale);
    this.gradY = dwv.math.computeGradY(this.greyscale);
    
    var sides = dwv.math.computeSides(this.edgeWidth, this.gradX, this.gradY, this.greyscale);
    this.inside = sides.inside;
    this.outside = sides.outside;
    this.edgeTraining = [];
    this.gradTraining = [];
    this.insideTraining = [];
    this.outsideTraining = [];
};

dwv.math.Scissors.prototype.findTrainingPoints = function(p) {
    // Grab the last handful of points for training
    var points = [];

    if ( this.parents !== null ) {
        for ( var i = 0; i < this.trainingLength && p; i++ ) {
            points.push(p);
            p = this.parents[p.y][p.x];
        }
    }

    return points;
};

dwv.math.Scissors.prototype.resetTraining = function() {
    this.trained = false; // Training is ignored with this flag set
};

dwv.math.Scissors.prototype.doTraining = function(p) {
    // Compute training weights and measures
    this.trainingPoints = this.findTrainingPoints(p);

    if ( this.trainingPoints.length < 8 ) {
        return; // Not enough points, I think. It might crash if length = 0.
    }

    var buffer = [];
    this.calculateTraining(buffer, this.edgeGran, this.greyscale, this.edgeTraining);
    this.calculateTraining(buffer, this.gradGran, this.gradient, this.gradTraining);
    this.calculateTraining(buffer, this.insideGran, this.inside, this.insideTraining);
    this.calculateTraining(buffer, this.outsideGran, this.outside, this.outsideTraining);

    if ( this.trainingPoints.length < this.gradPointsNeeded ) {
        // If we have two few training points, the gradient weight map might not
        // be smooth enough, so average with normal weights.
        this.addInStaticGrad(this.trainingPoints.length, this.gradPointsNeeded);
    }

    this.trained = true;
};

dwv.math.Scissors.prototype.calculateTraining = function(buffer, granularity, input, output) {
    var i = 0;
    // Build a map of raw-weights to trained-weights by favoring input values
    buffer.length = granularity;
    for ( i = 0; i < granularity; i++ ) {
        buffer[i] = 0;
    }

    var maxVal = 1;
    for ( i = 0; i < this.trainingPoints.length; i++ ) {
        var p = this.trainingPoints[i];
        var idx = this.getTrainingIdx(granularity, input[p.y][p.x]);
        buffer[idx] += 1;

        maxVal = Math.max(maxVal, buffer[idx]);
    }

    // Invert and scale.
    for ( i = 0; i < granularity; i++ ) {
        buffer[i] = 1 - buffer[i] / maxVal;
    }

    // Blur it, as suggested. Gets rid of static.
    dwv.math.gaussianBlur(buffer, output);
};

dwv.math.Scissors.prototype.addInStaticGrad = function(have, need) {
    // Average gradient raw-weights to trained-weights map with standard weight
    // map so that we don't end up with something to spiky
    for ( var i = 0; i < this.gradGran; i++ ) {
        this.gradTraining[i] = Math.min(this.gradTraining[i],  1 - i*(need - have)/(need*this.gradGran));
    }
};

dwv.math.Scissors.prototype.gradDirection = function(px, py, qx, qy) {
    return dwv.math.gradDirection(this.gradX, this.gradY, px, py, qx, qy);
};

dwv.math.Scissors.prototype.dist = function(px, py, qx, qy) {
    // The grand culmunation of most of the code: the weighted distance function
    var grad =  this.gradient[qy][qx];

    if ( px === qx || py === qy ) {
        // The distance is Euclidean-ish; non-diagonal edges should be shorter
        grad *= Math.SQRT1_2;
    }

    var lap = this.laplace[qy][qx];
    var dir = this.gradDirection(px, py, qx, qy);

    if ( this.trained ) {
        // Apply training magic
        var gradT = this.getTrainedGrad(grad);
        var edgeT = this.getTrainedEdge(this.greyscale[py][px]);
        var insideT = this.getTrainedInside(this.inside[py][px]);
        var outsideT = this.getTrainedOutside(this.outside[py][px]);

        return 0.3*gradT + 0.3*lap + 0.1*(dir + edgeT + insideT + outsideT);
    } else {
        // Normal weights
        return 0.43*grad + 0.43*lap + 0.11*dir;
    }
};

dwv.math.Scissors.prototype.adj = function(p) {
    var list = [];

    var sx = Math.max(p.x-1, 0);
    var sy = Math.max(p.y-1, 0);
    var ex = Math.min(p.x+1, this.greyscale[0].length-1);
    var ey = Math.min(p.y+1, this.greyscale.length-1);

    var idx = 0;
    for ( var y = sy; y <= ey; y++ ) {
        for ( var x = sx; x <= ex; x++ ) {
            if ( x !== p.x || y !== p.y ) {
                list[idx++] = new dwv.math.FastPoint2D(x,y);
            }
        }
    }

    return list;
};

dwv.math.Scissors.prototype.setPoint = function(sp) {
    this.setWorking(true);

    this.curPoint = sp;
    
    var x = 0;
    var y = 0;

    this.visited = [];
    for ( y = 0; y < this.height; y++ ) {
        this.visited[y] = [];
        for ( x = 0; x < this.width; x++ ) {
            this.visited[y][x] = false;
        }
    }

    this.parents = [];
    for ( y = 0; y < this.height; y++ ) {
        this.parents[y] = [];
    }

    this.cost = [];
    for ( y = 0; y < this.height; y++ ) {
        this.cost[y] = [];
        for ( x = 0; x < this.width; x++ ) {
            this.cost[y][x] = Number.MAX_VALUE;
        }
    }

    this.pq = new dwv.math.BucketQueue(this.searchGranBits, function(p) {
        return Math.round(this.searchGran * this.costArr[p.y][p.x]);
    });
    this.pq.searchGran = this.searchGran;
    this.pq.costArr = this.cost;

    this.pq.push(sp);
    this.cost[sp.y][sp.x] = 0;
};

dwv.math.Scissors.prototype.doWork = function() {
    if ( !this.working ) {
        return;
    }

    this.timeout = null;

    var pointCount = 0;
    var newPoints = [];
    while ( !this.pq.isEmpty() && pointCount < this.pointsPerPost ) {
        var p = this.pq.pop();
        newPoints.push(p);
        newPoints.push(this.parents[p.y][p.x]);

        this.visited[p.y][p.x] = true;

        var adjList = this.adj(p);
        for ( var i = 0; i < adjList.length; i++) {
            var q = adjList[i];

            var pqCost = this.cost[p.y][p.x] + this.dist(p.x, p.y, q.x, q.y);

            if ( pqCost < this.cost[q.y][q.x] ) {
                if ( this.cost[q.y][q.x] !== Number.MAX_VALUE ) {
                    // Already in PQ, must remove it so we can re-add it.
                    this.pq.remove(q);
                }

                this.cost[q.y][q.x] = pqCost;
                this.parents[q.y][q.x] = p;
                this.pq.push(q);
            }
        }

        pointCount++;
    }

    return newPoints;
};
;/** 
 * Math module.
 * @module math
 */
var dwv = dwv || {};
/**
 * Namespace for math functions.
 * @class math
 * @namespace dwv
 * @static
 */
dwv.math = dwv.math || {};

/** 
 * Circle shape.
 * @class Circle
 * @namespace dwv.math
 * @constructor
 * @param {Object} centre A Point2D representing the centre of the circle.
 * @param {Number} radius The radius of the circle.
 */
dwv.math.Circle = function(centre, radius)
{
    /**
     * Circle surface.
     * @property surface
     * @private
     * @type Number
     */
    var surface = Math.PI*radius*radius;

    /**
     * Get the centre (point) of the circle.
     * @method getCenter
     * @return {Object} The center (point) of the circle.
     */
    this.getCenter = function() { return centre; };
    /**
     * Get the radius of the circle.
     * @method getRadius
     * @return {Number} The radius of the circle.
     */
    this.getRadius = function() { return radius; };
    /**
     * Get the surface of the circle.
     * @method getSurface
     * @return {Number} The surface of the circle.
     */
    this.getSurface = function() { return surface; };
    /**
     * Get the surface of the circle with a spacing.
     * @method getWorldSurface
     * @param {Number} spacingX The X spacing.
     * @param {Number} spacingY The Y spacing.
     * @return {Number} The surface of the circle multiplied by the given spacing.
     */
    this.getWorldSurface = function(spacingX, spacingY)
    {
        return surface * spacingX * spacingY;
    };
}; // Circle class

/** 
 * Ellipse shape.
 * @class Ellipse
 * @namespace dwv.math
 * @constructor
 * @param {Object} centre A Point2D representing the centre of the ellipse.
 * @param {Number} a The radius of the ellipse on the horizontal axe.
 * @param {Number} b The radius of the ellipse on the vertical axe.
 */
dwv.math.Ellipse = function(centre, a, b)
{
    /**
     * Circle surface.
     * @property surface
     * @private
     * @type Number
     */
    var surface = Math.PI*a*b;

    /**
     * Get the centre (point) of the ellipse.
     * @method getCenter
     * @return {Object} The center (point) of the ellipse.
     */
    this.getCenter = function() { return centre; };
    /**
     * Get the radius of the ellipse on the horizontal axe.
     * @method getA
     * @return {Number} The radius of the ellipse on the horizontal axe.
     */
    this.getA = function() { return a; };
    /**
     * Get the radius of the ellipse on the vertical axe.
     * @method getB
     * @return {Number} The radius of the ellipse on the vertical axe.
     */
    this.getB = function() { return b; };
    /**
     * Get the surface of the ellipse.
     * @method getSurface
     * @return {Number} The surface of the ellipse.
     */
    this.getSurface = function() { return surface; };
    /**
     * Get the surface of the ellipse with a spacing.
     * @method getWorldSurface
     * @param {Number} spacingX The X spacing.
     * @param {Number} spacingY The Y spacing.
     * @return {Number} The surface of the ellipse multiplied by the given spacing.
     */
    this.getWorldSurface = function(spacingX, spacingY)
    {
        return surface * spacingX * spacingY;
    };
}; // Circle class

/**
 * Line shape.
 * @class Line
 * @namespace dwv.math
 * @constructor
 * @param {Object} begin A Point2D representing the beginning of the line.
 * @param {Object} end A Point2D representing the end of the line.
 */
dwv.math.Line = function(begin, end)
{
    /**
     * Line delta in the X direction.
     * @property dx
     * @private
     * @type Number
     */
    var dx = end.getX() - begin.getX();
    /**
     * Line delta in the Y direction.
     * @property dy
     * @private
     * @type Number
     */
    var dy = end.getY() - begin.getY();
    /**
     * Line length.
     * @property length
     * @private
     * @type Number
     */
    var length = Math.sqrt( dx * dx + dy * dy );
        
    /**
     * Get the begin point of the line.
     * @method getBegin
     * @return {Object} The beginning point of the line.
     */
    this.getBegin = function() { return begin; };
    /**
     * Get the end point of the line.
     * @method getEnd
     * @return {Object} The ending point of the line.
     */
    this.getEnd = function() { return end; };
    /**
     * Get the line delta in the X direction.
     * @method getDeltaX
     * @return {Number} The delta in the X direction.
     */
    this.getDeltaX = function() { return dx; };
    /**
     * Get the line delta in the Y direction.
     * @method getDeltaX
     * @return {Number} The delta in the Y direction.
     */
    this.getDeltaY = function() { return dy; };
    /**
     * Get the length of the line.
     * @method getLength
     * @return {Number} The length of the line.
     */
    this.getLength = function() { return length; };
    /**
     * Get the length of the line with spacing.
     * @method getWorldLength
     * @param {Number} spacingX The X spacing.
     * @param {Number} spacingY The Y spacing.
     * @return {Number} The length of the line with spacing.
     */
    this.getWorldLength = function(spacingX, spacingY)
    {
        var dxs = dx * spacingX;
        var dys = dy * spacingY;
        return Math.sqrt( dxs * dxs + dys * dys );
    };
    /**
     * Get the mid point of the line.
     * @method getMidpoint
     * @return {Object} The mid point of the line.
     */
    this.getMidpoint = function()
    {
        return new dwv.math.Point2D( 
            parseInt( (begin.getX()+end.getX()) / 2, 10 ), 
            parseInt( (begin.getY()+end.getY()) / 2, 10 ) );
    };
    /**
     * Get the slope of the line.
     * @method getSlope
     * @return {Number} The slope of the line.
     */
    this.getSlope = function()
    { 
        return dy / dx;
    };
    /**
     * Get the inclination of the line.
     * @method getInclination
     * @return {Number} The inclination of the line.
     */
    this.getInclination = function()
    { 
        // tan(theta) = slope
        var angle = Math.atan2( dy, dx ) * 180 / Math.PI;
        // shift?
        return 180 - angle;
    };
}; // Line class

/**
 * Get the angle between two lines.
 * @param line0 The first line.
 * @param line1 The second line.
 */
dwv.math.getAngle = function (line0, line1)
{
    var dx0 = line0.getDeltaX();
    var dy0 = line0.getDeltaY();
    var dx1 = line1.getDeltaX();
    var dy1 = line1.getDeltaY();
    // dot = ||a||*||b||*cos(theta)
    var dot = dx0 * dx1 + dy0 * dy1;
    // cross = ||a||*||b||*sin(theta)
    var det = dx0 * dy1 - dy0 * dx1;
    // tan = sin / cos
    var angle = Math.atan2( det, dot ) * 180 / Math.PI;
    // complementary angle
    // shift?
    return 360 - (180 - angle);
};

/**
 * Rectangle shape.
 * @class Rectangle
 * @namespace dwv.math
 * @constructor
 * @param {Object} begin A Point2D representing the beginning of the rectangle.
 * @param {Object} end A Point2D representing the end of the rectangle.
 */
dwv.math.Rectangle = function(begin, end)
{
    if ( end.getX() < begin.getX() ) {
        var tmpX = begin.getX();
        begin = new dwv.math.Point2D( end.getX(), begin.getY() );
        end = new dwv.math.Point2D( tmpX, end.getY() );
    }
    if ( end.getY() < begin.getY() ) {
        var tmpY = begin.getY();
        begin = new dwv.math.Point2D( begin.getX(), end.getY() );
        end = new dwv.math.Point2D( end.getX(), tmpY );
    }
    
    /**
     * Rectangle surface.
     * @property surface
     * @private
     * @type Number
     */
    var surface = Math.abs(end.getX() - begin.getX()) * Math.abs(end.getY() - begin.getY() );

    /**
     * Get the begin point of the rectangle.
     * @method getBegin
     * @return {Object} The begin point of the rectangle
     */
    this.getBegin = function() { return begin; };
    /**
     * Get the end point of the rectangle.
     * @method getEnd
     * @return {Object} The end point of the rectangle
     */
    this.getEnd = function() { return end; };
    /**
     * Get the real width of the rectangle.
     * @method getRealWidth
     * @return {Number} The real width of the rectangle.
     */
    this.getRealWidth = function() { return end.getX() - begin.getX(); };
    /**
     * Get the real height of the rectangle.
     * @method getRealHeight
     * @return {Number} The real height of the rectangle.
     */
    this.getRealHeight = function() { return end.getY() - begin.getY(); };
    /**
     * Get the width of the rectangle.
     * @method getWidth
     * @return {Number} The width of the rectangle.
     */
    this.getWidth = function() { return Math.abs(this.getRealWidth()); };
    /**
     * Get the height of the rectangle.
     * @method getHeight
     * @return {Number} The height of the rectangle.
     */
    this.getHeight = function() { return Math.abs(this.getRealHeight()); };
    /**
     * Get the surface of the rectangle.
     * @method getSurface
     * @return {Number} The surface of the rectangle.
     */
    this.getSurface = function() { return surface; };
    /**
     * Get the surface of the rectangle with a spacing.
     * @method getWorldSurface
     * @return {Number} The surface of the rectangle with a spacing.
     */
    this.getWorldSurface = function(spacingX, spacingY)
    {
        return surface * spacingX * spacingY;
    };
}; // Rectangle class

/**
 * Region Of Interest shape.
 * @class ROI
 * @namespace dwv.math
 * @constructor
 * Note: should be a closed path.
 */
dwv.math.ROI = function()
{
    /**
     * List of points.
     * @property points
     * @private
     * @type Array
     */
    var points = [];
    
    /**
     * Get a point of the list at a given index.
     * @method getPoint
     * @param {Number} index The index of the point to get (beware, no size check).
     * @return {Object} The Point2D at the given index.
     */ 
    this.getPoint = function(index) { return points[index]; };
    /**
     * Get the length of the point list.
     * @method getLength
     * @return {Number} The length of the point list.
     */ 
    this.getLength = function() { return points.length; };
    /**
     * Add a point to the ROI.
     * @method addPoint
     * @param {Object} point The Point2D to add.
     */
    this.addPoint = function(point) { points.push(point); };
    /**
     * Add points to the ROI.
     * @method addPoints
     * @param {Array} rhs The array of POints2D to add.
     */
    this.addPoints = function(rhs) { points=points.concat(rhs);};
}; // ROI class

/**
 * Path shape.
 * @class Path
 * @namespace dwv.math
 * @constructor
 * @param {Array} inputPointArray The list of Point2D that make the path (optional).
 * @param {Array} inputControlPointIndexArray The list of control point of path, 
 *  as indexes (optional).
 * Note: first and last point do not need to be equal.
 */
dwv.math.Path = function(inputPointArray, inputControlPointIndexArray)
{
    /**
     * List of points.
     * @property pointArray
     * @type Array
     */
    this.pointArray = inputPointArray ? inputPointArray.slice() : [];
    /**
     * List of control points.
     * @property controlPointIndexArray
     * @type Array
     */
    this.controlPointIndexArray = inputControlPointIndexArray ?
        inputControlPointIndexArray.slice() : [];
}; // Path class

/**
 * Get a point of the list.
 * @method getPoint
 * @param {Number} index The index of the point to get (beware, no size check).
 * @return {Object} The Point2D at the given index.
 */ 
dwv.math.Path.prototype.getPoint = function(index) {
    return this.pointArray[index];
};

/**
 * Is the given point a control point.
 * @method isControlPoint
 * @param {Object} point The Point2D to check.
 * @return {Boolean} True if a control point.
 */ 
dwv.math.Path.prototype.isControlPoint = function(point) {
    var index = this.pointArray.indexOf(point);
    if( index !== -1 ) {
        return this.controlPointIndexArray.indexOf(index) !== -1;
    }
    else {
        throw new Error("Error: isControlPoint called with not in list point.");
    }
};

/**
 * Get the length of the path.
 * @method getLength
 * @return {Number} The length of the path.
 */ 
dwv.math.Path.prototype.getLength = function() { 
    return this.pointArray.length;
};

/**
 * Add a point to the path.
 * @method addPoint
 * @param {Object} point The Point2D to add.
 */
dwv.math.Path.prototype.addPoint = function(point) {
    this.pointArray.push(point);
};

/**
 * Add a control point to the path.
 * @method addControlPoint
 * @param {Object} point The Point2D to make a control point.
 */
dwv.math.Path.prototype.addControlPoint = function(point) {
    var index = this.pointArray.indexOf(point);
    if( index !== -1 ) {
        this.controlPointIndexArray.push(index);
    }
    else {
        throw new Error("Error: addControlPoint called with no point in list point.");
    }
};

/**
 * Add points to the path.
 * @method addPoints
 * @param {Array} points The list of Point2D to add.
 */
dwv.math.Path.prototype.addPoints = function(newPointArray) { 
    this.pointArray = this.pointArray.concat(newPointArray);
};

/**
 * Append a Path to this one.
 * @method appenPath
 * @param {Path} other The Path to append.
 */
dwv.math.Path.prototype.appenPath = function(other) {
    var oldSize = this.pointArray.length;
    this.pointArray = this.pointArray.concat(other.pointArray);
    var indexArray = [];
    for( var i=0; i < other.controlPointIndexArray.length; ++i ) {
        indexArray[i] = other.controlPointIndexArray[i] + oldSize;
    }
    this.controlPointIndexArray = this.controlPointIndexArray.concat(indexArray);
};
;/** 
 * Math module.
 * @module math
 */
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Get the minimum, maximum, mean and standard deviation
 * of an array of values.
 * Note: could use https://github.com/tmcw/simple-statistics
 * @method getStats
 * @static
 */
dwv.math.getStats = function (array)
{
    var min = array[0];
    var max = min;
    var mean = 0;
    var sum = 0;
    var sumSqr = 0;
    var stdDev = 0;
    var variance = 0;
    
    var val = 0;
    for ( var i = 0; i < array.length; ++i ) {
        val = array[i];
        if ( val < min ) {
            min = val;
        }
        else if ( val > max ) {
            max = val;
        }
        sum += val;
        sumSqr += val * val;
    }
    
    mean = sum / array.length;
    // see http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
    variance = sumSqr / array.length - mean * mean;
    stdDev = Math.sqrt(variance);
    
    return { 'min': min, 'max': max, 'mean': mean, 'stdDev': stdDev };
};

/** 
 * Unique ID generator.
 * @class IdGenerator
 * @namespace dwv.math
 * @constructor
 */
dwv.math.IdGenerator = function ()
{
    /**
     * Root for IDs.
     * @property root
     * @private
     * @type Number
     */
    var root = Math.floor( Math.random() * 26 ) + Date.now();
    /**
     * Get a unique id.
     * @method get
     * @return {Number} The unique Id.
     */
    this.get = function () {
        return root++;
    };
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};

/**
 * State class.
 * Saves: data url/path, display info, undo stack.
 * @class State
 * @namespace dwv
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.State = function (/*app*/)
{
    var _urls = [];
    
    this.setUrls = function (urls) {
        _urls = urls;
    };
    
    /**
     * Save state.
     * @method save
     */
    this.toJSON = function () {
        return $.toJSON({
            'urls': _urls
        });
    };
    /**
     * Load state.
     * @method load
     */
    this.fromJSON = function (json) {
        console.log(json);
    };
}; // State class
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Draw group command.
 * @class DrawGroupCommand
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.DrawGroupCommand = function (group, name, layer)
{
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function () { return "Draw-"+name; };
    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function () {
        // add the group to the layer
        layer.add(group);
        // draw
        layer.draw();
    };
    /**
     * Undo the command.
     * @method undo
     */
    this.undo = function () {
        // remove the group from the parent layer
        group.remove();
        // draw
        layer.draw();
    };
}; // DrawGroupCommand class

/**
 * Move group command.
 * @class MoveGroupCommand
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.MoveGroupCommand = function (group, name, translation, layer)
{
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function () { return "Move-"+name; };

    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function () {
        // translate all children of group
        group.getChildren().each( function (shape) {
            shape.x( shape.x() + translation.x );
            shape.y( shape.y() + translation.y );
        });
        // draw
        layer.draw();
    };
    /**
     * Undo the command.
     * @method undo
     */
    this.undo = function () {
        // invert translate all children of group
        group.getChildren().each( function (shape) {
            shape.x( shape.x() - translation.x );
            shape.y( shape.y() - translation.y );
        });
        // draw
        layer.draw();
    };
}; // MoveShapeCommand class

/**
 * Change group command.
 * @class ChangeGroupCommand
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.ChangeGroupCommand = function (name, func, startAnchor, endAnchor, layer, image)
{
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function () { return "Change-"+name; };

    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function () {
        // change shape
        func( endAnchor, image );
        // draw
        layer.draw();
    };
    /**
     * Undo the command.
     * @method undo
     */
    this.undo = function () {
        // invert change shape
        func( startAnchor, image );
        // draw
        layer.draw();
    };
}; // ChangeShapeCommand class

/**
 * Delete group command.
 * @class DeleteGroupCommand
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.DeleteGroupCommand = function (group, name, layer)
{
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function () { return "Delete-"+name; };
    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function () {
        // remove the group from the parent layer
        group.remove();
        // draw
        layer.draw();
    };
    /**
     * Undo the command.
     * @method undo
     */
    this.undo = function () {
        // add the group to the layer
        layer.add(group);
        // draw
        layer.draw();
    };
}; // DeleteShapeCommand class

/**
 * Drawing tool.
 * @class Draw
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Draw = function (app, shapeFactoryList)
{
    /**
     * Closure to self: to be used by event handlers.
     * @property self
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Draw GUI.
     * @property gui
     * @type Object
     */
    var gui = null;
    /**
     * Interaction start flag.
     * @property started
     * @private
     * @type Boolean
     */
    var started = false;
    
    /**
     * Shape factory list
     * @property shapeFactoryList
     * @type Object
     */
    this.shapeFactoryList = shapeFactoryList;
    /**
     * Draw command.
     * @property command
     * @private
     * @type Object
     */
    var command = null;
    /**
     * List of created shapes.
     * @property createdShapes
     * @private
     * @type Array
     */
    var createdShapes = [];
    /**
     * Current shape group.
     * @property shapeGroup
     * @private
     * @type Object
     */
    var shapeGroup = null;

    /**
     * Drawing style.
     * @property style
     * @type Style
     */
    this.style = new dwv.html.Style();
    /**
     * Shape name.
     * @property shapeName
     * @type String
     */
    this.shapeName = 0;
    
    /**
     * List of points.
     * @property points
     * @private
     * @type Array
     */
    var points = [];
    
    /**
     * Last selected point.
     * @property lastPoint
     * @private
     * @type Object
     */
    var lastPoint = null;
    
    /**
     * Shape editor.
     * @property shapeEditor
     * @private
     * @type Object
     */
    var shapeEditor = new dwv.tool.ShapeEditor(app);

    /**
     * Trash draw: a cross.
     * @property trash
     * @private
     * @type Object
     */
    var trash = new Kinetic.Group();

    // first line of the cross
    var trashLine1 = new Kinetic.Line({
        points: [-10, -10, 10, 10 ],
        stroke: 'red',
    });
    // second line of the cross
    var trashLine2 = new Kinetic.Line({
        points: [10, -10, -10, 10 ],
        stroke: 'red'
    });
    trash.add(trashLine1);
    trash.add(trashLine2);

    /**
     * The associated draw layer.
     * @property drawLayer
     * @private
     * @type Object
     */
    var drawLayer = null;
    
    /**
     * The associated draw layer.
     * @property drawLayer
     * @private
     * @type Object
     */
    var idGenerator = new dwv.math.IdGenerator();

    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        // determine if the click happened in an existing shape
        var stage = app.getDrawStage();
        var kshape = stage.getIntersection({
            x: event._xs, 
            y: event._ys
        });
        
        if ( kshape ) {
            var group = kshape.getParent();
            var selectedShape = group.find(".shape")[0];
            // reset editor if click on other shape
            // (and avoid anchors mouse down)
            if ( selectedShape && selectedShape !== shapeEditor.getShape() ) { 
                shapeEditor.disable();
                shapeEditor.setShape(selectedShape);
                shapeEditor.setImage(app.getImage());
                shapeEditor.enable();
            }
        }
        else {
            // disable edition
            shapeEditor.disable();
            shapeEditor.setShape(null);
            shapeEditor.setImage(null);
            // start storing points
            started = true;
            // clear array
            points = [];
            // store point
            lastPoint = new dwv.math.Point2D(event._x, event._y);
            points.push(lastPoint);
        }
    };

    /**
     * Handle mouse move event.
     * @method mousemove
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        if (!started)
        {
            return;
        }
        if ( Math.abs( event._x - lastPoint.getX() ) > 0 ||
                Math.abs( event._y - lastPoint.getY() ) > 0 )
        {
            // current point
            lastPoint = new dwv.math.Point2D(event._x, event._y);
            // clear last added point from the list (but not the first one)
            if ( points.length != 1 ) {
                points.pop();
            }
            // add current one to the list
            points.push( lastPoint );
            // allow for anchor points
            var factory = new self.shapeFactoryList[self.shapeName]();
            if( points.length < factory.getNPoints() ) {
                clearTimeout(this.timer);
                this.timer = setTimeout( function () {
                    points.push( lastPoint );
                }, factory.getTimeout() );
            }
            // remove previous draw
            if ( shapeGroup ) {
                shapeGroup.destroy();
            }
            // create shape group
            shapeGroup = factory.create(points, self.style, app.getImage());
            // do not listen during creation
            var shape = shapeGroup.getChildren( function (node) {
                return node.name() === 'shape';
            })[0];
            shape.listening(false);
            drawLayer.hitGraphEnabled(false);
            // draw shape command
            command = new dwv.tool.DrawGroupCommand(shapeGroup, self.shapeName, drawLayer);
            // draw
            command.execute();
        }
    };

    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function (/*event*/){
        if (started && points.length > 1 )
        {
            // reset shape group
            if ( shapeGroup ) {
                shapeGroup.destroy();
            }
            // create final shape
            var factory = new self.shapeFactoryList[self.shapeName]();
            var group = factory.create(points, self.style, app.getImage());
            group.id( idGenerator.get() );
            // re-activate layer
            drawLayer.hitGraphEnabled(true);
            // draw shape command
            command = new dwv.tool.DrawGroupCommand(group, self.shapeName, drawLayer);
            // execute it
            command.execute();
            // save it in undo stack
            app.getUndoStack().add(command);
            
            // set shape on
            var shape = group.getChildren( function (node) {
                return node.name() === 'shape';
            })[0];
            self.setShapeOn( shape );
            createdShapes.push( shape );
        }
        // reset flag
        started = false;
    };
    
    /**
     * Handle mouse out event.
     * @method mouseout
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        self.mouseup(event);
    };

    /**
     * Handle touch start event.
     * @method touchstart
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        self.mousedown(event);
    };

    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        self.mousemove(event);
    };

    /**
     * Handle touch end event.
     * @method touchend
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        self.mouseup(event);
    };

    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.onKeydown(event);
    };

    /**
     * Setup the tool GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui = new dwv.gui.Draw(app);
        gui.setup(this.shapeFactoryList);
    };
    
    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} flag The flag to enable or not.
     */
    this.display = function ( flag ){
        if ( gui ) {
            gui.display( flag );
        }
        // reset shape display properties
        shapeEditor.disable();
        shapeEditor.setShape(null);
        shapeEditor.setImage(null);
        document.body.style.cursor = 'default';
        // make layer listen or not to events
        app.getDrawStage().listening( flag );
        drawLayer = app.getDrawLayer();
        drawLayer.listening( flag );
        drawLayer.hitGraphEnabled( flag );
        // set shape display properties
        if ( flag ) {
            app.addLayerListeners( app.getDrawStage().getContent() );
            createdShapes.forEach( function (shape){ self.setShapeOn( shape ); });
        }
        else {
            app.removeLayerListeners( app.getDrawStage().getContent() );
            createdShapes.forEach( function (shape){ setShapeOff( shape ); });
        }
        // draw
        drawLayer.draw();
    };
    
    /**
     * Set shape off properties.
     * @method setShapeOff
     * @param {Object} shape The shape to set off.
     */
    function setShapeOff( shape ) {
        // mouse styling
        shape.off('mouseover');
        shape.off('mouseout');
        // drag
        shape.draggable(false);
        shape.off('dragstart');
        shape.off('dragmove');
        shape.off('dragend');
    }

    /**
     * Get the real position from an event.
     */
    function getRealPosition( index ) {
        var stage = app.getDrawStage();
        return { 'x': stage.offset().x + index.x / stage.scale().x,
            'y': stage.offset().y + index.y / stage.scale().y };
    }
    
    /**
     * Set shape on properties.
     * @method setShapeOn
     * @param {Object} shape The shape to set on.
     */
    this.setShapeOn = function ( shape ) {
        // mouse over styling
        shape.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
        });
        // mouse out styling
        shape.on('mouseout', function () {
            document.body.style.cursor = 'default';
        });

        // make it draggable
        shape.draggable(true);
        var dragStartPos = null;
        var dragLastPos = null;
        
        // command name based on shape type
        var cmdName = "shape";
        if ( shape instanceof Kinetic.Line ) {
            if ( shape.points().length == 4 ) {
                cmdName = "line";
            }
            else if ( shape.points().length == 6 ) {
                cmdName = "protractor";
            }
            else {
                cmdName = "roi";
            }
        }
        else if ( shape instanceof Kinetic.Rect ) {
            cmdName = "rectangle";
        }
        else if ( shape instanceof Kinetic.Ellipse ) {
            cmdName = "ellipse";
        }
        
        // shape color
        var color = shape.stroke();
        
        // drag start event handling
        shape.on('dragstart', function (event) {
            // save start position
            var offset = dwv.html.getEventOffset( event.evt )[0];
            dragStartPos = getRealPosition( offset );
            // display trash
            var stage = app.getDrawStage();
            var scale = stage.scale();
            var invscale = {'x': 1/scale.x, 'y': 1/scale.y};
            trash.x( stage.offset().x + ( 256 / scale.x ) );
            trash.y( stage.offset().y + ( 20 / scale.y ) );
            trash.scale( invscale );
            drawLayer.add( trash );
            // deactivate anchors to avoid events on null shape
            shapeEditor.setAnchorsActive(false);
            // draw
            drawLayer.draw();
        });
        // drag move event handling
        shape.on('dragmove', function (event) {
            var offset = dwv.html.getEventOffset( event.evt )[0];
            var pos = getRealPosition( offset );
            var translation;
            if ( dragLastPos ) {
                translation = {'x': pos.x - dragLastPos.x, 
                    'y': pos.y - dragLastPos.y};
            }
            else {
                translation = {'x': pos.x - dragStartPos.x, 
                        'y': pos.y - dragStartPos.y};
            }
            dragLastPos = pos;
            // highlight trash when on it
            if ( Math.abs( pos.x - trash.x() ) < 10 &&
                    Math.abs( pos.y - trash.y() ) < 10   ) {
                trash.getChildren().each( function (tshape){ tshape.stroke('orange'); });
                shape.stroke('red');
            }
            else {
                trash.getChildren().each( function (tshape){ tshape.stroke('red'); });
                shape.stroke(color);
            }
            // update group but not 'this' shape
            var group = this.getParent();
            group.getChildren().each( function (shape) {
                if ( shape === this ) {
                    return;
                }
                shape.x( shape.x() + translation.x );
                shape.y( shape.y() + translation.y );
            });
            // reset anchors
            shapeEditor.resetAnchors();
            // draw
            drawLayer.draw();
        });
        // drag end event handling
        shape.on('dragend', function (/*event*/) {
            var pos = dragLastPos;
            dragLastPos = null;
            // delete case
            if ( Math.abs( pos.x - trash.x() ) < 10 &&
                    Math.abs( pos.y - trash.y() ) < 10   ) {
                // compensate for the drag translation
                var delTranslation = {'x': pos.x - dragStartPos.x, 
                        'y': pos.y - dragStartPos.y};
                var group = this.getParent();
                group.getChildren().each( function (shape) {
                    shape.x( shape.x() - delTranslation.x );
                    shape.y( shape.y() - delTranslation.y );
                });
                // restore color
                shape.stroke(color);
                // disable editor
                shapeEditor.disable();
                shapeEditor.setShape(null);
                shapeEditor.setImage(null);
                document.body.style.cursor = 'default';
                // delete command
                var delcmd = new dwv.tool.DeleteGroupCommand(this.getParent(), cmdName, drawLayer);
                delcmd.execute();
                app.getUndoStack().add(delcmd);
            }
            else {
                // save drag move
                var translation = {'x': pos.x - dragStartPos.x, 
                        'y': pos.y - dragStartPos.y};
                if ( translation.x !== 0 || translation.y !== 0 ) {
                    var mvcmd = new dwv.tool.MoveGroupCommand(this.getParent(), cmdName, translation, drawLayer);
                    app.getUndoStack().add(mvcmd);
                }
                // reset anchors
                shapeEditor.setAnchorsActive(true);
                shapeEditor.resetAnchors();
            }
            // remove trash
            trash.remove();
            // draw
            drawLayer.draw();
        });
    };

    /**
     * Initialise the tool.
     * @method init
     */
    this.init = function() {
        // set the default to the first in the list
        var shapeName = 0;
        for( var key in this.shapeFactoryList ){
            shapeName = key;
            break;
        }
        this.setShapeName(shapeName);
        // init gui
        if ( gui ) {
            // same for color
            this.setLineColour(gui.getColours()[0]);
            // init html
            gui.initialise();
        }
        return true;
    };

}; // Draw class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Draw.prototype.getHelp = function()
{
    return {
        'title': "Draw",
        'brief': "Allows to draw shapes on the image. " +
            "Choose the shape and its color from the drop down menus. Once created, shapes " +
            "can be edited by selecting them. Anchors will appear and allow specific shape edition. " +
            "Drag the shape on the top red cross to delete it. All actions are undoable. ",
        'mouse': {
            'mouse_drag': "A single mouse drag draws the desired shape.",
        },
        'touch': {
            'touch_drag': "A single touch drag draws the desired shape.",
        }
    };
};

/**
 * Set the line color of the drawing.
 * @method setLineColour
 * @param {String} colour The colour to set.
 */
dwv.tool.Draw.prototype.setLineColour = function(colour)
{
    // set style var
    this.style.setLineColor(colour);
};

/**
 * Set the shape name of the drawing.
 * @method setShapeName
 * @param {String} name The name of the shape.
 */
dwv.tool.Draw.prototype.setShapeName = function(name)
{
    // check if we have it
    if( !this.hasShape(name) )
    {
        throw new Error("Unknown shape: '" + name + "'");
    }
    this.shapeName = name;
};

/**
 * Check if the shape is in the shape list.
 * @method hasShape
 * @param {String} name The name of the shape.
 */
dwv.tool.Draw.prototype.hasShape = function(name) {
    return this.shapeFactoryList[name];
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Shape editor.
 * @class ShapeEditor
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.ShapeEditor = function (app)
{
    /**
     * Edited shape.
     * @property shape
     * @private
     * @type Object
     */
    var shape = null;
    var image = null;
    /**
     * Active flag.
     * @property isActive
     * @private
     * @type Boolean
     */
    var isActive = false;
    /**
     * Update function used by anchors to update the shape.
     * @property updateFunction
     * @private
     * @type Object
     */
    var updateFunction = null;
    
    /**
     * Set the shape to edit.
     * @method setShape
     * @param {Object} inshape The shape to edit.
     */
    this.setShape = function ( inshape ) {
        shape = inshape;
        // reset anchors
        if ( shape ) {
            removeAnchors();
            addAnchors();
        }
    };
    
    this.setImage = function ( img ) {
        image = img;
    };
    /**
     * Get the edited shape.
     * @method getShape
     * @return {Object} The edited shape.
     */
    this.getShape = function () { 
        return shape;
    };
    
    /**
     * Get the active flag.
     * @method isActive
     * @return {Boolean} The active flag.
     */
    this.isActive = function () {
        return isActive;
    };

    /**
     * Enable the editor. Redraws the layer.
     * @method enable
     */
    this.enable = function () {
        isActive = true;
        if ( shape ) {
            setAnchorsVisible( true );
            if ( shape.getLayer() ) {
                shape.getLayer().draw();
            }
        }
    };
    
    /**
     * Disable the editor. Redraws the layer.
     * @method disable
     */
    this.disable = function () {
        isActive = false;
        if ( shape ) {
            setAnchorsVisible( false );
            if ( shape.getLayer() ) {
                shape.getLayer().draw();
            }
        }
    };
    
    /**
     * Reset the anchors.
     * @method resetAnchors
     */
    this.resetAnchors = function () {
        // remove previous controls
        removeAnchors();
        // add anchors
        addAnchors();
        // set them visible
        setAnchorsVisible( true );
    };
    
    /**
     * Apply a function on all anchors.
     * @param {Object} func A f(shape) function.
     */
    function applyFuncToAnchors( func ) {
        if ( shape && shape.getParent() ) {
            var anchors = shape.getParent().find('.anchor');
            anchors.each( func );
        }
    }
    
    /**
     * Set anchors visibility.
     * @method setAnchorsVisible
     * @param {Boolean} flag The visible flag.
     */
    function setAnchorsVisible( flag ) {
        applyFuncToAnchors( function (anchor) {
            anchor.visible( flag );
        });
    }

    /**
     * Set anchors active.
     * @method setAnchorsActive
     * @param {Boolean} flag The active (on/off) flag.
     */
    this.setAnchorsActive = function ( flag ) {
        var func = null;
        if ( flag ) { 
            func = function (anchor) {
                setAnchorOn( anchor );
            };
        }
        else {
            func = function (anchor) {
                setAnchorOff( anchor );
            };
        }
        applyFuncToAnchors( func );
    };

    /**
     * Remove anchors.
     * @method removeAnchors
     */
    function removeAnchors() {
        applyFuncToAnchors( function (anchor) {
            anchor.remove();
        });
    }
    
    /**
     * Add the shape anchors.
     * @method addAnchors
     */
    function addAnchors() {
        // exit if no shape or no layer
        if ( !shape || !shape.getLayer() ) {
            return;
        }
        // get shape group
        var group = shape.getParent();
        // add shape specific anchors to the shape group
        if ( shape instanceof Kinetic.Line ) {
            var points = shape.points();
            if ( points.length === 4 || points.length === 6) {
                // add shape offset
                var p0x = points[0] + shape.x();
                var p0y = points[1] + shape.y();
                var p1x = points[2] + shape.x();
                var p1y = points[3] + shape.y();
                addAnchor(group, p0x, p0y, 'begin');
                if ( points.length === 4 ) {
                    updateFunction = dwv.tool.UpdateLine;
                    addAnchor(group, p1x, p1y, 'end');
                }
                else {
                    updateFunction = dwv.tool.UpdateProtractor;
                    addAnchor(group, p1x, p1y, 'mid');
                    var p2x = points[4] + shape.x();
                    var p2y = points[5] + shape.y();
                    addAnchor(group, p2x, p2y, 'end');
                }
            }
            else {
                updateFunction = dwv.tool.UpdateRoi;
                var px = 0;
                var py = 0;
                for ( var i = 0; i < points.length; i=i+2 ) {
                    px = points[i] + shape.x();
                    py = points[i+1] + shape.y();
                    addAnchor(group, px, py, i);
                }
            }
        }
        else if ( shape instanceof Kinetic.Rect ) {
            updateFunction = dwv.tool.UpdateRect;
            var rectX = shape.x();
            var rectY = shape.y();
            var rectWidth = shape.width();
            var rectHeight = shape.height();
            addAnchor(group, rectX, rectY, 'topLeft');
            addAnchor(group, rectX+rectWidth, rectY, 'topRight');
            addAnchor(group, rectX+rectWidth, rectY+rectHeight, 'bottomRight');
            addAnchor(group, rectX, rectY+rectHeight, 'bottomLeft');
        }
        else if ( shape instanceof Kinetic.Ellipse ) {
            updateFunction = dwv.tool.UpdateEllipse;
            var ellipseX = shape.x();
            var ellipseY = shape.y();
            var radius = shape.radius();
            addAnchor(group, ellipseX-radius.x, ellipseY-radius.y, 'topLeft');
            addAnchor(group, ellipseX+radius.x, ellipseY-radius.y, 'topRight');
            addAnchor(group, ellipseX+radius.x, ellipseY+radius.y, 'bottomRight');
            addAnchor(group, ellipseX-radius.x, ellipseY+radius.y, 'bottomLeft');
        }
        // add group to layer
        shape.getLayer().add( group );
    }
    
    /**
     * Create shape editor controls, i.e. the anchors.
     * @method addAnchor
     * @param {Object} group The group associated with this anchor.
     * @param {Number} x The X position of the anchor.
     * @param {Number} y The Y position of the anchor.
     * @param {Number} id The id of the anchor.
     */
    function addAnchor(group, x, y, id) {
        // anchor shape
        var anchor = new Kinetic.Circle({
            x: x,
            y: y,
            stroke: '#999',
            fillRed: 100,
            fillBlue: 100,
            fillGreen: 100,
            fillAlpha: 0.7,
            strokeWidth: 2,
            radius: 6,
            name: 'anchor',
            id: id,
            dragOnTop: false,
            draggable: true,
            visible: false
        });
        // set anchor on
        setAnchorOn( anchor );
        // add the anchor to the group
        group.add(anchor);
    }
    
    /**
     * Get a simple clone of the input anchor.
     * @param {Object} anchor The anchor to clone.
     */
    function getClone( anchor ) {
        // create closure to properties
        var parent = anchor.getParent();
        var id = anchor.id();
        var x = anchor.x();
        var y = anchor.y();
        // create clone object
        var clone = {};
        clone.getParent = function () {
            return parent;
        };
        clone.id = function () {
            return id;
        };
        clone.x = function () {
            return x;
        };
        clone.y = function () {
            return y;
        };
        return clone;
    }
    
    /**
     * Set the anchor on listeners.
     * @param {Object} anchor The anchor to set on.
     */
    function setAnchorOn( anchor ) {
        var startAnchor = null;
        
        // command name based on shape type
        var cmdName = "shape";
        if ( shape instanceof Kinetic.Line ) {
            if ( shape.points().length == 4 ) {
                cmdName = "line";
            }
            else if ( shape.points().length == 6 ) {
                cmdName = "protractor";
            }
            else {
                cmdName = "roi";
            }
        }
        else if ( shape instanceof Kinetic.Rect ) {
            cmdName = "rectangle";
        }
        else if ( shape instanceof Kinetic.Ellipse ) {
            cmdName = "ellipse";
        }

        // drag start listener
        anchor.on('dragstart', function () {
            startAnchor = getClone(this);
        });
        // drag move listener
        anchor.on('dragmove', function () {
            if ( updateFunction ) {
                updateFunction(this, image);
            }
            if ( this.getLayer() ) {
                this.getLayer().draw();
            }
            else {
                console.warn("No layer to draw the anchor!");
            }
        });
        // drag end listener
        anchor.on('dragend', function () {
            var endAnchor = getClone(this);
            // store the change command
            var chgcmd = new dwv.tool.ChangeGroupCommand(
                    cmdName, updateFunction, startAnchor, endAnchor, this.getLayer(), image);
            chgcmd.execute();
            app.getUndoStack().add(chgcmd);
            // reset start anchor
            startAnchor = endAnchor;
        });
        // mouse down listener
        anchor.on('mousedown touchstart', function () {
            this.moveToTop();
        });
        // mouse over styling
        anchor.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
            this.stroke('#ddd');
            if ( this.getLayer() ) {
                this.getLayer().draw();
            }
            else {
                console.warn("No layer to draw the anchor!");
            }
        });
        // mouse out styling
        anchor.on('mouseout', function () {
            document.body.style.cursor = 'default';
            this.stroke('#999');
            if ( this.getLayer() ) {
                this.getLayer().draw();
            }
            else {
                console.warn("No layer to draw the anchor!");
            }
        });
    }
    
    /**
     * Set the anchor off listeners.
     * @param {Object} anchor The anchor to set off.
     */
    function setAnchorOff( anchor ) {
        anchor.off('dragstart');
        anchor.off('dragmove');
        anchor.off('dragend');
        anchor.off('mousedown touchstart');
        anchor.off('mouseover');
        anchor.off('mouseout');
    }
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/** 
 * Ellipse factory.
 * @class EllipseFactory
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.EllipseFactory = function ()
{
    /** 
     * Get the number of points needed to build the shape.
     * @method getNPoints
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 2; };
    /** 
     * Get the timeout between point storage.
     * @method getTimeout
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 0; };
};  

/**
 * Create an ellipse shape to be displayed.
 * @method create
 * @param {Array} points The points from which to extract the ellipse.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */ 
dwv.tool.EllipseFactory.prototype.create = function (points, style, image)
{
    // calculate radius
    var a = Math.abs(points[0].getX() - points[1].getX());
    var b = Math.abs(points[0].getY() - points[1].getY());
    // physical shape
    var ellipse = new dwv.math.Ellipse(points[0], a, b);
    // draw shape
    var kshape = new Kinetic.Ellipse({
        x: ellipse.getCenter().getX(),
        y: ellipse.getCenter().getY(),
        radius: { x: ellipse.getA(), y: ellipse.getB() },
        stroke: style.getLineColor(),
        strokeWidth: 2,
        name: "shape"
    });
    // quantification
    var quant = image.quantifyEllipse( ellipse );
    var cm2 = quant.surface / 100;
    var str = cm2.toPrecision(4) + " cm2";
    // quantification text
    var ktext = new Kinetic.Text({
        x: ellipse.getCenter().getX(),
        y: ellipse.getCenter().getY(),
        text: str,
        fontSize: style.getFontSize(),
        fontFamily: "Verdana",
        fill: style.getLineColor(),
        name: "text"
    });
    // return group
    var group = new Kinetic.Group();
    group.name("ellipse-group");
    group.add(kshape);
    group.add(ktext);
    return group;
};

/**
 * Update an ellipse shape.
 * @method UpdateEllipse
 * @static
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */ 
dwv.tool.UpdateEllipse = function (anchor, image)
{
    // parent group
    var group = anchor.getParent();
    // associated shape
    var kellipse = group.getChildren( function (node) {
        return node.name() === 'shape';
    })[0];
    // associated text
    var ktext = group.getChildren(function(node){
        return node.name() === 'text';
    })[0];
    // find special points
    var topLeft = group.getChildren( function (node) {
        return node.id() === 'topLeft';
    })[0];
    var topRight = group.getChildren( function (node) {
        return node.id() === 'topRight';
    })[0];
    var bottomRight = group.getChildren( function (node) {
        return node.id() === 'bottomRight';
    })[0];
    var bottomLeft = group.getChildren( function (node) {
        return node.id() === 'bottomLeft';
    })[0];
    // update 'self' (undo case) and special points
    switch ( anchor.id() ) {
    case 'topLeft':
        topLeft.x( anchor.x() );
        topLeft.y( anchor.y() );
        topRight.y( anchor.y() );
        bottomLeft.x( anchor.x() );
        break;
    case 'topRight':
        topRight.x( anchor.x() );
        topRight.y( anchor.y() );
        topLeft.y( anchor.y() );
        bottomRight.x( anchor.x() );
        break;
    case 'bottomRight':
        bottomRight.x( anchor.x() );
        bottomRight.y( anchor.y() );
        bottomLeft.y( anchor.y() );
        topRight.x( anchor.x() ); 
        break;
    case 'bottomLeft':
        bottomLeft.x( anchor.x() );
        bottomLeft.y( anchor.y() );
        bottomRight.y( anchor.y() );
        topLeft.x( anchor.x() ); 
        break;
    default :
        console.error('Unhandled anchor id: '+anchor.id());
        break;
    }
    // update shape
    var radiusX = ( topRight.x() - topLeft.x() ) / 2;
    var radiusY = ( bottomRight.y() - topRight.y() ) / 2;
    var center = { 'x': topLeft.x() + radiusX, 'y': topRight.y() + radiusY };
    kellipse.position( center );
    var radiusAbs = { 'x': Math.abs(radiusX), 'y': Math.abs(radiusY) };
    if ( radiusAbs ) {
        kellipse.radius( radiusAbs );
    }
    // update text
    var ellipse = new dwv.math.Ellipse(center, radiusX, radiusY);
    var quant = image.quantifyEllipse( ellipse );
    var cm2 = quant.surface / 100;
    var str = cm2.toPrecision(4) + " cm2";
    var textPos = { 'x': center.x, 'y': center.y };
    ktext.position(textPos);
    ktext.text(str);
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * Filter tool.
 * @class Filter
 * @namespace dwv.tool
 * @constructor
 * @param {Array} filterList The list of filter objects.
 * @param {Object} gui The associated gui.
 */
dwv.tool.Filter = function ( filterList, app )
{
    /**
     * Filter GUI.
     * @property gui
     * @type Object
     */
    var gui = null;
    /**
     * Filter list
     * @property filterList
     * @type Object
     */
    this.filterList = filterList;
    /**
     * Selected filter.
     * @property selectedFilter
     * @type Object
     */
    this.selectedFilter = 0;
    /**
     * Default filter name.
     * @property defaultFilterName
     * @type String
     */
    this.defaultFilterName = 0;
    /**
     * Display Flag.
     * @property displayed
     * @type Boolean
     */
    this.displayed = false;
    
    /**
     * Setup the filter GUI.
     * @method setup
     */
    this.setup = function ()
    {
        if ( Object.keys(this.filterList).length !== 0 ) {
            gui = new dwv.gui.Filter(app);
            gui.setup(this.filterList);
            for( var key in this.filterList ){
                this.filterList[key].setup();
            }
        }
    };

    /**
     * Enable the filter.
     * @method enable
     * @param {Boolean} bool Flag to enable or not.
     */
    this.display = function (bool)
    {
        if ( gui ) {
            gui.display(bool);
        }
        this.displayed = bool;
        // display the selected filter
        this.selectedFilter.display(bool);
    };

    /**
     * Initialise the filter.
     * @method init
     */
    this.init = function ()
    {
        // set the default to the first in the list
        for( var key in this.filterList ){
            this.defaultFilterName = key;
            break;
        }
        this.setSelectedFilter(this.defaultFilterName);
        // init all filters
        for( key in this.filterList ) {
            this.filterList[key].init();
        }    
        // init html
        if ( gui ) {
            gui.initialise();
        }
        return true;
    };

    /**
     * Handle keydown event.
     * @method keydown
     * @param {Object} event The keydown event.
     */
    this.keydown = function (event)
    {
        app.onKeydown(event);
    };

}; // class dwv.tool.Filter

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Filter.prototype.getHelp = function ()
{
    return {
        'title': "Filter",
        'brief': "A few simple image filters are available: a Threshold filter to " +
            "limit the image intensities between a chosen minimum and maximum, " +
            "a Sharpen filter to convolute the image with a sharpen matrix, " +
            "a Sobel filter to get the gradient of the image in both directions."
    };
};

/**
 * Get the selected filter.
 * @method getSelectedFilter
 * @return {Object} The selected filter.
 */
dwv.tool.Filter.prototype.getSelectedFilter = function ()
{
    return this.selectedFilter;
};

/**
 * Set the selected filter.
 * @method setSelectedFilter
 * @return {String} The name of the filter to select.
 */
dwv.tool.Filter.prototype.setSelectedFilter = function (name)
{
    // check if we have it
    if( !this.hasFilter(name) )
    {
        throw new Error("Unknown filter: '" + name + "'");
    }
    // hide last selected
    if( this.displayed )
    {
        this.selectedFilter.display(false);
    }
    // enable new one
    this.selectedFilter = this.filterList[name];
    // display the selected filter
    if( this.displayed )
    {
        this.selectedFilter.display(true);
    }
};

/**
 * Get the list of filters.
 * @method getFilterList
 * @return {Array} The list of filter objects.
 */
dwv.tool.Filter.prototype.getFilterList = function ()
{
    return this.filterList;
};

/**
 * Check if a filter is in the filter list.
 * @method hasFilter
 * @param {String} name The name to check.
 * @return {String} The filter list element for the given name.
 */
dwv.tool.Filter.prototype.hasFilter = function (name)
{
    return this.filterList[name];
};

// Filter namespace
dwv.tool.filter = dwv.tool.filter || {};

/**
 * Threshold filter tool.
 * @class Threshold
 * @namespace dwv.tool.filter
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Threshold = function ( app )
{
    /**
     * Filter GUI.
     * @property gui
     * @type Object
     */
    var gui = new dwv.gui.Threshold(app);
    
    /**
     * Setup the filter GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Display the filter.
     * @method display
     * @param {Boolean} bool Flag to display or not.
     */
    this.display = function (bool)
    {
        gui.display(bool);
    };
    
    /**
     * Initialise the filter.
     * @method init
     */
    this.init = function ()
    {
        gui.initialise();
    };
    
    /**
     * Run the filter.
     * @method run
     * @param {Mixed} args The filter arguments.
     */
    this.run = function (args)
    {
        var filter = new dwv.image.filter.Threshold();
        filter.setMin(args.min);
        filter.setMax(args.max);
        var command = new dwv.tool.RunFilterCommand(filter, app);
        command.execute();
        // save command in undo stack
        app.getUndoStack().add(command);
    };
    
}; // class dwv.tool.filter.Threshold


/**
 * Sharpen filter tool.
 * @class Sharpen
 * @namespace dwv.tool.filter
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Sharpen = function ( app )
{
    /**
     * Filter GUI.
     * @property gui
     * @type Object
     */
    var gui = new dwv.gui.Sharpen(app);
    
    /**
     * Setup the filter GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Display the filter.
     * @method display
     * @param {Boolean} bool Flag to enable or not.
     */
    this.display = function (bool)
    {
        gui.display(bool);
    };
    
    /**
     * Initialise the filter.
     * @method init
     */
    this.init = function()
    {
        // nothing to do...
    };
    
    /**
     * Run the filter.
     * @method run
     * @param {Mixed} args The filter arguments.
     */
    this.run = function(/*args*/)
    {
        var filter = new dwv.image.filter.Sharpen();
        var command = new dwv.tool.RunFilterCommand(filter, app);
        command.execute();
        // save command in undo stack
        app.getUndoStack().add(command);
    };

}; // dwv.tool.filter.Sharpen

/**
 * Sobel filter tool.
 * @class Sobel
 * @namespace dwv.tool.filter
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Sobel = function ( app )
{
    /**
     * Filter GUI.
     * @property gui
     * @type Object
     */
    var gui = new dwv.gui.Sobel(app);
    
    /**
     * Setup the filter GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Enable the filter.
     * @method enable
     * @param {Boolean} bool Flag to enable or not.
     */
    this.display = function(bool)
    {
        gui.display(bool);
    };
    
    /**
     * Initialise the filter.
     * @method init
     */
    this.init = function()
    {
        // nothing to do...
    };
    
    /**
     * Run the filter.
     * @method run
     * @param {Mixed} args The filter arguments.
     */
    dwv.tool.filter.Sobel.prototype.run = function(/*args*/)
    {
        var filter = new dwv.image.filter.Sobel();
        var command = new dwv.tool.RunFilterCommand(filter, app);
        command.execute();
        // save command in undo stack
        app.getUndoStack().add(command);
    };

}; // class dwv.tool.filter.Sobel

/**
 * Run filter command.
 * @class RunFilterCommand
 * @namespace dwv.tool
 * @constructor
 * @param {Object} filter The filter to run.
 * @param {Object} app The associated application.
 */
dwv.tool.RunFilterCommand = function (filter, app) {
    
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function () { return "Filter-" + filter.getName(); };

    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function ()
    {
        filter.setOriginalImage(app.getImage());
        app.setImage(filter.update());
        app.render();
    }; 
    /**
     * Undo the command.
     * @method undo
     */
    this.undo = function () {
        app.setImage(filter.getOriginalImage());
        app.render();
    };
    
}; // RunFilterCommand class
;/** 
 * Info module.
 * @module info
 */
var dwv = dwv || {};
/**
 * Namespace for info functions.
 * @class info
 * @namespace dwv
 * @static
 */
dwv.info = dwv.info || {};

/**
 * WindowLevel info layer.
 * @class WindowLevel
 * @namespace dwv.info
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.info.Windowing = function ( app )
{
    /**
     * Create the windowing info div.
     * @method createWindowingDiv
     * @param {String} rootId The div root ID.
     */
    this.create = function ()
    {
        var rootId = app.getContainerDivId();
        var div = document.getElementById(rootId+"-infotr");
        dwv.html.removeNode(rootId+"-ulinfotr");
        // windowing list
        var ul = document.createElement("ul");
        ul.id = rootId+"-ulinfotr";
        // window center list item
        var liwc = document.createElement("li");
        liwc.id = rootId+"-liwcinfotr";
        ul.appendChild(liwc);
        // window width list item
        var liww = document.createElement("li");
        liww.id = rootId+"-liwwinfotr";
        ul.appendChild(liww);
        // add list to div
        div.appendChild(ul);
    };
    
    /**
     * Update the Top Right info div.
     * @method updateWindowingDiv
     * @param {Object} event The windowing change event containing the new values.
     * Warning: expects the windowing info div to exist (use after createWindowingDiv).
     */
    this.update = function (event)
    {
        var rootId = app.getContainerDivId();
        // window center list item
        var liwc = document.getElementById(rootId+"-liwcinfotr");
        dwv.html.cleanNode(liwc);
        liwc.appendChild(document.createTextNode("WindowCenter = "+event.wc));
        // window width list item
        var liww = document.getElementById(rootId+"-liwwinfotr");
        dwv.html.cleanNode(liww);
        liww.appendChild(document.createTextNode("WindowWidth = "+event.ww));
    };
    
}; // class dwv.info.Windowing

/**
 * Position info layer.
 * @class Position
 * @namespace dwv.info
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.info.Position = function ( app )
{
    /**
     * Create the position info div.
     * @method createPositionDiv
     * @param {String} rootId The div root ID.
     */
    this.create = function ()
    {
        var rootId = app.getContainerDivId();
        
        var div = document.getElementById(rootId+"-infotl");
        dwv.html.removeNode(rootId+"-ulinfotl");
        // position list
        var ul = document.createElement("ul");
        ul.id = rootId+"-ulinfotl";
        // position
        var lipos = document.createElement("li");
        lipos.id = rootId+"-liposinfotl";
        ul.appendChild(lipos);
        // value
        var livalue = document.createElement("li");
        livalue.id = rootId+"-livalueinfotl";
        ul.appendChild(livalue);
        // add list to div
        div.appendChild(ul);
    };
    
    /**
     * Update the position info div.
     * @method updatePositionDiv
     * @param {Object} event The position change event containing the new values.
     * Warning: expects the position info div to exist (use after createPositionDiv).
     */
    this.update = function (event)
    {
        var rootId = app.getContainerDivId();
        
        // position list item
        var lipos = document.getElementById(rootId+"-liposinfotl");
        dwv.html.cleanNode(lipos);
        lipos.appendChild(document.createTextNode("Pos = "+event.i+", "+event.j+", "+event.k));
        // value list item
        if( typeof(event.value) != "undefined" )
        {
            var livalue = document.getElementById(rootId+"-livalueinfotl");
            dwv.html.cleanNode(livalue);
            livalue.appendChild(document.createTextNode("Value = "+event.value));
        }
    };
}; // class dwv.info.Position

/**
 * MiniColorMap info layer.
 * @class MiniColorMap
 * @namespace dwv.info
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.info.MiniColorMap = function ( app )
{
    /**
     * Create the mini color map info div.
     * @method createMiniColorMap
     */
    this.create = function ()
    {    
        var rootId = app.getContainerDivId();
        
        // color map
        var div = document.getElementById(rootId+"-infobr");
        dwv.html.removeNode(rootId+"-canvasinfobr");
        var canvas = document.createElement("canvas");
        canvas.id = rootId+"-canvasinfobr";
        canvas.width = 98;
        canvas.height = 10;
        // add canvas to div
        div.appendChild(canvas);
    };
    
    /**
     * Update the mini color map info div.
     * @method updateMiniColorMap
     * @param {Object} event The windowing change event containing the new values.
     * Warning: expects the mini color map div to exist (use after createMiniColorMap).
     */
    this.update = function (event)
    {    
        var rootId = app.getContainerDivId();
        
        var windowCenter = event.wc;
        var windowWidth = event.ww;
        
        var canvas = document.getElementById(rootId+"-canvasinfobr");
        var context = canvas.getContext('2d');
        
        // fill in the image data
        var colourMap = app.getView().getColorMap();
        var imageData = context.getImageData(0,0,canvas.width, canvas.height);
        
        var c = 0;
        var minInt = app.getImage().getRescaledDataRange().min;
        var range = app.getImage().getRescaledDataRange().max - minInt;
        var incrC = range / canvas.width;
        var y = 0;
        
        var yMax = 255;
        var yMin = 0;
        var xMin = windowCenter - 0.5 - (windowWidth-1) / 2;
        var xMax = windowCenter - 0.5 + (windowWidth-1) / 2;    
        
        var index;
        for( var j=0; j<canvas.height; ++j ) {
            c = minInt;
            for( var i=0; i<canvas.width; ++i ) {
                if( c <= xMin ) {
                    y = yMin;
                }
                else if( c > xMax ) {
                    y = yMax;
                }
                else {
                    y = ( (c - (windowCenter-0.5) ) / (windowWidth-1) + 0.5 ) *
                        (yMax-yMin) + yMin;
                    y = parseInt(y,10);
                }
                index = (i + j * canvas.width) * 4;
                imageData.data[index] = colourMap.red[y];
                imageData.data[index+1] = colourMap.green[y];
                imageData.data[index+2] = colourMap.blue[y];
                imageData.data[index+3] = 0xff;
                c += incrC;
            }
        }
        // put the image data in the context
        context.putImageData(imageData, 0, 0);
    };
}; // class dwv.info.MiniColorMap


/**
 * Plot info layer.
 * @class Plot
 * @namespace dwv.info
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.info.Plot = function (app)
{
    /**
     * Create the plot info.
     * @method create
     * @param {String} rootId The div root ID.
     */
    this.create = function()
    {
        $.plot($("#"+app.getContainerDivId()+"-plot"), [ app.getImage().getHistogram() ], {
            "bars": { "show": true },
            "grid": { "backgroundColor": null },
            "xaxis": { "show": true },
            "yaxis": { "show": false }
        });
    };

    /**
     * Update plot.
     * @method update
     * @param {Object} event The windowing change event containing the new values.
     * Warning: expects the plot to exist (use after createPlot).
     */
    this.update = function (event)
    {
        var wc = event.wc;
        var ww = event.ww;
        
        var half = parseInt( (ww-1) / 2, 10 );
        var center = parseInt( (wc-0.5), 10 );
        var min = center - half;
        var max = center + half;
        
        var markings = [
            { "color": "#faa", "lineWidth": 1, "xaxis": { "from": min, "to": min } },
            { "color": "#aaf", "lineWidth": 1, "xaxis": { "from": max, "to": max } }
        ];
    
        $.plot($("#"+app.getContainerDivId()+"-plot"), [ app.getImage().getHistogram() ], {
            "bars": { "show": true },
            "grid": { "markings": markings, "backgroundColor": null },
            "xaxis": { "show": false },
            "yaxis": { "show": false }
        });
    };

}; // class dwv.info.Plot
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/** 
 * Line factory.
 * @class LineFactory
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.LineFactory = function ()
{
    /** 
     * Get the number of points needed to build the shape.
     * @method getNPoints
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 2; };
    /** 
     * Get the timeout between point storage.
     * @method getTimeout
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 0; };
};  

/**
 * Create a line shape to be displayed.
 * @method create
 * @param {Array} points The points from which to extract the line.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */ 
dwv.tool.LineFactory.prototype.create = function (points, style, image)
{
    // physical shape
    var line = new dwv.math.Line(points[0], points[1]);
    // draw shape
    var kshape = new Kinetic.Line({
        points: [line.getBegin().getX(), line.getBegin().getY(), 
                 line.getEnd().getX(), line.getEnd().getY() ],
        stroke: style.getLineColor(),
        strokeWidth: 2,
        name: "shape"
    });
    // quantification
    var quant = image.quantifyLine( line );
    var str = quant.length.toPrecision(4) + " mm";
    // quantification text
    var ktext = new Kinetic.Text({
        x: line.getEnd().getX(),
        y: line.getEnd().getY() - 15,
        text: str,
        fontSize: style.getFontSize(),
        fontFamily: "Verdana",
        fill: style.getLineColor(),
        name: "text"
    });
    // return group
    var group = new Kinetic.Group();
    group.name("line-group");
    group.add(kshape);
    group.add(ktext);
    return group;
};

/**
 * Update a line shape.
 * @method UpdateLine
 * @static
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */ 
dwv.tool.UpdateLine = function (anchor, image)
{
    // parent group
    var group = anchor.getParent();
    // associated shape
    var kline = group.getChildren( function (node) {
        return node.name() === 'shape';
    })[0];
    // associated text
    var ktext = group.getChildren( function (node) {
        return node.name() === 'text';
    })[0];
    // find special points
    var begin = group.getChildren( function (node) {
        return node.id() === 'begin';
    })[0];
    var end = group.getChildren( function (node) {
        return node.id() === 'end';
    })[0];
    // update special points
    switch ( anchor.id() ) {
    case 'begin':
        begin.x( anchor.x() );
        begin.y( anchor.y() );
        break;
    case 'end':
        end.x( anchor.x() );
        end.y( anchor.y() );
        break;
    }
    // update shape and compensate for possible drag
    // note: shape.position() and shape.size() won't work...
    var bx = begin.x() - kline.x();
    var by = begin.y() - kline.y();
    var ex = end.x() - kline.x();
    var ey = end.y() - kline.y();
    kline.points( [bx,by,ex,ey] );
    // update text
    var p2d0 = new dwv.math.Point2D(begin.x(), begin.y());
    var p2d1 = new dwv.math.Point2D(end.x(), end.y());
    var line = new dwv.math.Line(p2d0, p2d1);
    var quant = image.quantifyLine( line );
    var str = quant.length.toPrecision(4) + " mm";
    var textPos = { 'x': line.getEnd().getX(), 'y': line.getEnd().getY() - 15 };
    ktext.position( textPos );
    ktext.text(str);
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/**
 * Livewire painting tool.
 * @class Livewire
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Livewire = function(app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @property self
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Livewire GUI.
     * @property gui
     * @type Object
     */
    var gui = null;
    /**
     * Interaction start flag.
     * @property started
     * @type Boolean
     */
    this.started = false;
    
    /**
     * Draw command.
     * @property command
     * @private
     * @type Object
     */
    var command = null;
    /**
     * Current shape group.
     * @property shapeGroup
     * @private
     * @type Object
     */
    var shapeGroup = null;
    /**
     * Drawing style.
     * @property style
     * @type Style
     */
    this.style = new dwv.html.Style();
    
    /**
     * Path storage. Paths are stored in reverse order.
     * @property path
     * @private
     * @type Path
     */
    var path = new dwv.math.Path();
    /**
     * Current path storage. Paths are stored in reverse order.
     * @property currentPath
     * @private
     * @type Path
     */
    var currentPath = new dwv.math.Path();
    /**
     * List of parent points.
     * @property parentPoints
     * @private
     * @type Array
     */
    var parentPoints = [];
    /**
     * Tolerance.
     * @property tolerance
     * @private
     * @type Number
     */
    var tolerance = 5;
    
    /**
     * Clear the parent points list.
     * @method clearParentPoints
     * @private
     */
    function clearParentPoints() {
        var nrows = app.getImage().getGeometry().getSize().getNumberOfRows();
        for( var i = 0; i < nrows; ++i ) {
            parentPoints[i] = [];
        }
    }
    
    /**
     * Clear the stored paths.
     * @method clearPaths
     * @private
     */
    function clearPaths() {
        path = new dwv.math.Path();
        currentPath = new dwv.math.Path();
    }
    
    /**
     * Scissor representation.
     * @property scissors
     * @private
     * @type Scissors
     */
    var scissors = new dwv.math.Scissors();
    
    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        // first time
        if( !self.started ) {
            self.started = true;
            self.x0 = event._x;
            self.y0 = event._y;
            // clear vars
            clearPaths();
            clearParentPoints();
            // do the training from the first point
            var p = new dwv.math.FastPoint2D(event._x, event._y);
            scissors.doTraining(p);
            // add the initial point to the path
            var p0 = new dwv.math.Point2D(event._x, event._y);
            path.addPoint(p0);
            path.addControlPoint(p0);
        }
        else {
            // final point: at 'tolerance' of the initial point
            if( (Math.abs(event._x - self.x0) < tolerance) && (Math.abs(event._y - self.y0) < tolerance) ) {
                // draw
                self.mousemove(event);
                console.log("Done.");
                // save command in undo stack
                app.getUndoStack().add(command);
                // set flag
                self.started = false;
            }
            // anchor point
            else {
                path = currentPath;
                clearParentPoints();
                var pn = new dwv.math.FastPoint2D(event._x, event._y);
                scissors.doTraining(pn);
                path.addControlPoint(currentPath.getPoint(0));
            }
        }
    };

    /**
     * Handle mouse move event.
     * @method mousemove
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        if (!self.started)
        {
            return;
        }
        // set the point to find the path to
        var p = new dwv.math.FastPoint2D(event._x, event._y);
        scissors.setPoint(p);
        // do the work
        var results = 0;
        var stop = false;
        while( !parentPoints[p.y][p.x] && !stop)
        {
            console.log("Getting ready...");
            results = scissors.doWork();
            
            if( results.length === 0 ) { 
                stop = true;
            }
            else {
                // fill parents
                for( var i = 0; i < results.length-1; i+=2 ) {
                    var _p = results[i];
                    var _q = results[i+1];
                    parentPoints[_p.y][_p.x] = _q;
                }
            }
        }
        console.log("Ready!");
        
        // get the path
        currentPath = new dwv.math.Path();
        stop = false;
        while (p && !stop) {
            currentPath.addPoint(new dwv.math.Point2D(p.x, p.y));
            if(!parentPoints[p.y]) { 
                stop = true;
            }
            else { 
                if(!parentPoints[p.y][p.x]) { 
                    stop = true;
                }
                else {
                    p = parentPoints[p.y][p.x];
                }
            }
        }
        currentPath.appenPath(path);
        
        // remove previous draw
        if ( shapeGroup ) {
            shapeGroup.destroy();
        }
        // create shape
        var factory = new dwv.tool.RoiFactory();
        shapeGroup = factory.create(currentPath.pointArray, self.style);
        // draw shape command
        command = new dwv.tool.DrawGroupCommand(shapeGroup, "livewire", app.getDrawLayer());
        // draw
        command.execute();
    };

    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(/*event*/){
        // nothing to do
    };
    
    /**
     * Handle mouse out event.
     * @method mouseout
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        // treat as mouse up
        self.mouseup(event);
    };
    
    /**
     * Handle touch start event.
     * @method touchstart
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        // treat as mouse down
        self.mousedown(event);
    };

    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        // treat as mouse move
        self.mousemove(event);
    };

    /**
     * Handle touch end event.
     * @method touchend
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        // treat as mouse up
        self.mouseup(event);
    };

    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.onKeydown(event);
    };

    /**
     * Setup the tool GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui = new dwv.gui.Livewire(app);
        gui.setup();
    };
    
    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        if ( gui ) {
            gui.display(bool);
        }
        // TODO why twice?
        this.init();
    };

    /**
     * Initialise the tool.
     * @method init
     */
    this.init = function()
    {
        if ( gui ) {
            // set the default to the first in the list
            this.setLineColour(gui.getColours()[0]);
            // init html
            gui.initialise();
        }
        
        //scissors = new dwv.math.Scissors();
        var size = app.getImage().getGeometry().getSize();
        scissors.setDimensions(
                size.getNumberOfColumns(),
                size.getNumberOfRows() );
        scissors.setData(app.getImageData().data);
        
        return true;
    };
    
}; // Livewire class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Livewire.prototype.getHelp = function()
{
    return {
        'title': "Livewire",
        'brief': "The Livewire tool is a semi-automatic segmentation tool " +
            "that proposes to the user paths that follow intensity edges." + 
            "Click once to initialise and then move the mouse to see " + 
            "the proposed paths. Click again to build your contour. " + 
            "The process stops when you click on the first root point. " +
            "BEWARE: the process can take time!"
    };
};

/**
 * Set the line color of the drawing.
 * @method setLineColour
 * @param {String} colour The colour to set.
 */
dwv.tool.Livewire.prototype.setLineColour = function(colour)
{
    // set style var
    this.style.setLineColor(colour);
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/** 
 * Protractor factory.
 * @class ProtractorFactory
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.ProtractorFactory = function ()
{
    /** 
     * Get the number of points needed to build the shape.
     * @method getNPoints
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 3; };
    /** 
     * Get the timeout between point storage.
     * @method getTimeout
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 500; };
};  

/**
 * Create a protractor shape to be displayed.
 * @method ProtractorCreator
 * @static
 * @param {Array} points The points from which to extract the protractor.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */ 
dwv.tool.ProtractorFactory.prototype.create = function (points, style/*, image*/)
{
    // physical shape
    var line0 = new dwv.math.Line(points[0], points[1]);
    // points stored the kineticjs way
    var pointsArray = [];
    for( var i = 0; i < points.length; ++i )
    {
        pointsArray.push( points[i].getX() );
        pointsArray.push( points[i].getY() );
    }
    // draw shape
    var kshape = new Kinetic.Line({
        points: pointsArray,
        stroke: style.getLineColor(),
        strokeWidth: 2,
        name: "shape"
    });
    var group = new Kinetic.Group();
    group.name("protractor-group");
    group.add(kshape);
    // text and decoration
    if ( points.length == 3 ) {
        var line1 = new dwv.math.Line(points[1], points[2]);
        // quantification
        var angle = dwv.math.getAngle(line0, line1);
        var inclination = line0.getInclination();
        if ( angle > 180 ) {
            angle = 360 - angle;
            inclination += angle;
        }
        var angleStr = angle.toPrecision(4) + "\u00B0";
        // quantification text
        var midX = ( line0.getMidpoint().getX() + line1.getMidpoint().getX() ) / 2;
        var midY = ( line0.getMidpoint().getY() + line1.getMidpoint().getY() ) / 2;
        var ktext = new Kinetic.Text({
            x: midX,
            y: midY - 15,
            text: angleStr,
            fontSize: style.getFontSize(),
            fontFamily: "Verdana",
            fill: style.getLineColor(),
            name: "text"
        });
        // arc
        var radius = Math.min(line0.getLength(), line1.getLength()) * 33 / 100;
        var karc = new Kinetic.Arc({
            innerRadius: radius,
            outerRadius: radius,
            stroke: style.getLineColor(),
            angle: angle,
            rotationDeg: -inclination,
            x: points[1].getX(),
            y: points[1].getY(),
            name: "arc"
         });
        // add to group
        group.add(ktext);
        group.add(karc);
    }
    // return group
    return group;
};

/**
 * Update a protractor shape.
 * @method UpdateProtractor
 * @static
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */ 
dwv.tool.UpdateProtractor = function (anchor/*, image*/)
{
    // parent group
    var group = anchor.getParent();
    // associated shape
    var kline = group.getChildren( function (node) {
        return node.name() === 'shape';
    })[0];
    // associated text
    var ktext = group.getChildren( function (node) {
        return node.name() === 'text';
    })[0];
    // associated arc
    var karc = group.getChildren( function (node) {
        return node.name() === 'arc';
    })[0];
    // find special points
    var begin = group.getChildren( function (node) {
        return node.id() === 'begin';
    })[0];
    var mid = group.getChildren( function (node) {
        return node.id() === 'mid';
    })[0];
    var end = group.getChildren( function (node) {
        return node.id() === 'end';
    })[0];
    // update special points
    switch ( anchor.id() ) {
    case 'begin':
        begin.x( anchor.x() );
        begin.y( anchor.y() );
        break;
    case 'mid':
        mid.x( anchor.x() );
        mid.y( anchor.y() );
        break;
    case 'end':
        end.x( anchor.x() );
        end.y( anchor.y() );
        break;
    }
    // update shape and compensate for possible drag
    // note: shape.position() and shape.size() won't work...
    var bx = begin.x() - kline.x();
    var by = begin.y() - kline.y();
    var mx = mid.x() - kline.x();
    var my = mid.y() - kline.y();
    var ex = end.x() - kline.x();
    var ey = end.y() - kline.y();
    kline.points( [bx,by,mx,my,ex,ey] );
    // update text
    var p2d0 = new dwv.math.Point2D(begin.x(), begin.y());
    var p2d1 = new dwv.math.Point2D(mid.x(), mid.y());
    var p2d2 = new dwv.math.Point2D(end.x(), end.y());
    var line0 = new dwv.math.Line(p2d0, p2d1);
    var line1 = new dwv.math.Line(p2d1, p2d2);
    var angle = dwv.math.getAngle(line0, line1);
    var inclination = line0.getInclination();
    if ( angle > 180 ) {
        angle = 360 - angle;
        inclination += angle;
    }
    var str = angle.toPrecision(4) + "\u00B0";
    var midX = ( line0.getMidpoint().getX() + line1.getMidpoint().getX() ) / 2;
    var midY = ( line0.getMidpoint().getY() + line1.getMidpoint().getY() ) / 2;
    var textPos = { 'x': midX, 'y': midY - 15 };
    ktext.position( textPos );
    ktext.text(str);
    // arc
    var radius = Math.min(line0.getLength(), line1.getLength()) * 33 / 100;
    karc.innerRadius(radius);
    karc.outerRadius(radius);
    karc.angle(angle);
    karc.rotation(-inclination);
    var arcPos = { 'x': mid.x(), 'y': mid.y() };
    karc.position(arcPos);
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/** 
 * Rectangle factory.
 * @class RectangleFactory
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.RectangleFactory = function ()
{
    /** 
     * Get the number of points needed to build the shape.
     * @method getNPoints
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 2; };
    /** 
     * Get the timeout between point storage.
     * @method getTimeout
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 0; };
};  

/**
 * Create a rectangle shape to be displayed.
 * @method create
 * @param {Array} points The points from which to extract the rectangle.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */ 
dwv.tool.RectangleFactory.prototype.create = function (points, style, image)
{
    // physical shape
    var rectangle = new dwv.math.Rectangle(points[0], points[1]);
    // draw shape
    var kshape = new Kinetic.Rect({
        x: rectangle.getBegin().getX(),
        y: rectangle.getBegin().getY(),
        width: rectangle.getWidth(),
        height: rectangle.getHeight(),
        stroke: style.getLineColor(),
        strokeWidth: 2,
        name: "shape"
    });
    // quantification
    var quant = image.quantifyRect( rectangle );
    var cm2 = quant.surface / 100;
    var str = cm2.toPrecision(4) + " cm2";
    // quantification text
    var ktext = new Kinetic.Text({
        x: rectangle.getBegin().getX(),
        y: rectangle.getEnd().getY() + 10,
        text: str,
        fontSize: style.getFontSize(),
        fontFamily: "Verdana",
        fill: style.getLineColor(),
        name: "text"
    });
    // return group
    var group = new Kinetic.Group();
    group.name("rectangle-group");
    group.add(kshape);
    group.add(ktext);
    return group;
};

/**
 * Update a rectangle shape.
 * @method UpdateRect
 * @static
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */ 
dwv.tool.UpdateRect = function (anchor, image)
{
    // parent group
    var group = anchor.getParent();
    // associated shape
    var krect = group.getChildren( function (node) {
        return node.name() === 'shape';
    })[0];
    // associated text
    var ktext = group.getChildren( function (node) {
        return node.name() === 'text';
    })[0];
    // find special points
    var topLeft = group.getChildren( function (node) {
        return node.id() === 'topLeft';
    })[0];
    var topRight = group.getChildren( function (node) {
        return node.id() === 'topRight';
    })[0];
    var bottomRight = group.getChildren( function (node) {
        return node.id() === 'bottomRight';
    })[0];
    var bottomLeft = group.getChildren( function (node) {
        return node.id() === 'bottomLeft';
    })[0];
    // update 'self' (undo case) and special points
    switch ( anchor.id() ) {
    case 'topLeft':
        topLeft.x( anchor.x() );
        topLeft.y( anchor.y() );
        topRight.y( anchor.y() );
        bottomLeft.x( anchor.x() );
        break;
    case 'topRight':
        topRight.x( anchor.x() );
        topRight.y( anchor.y() );
        topLeft.y( anchor.y() );
        bottomRight.x( anchor.x() );
        break;
    case 'bottomRight':
        bottomRight.x( anchor.x() );
        bottomRight.y( anchor.y() );
        bottomLeft.y( anchor.y() );
        topRight.x( anchor.x() ); 
        break;
    case 'bottomLeft':
        bottomLeft.x( anchor.x() );
        bottomLeft.y( anchor.y() );
        bottomRight.y( anchor.y() );
        topLeft.x( anchor.x() ); 
        break;
    default :
        console.error('Unhandled anchor id: '+anchor.id());
        break;
    }
    // update shape
    krect.position(topLeft.position());
    var width = topRight.x() - topLeft.x();
    var height = bottomLeft.y() - topLeft.y();
    if ( width && height ) {
        krect.size({'width': width, 'height': height});
    }
    // update text
    var p2d0 = new dwv.math.Point2D(topLeft.x(), topLeft.y());
    var p2d1 = new dwv.math.Point2D(bottomRight.x(), bottomRight.y());
    var rect = new dwv.math.Rectangle(p2d0, p2d1);
    var quant = image.quantifyRect( rect );
    var cm2 = quant.surface / 100;
    var str = cm2.toPrecision(4) + " cm2";
    var textPos = { 'x': rect.getBegin().getX(), 'y': rect.getEnd().getY() + 10 };
    ktext.position(textPos);
    ktext.text(str);
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
var Kinetic = Kinetic || {};

/** 
 * ROI factory.
 * @class RoiFactory
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.RoiFactory = function ()
{
    /** 
     * Get the number of points needed to build the shape.
     * @method getNPoints
     * @return {Number} The number of points.
     */
    this.getNPoints = function () { return 50; };
    /** 
     * Get the timeout between point storage.
     * @method getTimeout
     * @return {Number} The timeout in milliseconds.
     */
    this.getTimeout = function () { return 100; };
};  

/**
 * Create a roi shape to be displayed.
 * @method RoiCreator
 * @param {Array} points The points from which to extract the line.
 * @param {Object} style The drawing style.
 * @param {Object} image The associated image.
 */ 
dwv.tool.RoiFactory.prototype.create = function (points, style /*, image*/)
{
    // physical shape
    var roi = new dwv.math.ROI();
    // add input points to the ROI
    roi.addPoints(points);
    // points stored the kineticjs way
    var arr = [];
    for( var i = 0; i < roi.getLength(); ++i )
    {
        arr.push( roi.getPoint(i).getX() );
        arr.push( roi.getPoint(i).getY() );
    }
    // draw shape
    var kshape = new Kinetic.Line({
        points: arr,
        stroke: style.getLineColor(),
        strokeWidth: 2,
        name: "shape",
        closed: true
    });
    // return group
    var group = new Kinetic.Group();
    group.name("roi-group");
    group.add(kshape);
    return group;
}; 

/**
 * Update a roi shape.
 * @method UpdateRoi
 * @static
 * @param {Object} anchor The active anchor.
 * @param {Object} image The associated image.
 */ 
dwv.tool.UpdateRoi = function (anchor /*, image*/)
{
    // parent group
    var group = anchor.getParent();
    // associated shape
    var kroi = group.getChildren( function (node) {
        return node.name() === 'shape';
    })[0];
    // update self
    var point = group.getChildren( function (node) {
        return node.id() === anchor.id();
    })[0];
    point.x( anchor.x() );
    point.y( anchor.y() );
    // update the roi point and compensate for possible drag
    // (the anchor id is the index of the point in the list)
    var points = kroi.points();
    points[anchor.id()] = anchor.x() - kroi.x();
    points[anchor.id()+1] = anchor.y() - kroi.y();
    kroi.points( points );
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
/**
 * Namespace for tool functions.
 * @class tool
 * @namespace dwv
 * @static
 */
dwv.tool = dwv.tool || {};

/**
 * Scroll class.
 * @class Scroll
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Scroll = function(app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @property self
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Scroll GUI.
     * @property gui
     * @type Object
     */
    var gui = null;
    /**
     * Interaction start flag.
     * @property started
     * @type Boolean
     */
    this.started = false;

    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        self.started = true;
        // first position
        self.x0 = event._x;
        self.y0 = event._y;
    };

    /**
     * Handle mouse move event.
     * @method mousemove
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        if (!self.started) {
            return;
        }

        // difference to last position
        var diffY = event._y - self.y0;
        // do not trigger for small moves
        if( Math.abs(diffY) < 15 ) {
            return;
        }
        // update GUI
        if( diffY > 0 ) {
            app.getView().incrementSliceNb();
        }
        else {
            app.getView().decrementSliceNb();
        }
        // reset origin point
        self.x0 = event._x;
        self.y0 = event._y;
    };

    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(/*event*/){
        if (self.started)
        {
            // stop recording
            self.started = false;
        }
    };
    
    /**
     * Handle mouse out event.
     * @method mouseout
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        self.mouseup(event);
    };

    /**
     * Handle touch start event.
     * @method touchstart
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        self.mousedown(event);
    };

    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        self.mousemove(event);
    };

    /**
     * Handle touch end event.
     * @method touchend
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        self.mouseup(event);
    };

    /**
     * Handle mouse scroll event (fired by Firefox).
     * @method DOMMouseScroll
     * @param {Object} event The mouse scroll event.
     */
    this.DOMMouseScroll = function(event){
        // ev.detail on firefox is 3
        if( event.detail < 0 ) {
            app.getView().incrementSliceNb();
        }
        else {
            app.getView().decrementSliceNb();
        }
    };

    /**
     * Handle mouse wheel event.
     * @method mousewheel
     * @param {Object} event The mouse wheel event.
     */
    this.mousewheel = function(event){
        // ev.wheelDelta on chrome is 120
        if( event.wheelDelta > 0 ) {
            app.getView().incrementSliceNb();
        }
        else {
            app.getView().decrementSliceNb();
        }
    };
    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.onKeydown(event);
    };

    /**
     * Setup the tool GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui = new dwv.gui.Scroll(app);
        gui.setup();
    };
    
    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        if ( gui ) {
            gui.display(bool);
        }
    };

    /**
     * Initialise the tool.
     * @method init
     */
    this.init = function() {
        if ( app.getNSlicesToLoad() === 1 ) {
            return false;
        }
        return true;
    };
    
}; // Scroll class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Scroll.prototype.getHelp = function()
{
    return {
        'title': "Scroll",
        'brief': "The scroll tool allows to scroll through slices.",
        'mouse': {
            'mouse_drag': "A single vertical mouse drag changes the current slice.",
        },
        'touch': {
            'touch_drag': "A single vertical touch drag changes the current slice.",
        }
    };
};

;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
/**
 * Namespace for tool functions.
 * @class tool
 * @namespace dwv
 * @static
 */
dwv.tool = dwv.tool || {};

/**
 * Tool box.
 * @class Toolbox
 * @namespace dwv.tool
 * @constructor
 * @param {Array} toolList The list of tool objects.
 * @param {Object} gui The associated gui.
 */
dwv.tool.Toolbox = function( toolList, app )
{
    /**
     * Toolbox GUI.
     * @property gui
     * @type Object
     */
    var gui = null;
    /**
     * Selected tool.
     * @property selectedTool
     * @type Object
     */
    var selectedTool = null;
    /**
     * Default tool name.
     * @property defaultToolName
     * @type String
     */
    var defaultToolName = null;
    
    /**
     * Get the list of tools.
     * @method getToolList
     * @return {Array} The list of tool objects.
     */
    this.getToolList = function ()
    {
        return toolList;
    };

    /**
     * Get the selected tool.
     * @method getSelectedTool
     * @return {Object} The selected tool.
     */
    this.getSelectedTool = function ()
    {
        return selectedTool;
    };

    /**
     * Setup the toolbox GUI.
     * @method setup
     */
    this.setup = function ()
    {
        if ( Object.keys(toolList).length !== 0 ) {
            gui = new dwv.gui.Toolbox(app);
            gui.setup(toolList);
            for( var key in toolList ) {
                toolList[key].setup();
            }
        }
    };

    /**
     * Display the toolbox.
     * @method display
     * @param {Boolean} bool Flag to display or not.
     */
    this.display = function (bool)
    {
        if ( Object.keys(toolList).length !== 0 && gui ) {
            gui.display(bool);
        }
    };
    
    /**
     * Initialise the tool box.
     * @method init
     */
    this.init = function ()
    {
        var keys = Object.keys(toolList);
        // check if we have tools
        if ( keys.length === 0 ) {
            return;
        }
        // init all tools
        defaultToolName = "";
        var displays = [];
        var display = null;
        for( var key in toolList ) {
            display = toolList[key].init();
            if ( display && defaultToolName === "" ) {
                defaultToolName = key;
            }
            displays.push(display);
        }
        this.setSelectedTool(defaultToolName);
        // init html
        if ( gui ) {
            gui.initialise(displays);
        }
    };

    /**
     * Set the selected tool.
     * @method setSelectedTool
     * @return {String} The name of the tool to select.
     */
    this.setSelectedTool = function (name)
    {
        // check if we have it
        if( !this.hasTool(name) )
        {
            throw new Error("Unknown tool: '" + name + "'");
        }
        // hide last selected
        if( selectedTool )
        {
            selectedTool.display(false);
        }
        // enable new one
        selectedTool = toolList[name];
        // display it
        selectedTool.display(true);
    };

    /**
     * Reset the tool box.
     * @method init
     */
    this.reset = function ()
    {
        // hide last selected
        if ( selectedTool ) {
            selectedTool.display(false);
        }
        selectedTool = null;
        defaultToolName = null;
    };
};

/**
 * Check if a tool is in the tool list.
 * @method hasTool
 * @param {String} name The name to check.
 * @return {String} The tool list element for the given name.
 */
dwv.tool.Toolbox.prototype.hasTool = function (name)
{
    return this.getToolList()[name];
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * UndoStack class.
 * @class UndoStack
 * @namespace dwv.tool
 * @constructor
 */
dwv.tool.UndoStack = function ()
{ 
    /**
     * Undo GUI.
     * @property gui
     * @type Object
     */
    var gui = new dwv.gui.Undo();
    /**
     * Array of commands.
     * @property stack
     * @private
     * @type Array
     */
    var stack = [];
    /**
     * Current command index.
     * @property curCmdIndex
     * @private
     * @type Number
     */
    var curCmdIndex = 0;

    /**
     * Add a command to the stack.
     * @method add
     * @param {Object} cmd The command to add.
     */
    this.add = function(cmd)
    { 
        // clear commands after current index
        stack = stack.slice(0,curCmdIndex);
        // store command
        stack.push(cmd);
        //stack[curCmdIndex] = cmd;
        // increment index
        ++curCmdIndex;
        // add command to display history
        gui.addCommandToUndoHtml(cmd.getName());
    };

    /**
     * Undo the last command. 
     * @method undo
     */
    this.undo = function()
    { 
        // a bit inefficient...
        if( curCmdIndex > 0 )
        {
            // decrement command index
            --curCmdIndex; 
            // undo last command
            stack[curCmdIndex].undo();
            // disable last in display history
            gui.enableInUndoHtml(false);
        }
    }; 

    /**
     * Redo the last command.
     * @method redo
     */
    this.redo = function()
    { 
        if( curCmdIndex < stack.length )
        {
            // run last command
            stack[curCmdIndex].execute();
            // increment command index
            ++curCmdIndex;
            // enable next in display history
            gui.enableInUndoHtml(true);
        }
    };

    /**
     * Setup the tool GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Initialise the tool GUI.
     * @method initialise
     */
    this.initialise = function ()
    {
        gui.initialise();
    };

}; // UndoStack class
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
/**
 * Namespace for tool functions.
 * @class tool
 * @namespace dwv
 * @static
 */
dwv.tool = dwv.tool || {};

// Default colour maps.
dwv.tool.colourMaps = {
    "plain": dwv.image.lut.plain,
    "invplain": dwv.image.lut.invPlain,
    "rainbow": dwv.image.lut.rainbow,
    "hot": dwv.image.lut.hot,
    "test": dwv.image.lut.test
};
// Default window level presets.
dwv.tool.defaultpresets = {};
dwv.tool.defaultpresets.CT = {
    "mediastinum": {"center": 40, "width": 400},
    "lung": {"center": -500, "width": 1500},
    "bone": {"center": 500, "width": 2000},
};
dwv.tool.defaultpresets.CTextra = {
    "brain": {"center": 40, "width": 80},
    "head": {"center": 90, "width": 350}
};

/**
 * WindowLevel tool: handle window/level related events.
 * @class WindowLevel
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.WindowLevel = function(app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @property self
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * WindowLevel GUI.
     * @property gui
     * @type Object
     */
    var gui = null;
    /**
     * Interaction start flag.
     * @property started
     * @type Boolean
     */
    this.started = false;
    
    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        // set start flag
        self.started = true;
        // store initial position
        self.x0 = event._x;
        self.y0 = event._y;
        // update GUI
        app.setCurrentPostion(event._x, event._y);
    };
    
    /**
     * Handle mouse move event.
     * @method mousemove
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        // check start flag
        if( !self.started ) {
            return;
        }
        // difference to last position
        var diffX = event._x - self.x0;
        var diffY = self.y0 - event._y;
        // calculate new window level
        var windowCenter = parseInt(app.getView().getWindowLut().getCenter(), 10) + diffY;
        var windowWidth = parseInt(app.getView().getWindowLut().getWidth(), 10) + diffX;
        // update GUI
        app.getViewController().setWindowLevel(windowCenter,windowWidth);
        // store position
        self.x0 = event._x;
        self.y0 = event._y;
    };
    
    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(/*event*/){
        // set start flag
        if( self.started ) {
            self.started = false;
            // store the manual preset
            var windowCenter = parseInt(app.getView().getWindowLut().getCenter(), 10);
            var windowWidth = parseInt(app.getView().getWindowLut().getWidth(), 10);
            app.getPresets().manual = {"center": windowCenter, "width": windowWidth};
            // update gui
            if ( gui ) {
                gui.initialise();
                // set selected
                dwv.gui.setSelected("presetSelect", "Manual");
            }
        }
    };
    
    /**
     * Handle mouse out event.
     * @method mouseout
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        // treat as mouse up
        self.mouseup(event);
    };
    
    /**
     * Handle touch start event.
     * @method touchstart
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        self.mousedown(event);
    };
    
    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        self.mousemove(event);
    };
    
    /**
     * Handle touch end event.
     * @method touchend
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        self.mouseup(event);
    };
    
    /**
     * Handle double click event.
     * @method dblclick
     * @param {Object} event The double click event.
     */
    this.dblclick = function(event){
        // update GUI
        app.getViewController().setWindowLevel(
            parseInt(app.getImage().getRescaledValue(event._x, event._y, app.getView().getCurrentPosition().k), 10),
            parseInt(app.getView().getWindowLut().getWidth(), 10) );    
    };
    
    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        // let the app handle it
        app.onKeydown(event);
    };
    
    /**
     * Setup the tool GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui = new dwv.gui.WindowLevel(app);
        gui.setup();
    };
    
    /**
     * Display the tool.
     * @method display
     * @param {Boolean} bool The flag to display or not.
     */
    this.display = function (bool)
    {
        if ( gui )
        {
            if( app.getImage().getPhotometricInterpretation().match(/MONOCHROME/) !== null ) {
                gui.display(bool);
            }
            else {
                gui.display(false);
            }
        }
    };
    
    /**
     * Initialise the tool.
     * @method init
     */
    this.init = function() {
        app.updatePresets(true);
        if ( gui ) {
            gui.initialise();
        }
        return true;
    };
}; // WindowLevel class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.WindowLevel.prototype.getHelp = function()
{
    return {
        'title': "Window/Level",
        'brief': "Changes the Window and Level of the image.",
        'mouse': {
            'mouse_drag': "A single mouse drag changes the window in the horizontal direction and the level in the vertical one.",
            'double_click': "A double click will center the window and level on the clicked intensity.",
        },
        'touch': {
            'touch_drag': "A single touch drag changes the window in the horizontal direction and the level in the vertical one.",
        }
    };
};
;/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
/**
 * Namespace for tool functions.
 * @class tool
 * @namespace dwv
 * @static
 */
dwv.tool = dwv.tool || {};

/**
 * ZoomAndPan class.
 * @class ZoomAndPan
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.ZoomAndPan = function(app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @property self
     * @private
     * @type Object
     */
    var self = this;
    /**
     * ZoomAndPan GUI.
     * @property gui
     * @type Object
     */
    var gui = null;
    /**
     * Interaction start flag.
     * @property started
     * @type Boolean
     */
    this.started = false;

    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        self.started = true;
        // first position
        self.x0 = event._xs;
        self.y0 = event._ys;
    };

    /**
     * Handle two touch down event.
     * @method twotouchdown
     * @param {Object} event The touch down event.
     */
    this.twotouchdown = function(event){
        self.started = true;
        // store first point
        self.x0 = event._x;
        self.y0 = event._y;
        // first line
        var point0 = new dwv.math.Point2D(event._x, event._y);
        var point1 = new dwv.math.Point2D(event._x1, event._y1);
        self.line0 = new dwv.math.Line(point0, point1);
        self.midPoint = self.line0.getMidpoint();         
    };

    /**
     * Handle mouse move event.
     * @method mousemove
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        if (!self.started)
        {
            return;
        }
        // calculate translation
        var tx = event._xs - self.x0;
        var ty = event._ys - self.y0;
        // apply translation
        translateLayers(tx, ty);
        // reset origin point
        self.x0 = event._xs;
        self.y0 = event._ys;
    };

    /**
     * Handle two touch move event.
     * @method twotouchmove
     * @param {Object} event The touch move event.
     */
    this.twotouchmove = function(event){
        if (!self.started)
        {
            return;
        }
        var point0 = new dwv.math.Point2D(event._x, event._y);
        var point1 = new dwv.math.Point2D(event._x1, event._y1);
        var newLine = new dwv.math.Line(point0, point1);
        var lineRatio = newLine.getLength() / self.line0.getLength();
        
        if( lineRatio === 1 )
        {
            // scroll mode
            // difference  to last position
            var diffY = event._y - self.y0;
            // do not trigger for small moves
            if( Math.abs(diffY) < 15 ) {
                return;
            }
            // update GUI
            if( diffY > 0 ) {
                app.getView().incrementSliceNb();
            }
            else {
                app.getView().decrementSliceNb();
            }
        }
        else
        {
            // zoom mode
            var zoom = (lineRatio - 1) / 2;
            if( Math.abs(zoom) % 0.1 <= 0.05 ) {
                zoomLayers(zoom, self.midPoint.getX(), self.midPoint.getY(),event._xs, event._ys);
            }
        }
    };
    
    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(/*event*/){
        if (self.started)
        {
            // stop recording
            self.started = false;
        }
    };
    
    /**
     * Handle mouse out event.
     * @method mouseout
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        self.mouseup(event);
    };

    /**
     * Handle touch start event.
     * @method touchstart
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        var touches = event.targetTouches;
        if( touches.length === 1 ){
            self.mousedown(event);
        }
        else if( touches.length === 2 ){
            self.twotouchdown(event);
        }
    };

    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        var touches = event.targetTouches;
        if( touches.length === 1 ){
            self.mousemove(event);
        }
        else if( touches.length === 2 ){
            self.twotouchmove(event);
        }
    };

    /**
     * Handle touch end event.
     * @method touchend
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        self.mouseup(event);
    };

    /**
     * Handle mouse scroll event (fired by Firefox).
     * @method DOMMouseScroll
     * @param {Object} event The mouse scroll event.
     */
    this.DOMMouseScroll = function(event){
        // ev.detail on firefox is 3
        var step = - event.detail / 30;
        zoomLayers(step, event._x, event._y, event._xs, event._ys);
    };

    /**
     * Handle mouse wheel event.
     * @method mousewheel
     * @param {Object} event The mouse wheel event.
     */
    this.mousewheel = function(event){
        // ev.wheelDelta on chrome is 120
        var step = event.wheelDelta / 1200;
        zoomLayers(step, event._x, event._y, event._xs, event._ys);
    };
    
    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.onKeydown(event);
    };

    /**
     * Setup the tool GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui = new dwv.gui.ZoomAndPan(app);
        gui.setup();
    };
    
    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        if ( gui ) {
            gui.display(bool);
        }
    };

    /**
     * Apply the zoom to the layers.
     * @method zoomLayers
     * @param {Number} step The zoom step increment. A good step is of 0.1.
     * @param {Number} cx The zoom center X coordinate.
     * @param {Number} cy The zoom center Y coordinate.
     */ 
    function zoomLayers(step, cx, cy, cx2, cy2)
    {
        if( app.getImageLayer() ) {
            var oldZoom = app.getImageLayer().getZoom();
            var newZoom = {'x': (oldZoom.x + step), 'y': (oldZoom.y + step)};
            app.getImageLayer().zoom(newZoom.x, newZoom.y, cx2, cy2);
            app.getImageLayer().draw();
        }
        if( app.getDrawStage() ) { 
            
            var stage = app.getDrawStage();
            var oldKZoom = stage.scale();
            var newKZoom = {'x': (oldKZoom.x + step), 'y': (oldKZoom.y + step)};
            
            var oldOffset = stage.offset();
            var newOffsetX = (cx2 / oldKZoom.x) + oldOffset.x - (cx2 / newKZoom.x);
            var newOffsetY = (cy2 / oldKZoom.y) + oldOffset.y - (cy2 / newKZoom.y);
            var newOffset = { 'x': newOffsetX, 'y': newOffsetY };
            
            stage.offset( newOffset );
            stage.scale( newKZoom );
            stage.draw();
        }
    }

    /**
     * Apply a translation to the layers.
     * @method translateLayers
     * @param {Number} tx The translation along X.
     * @param {Number} ty The translation along Y.
     */ 
    function translateLayers(tx, ty)
    {
        if( app.getImageLayer() ) {
            var layer = app.getImageLayer();
            var zoom = layer.getZoom();
            var txx = tx / zoom.x;
            var tyy = ty / zoom.y;
            layer.translate(txx, tyy);
            layer.draw();
        }
        if( app.getDrawStage() ) { 
            var stage = app.getDrawStage();
            var offset = stage.offset();
            var kzoom = stage.scale();
            offset.x -= tx / kzoom.x;
            offset.y -= ty / kzoom.y;
            stage.offset( offset );
            stage.draw();
        }
    }

}; // ZoomAndPan class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.ZoomAndPan.prototype.getHelp = function()
{
    return {
        'title': "Zoom/Pan",
        'brief': "The Zoom/Pan tool allows to zoom and pan the image.",
        'mouse': {
            'mouse_wheel': "The mouse wheel is used to zoom the image.",
            'mouse_drag': "A single mouse drag drags the image in the desired direction."
        },
        'touch': {
            'twotouch_pinch': "A pinch in or out allows to zoom the image.",
            'touch_drag': "A single touch drag drags the image in the desired direction."
        }
    };
};

/**
 * Initialise the tool.
 * @method init
 */
dwv.tool.ZoomAndPan.prototype.init = function() {
    return true;
};;/** 
 * Utility module.
 * @module utils
 */
var dwv = dwv || {};
/**
 * Namespace for utility functions.
 * @class utils
 * @namespace dwv
 * @static
 */
dwv.utils = dwv.utils || {};

/**
 * Capitalise the first letter of a string.
 * @method capitaliseFirstLetter
 * @static
 * @param {String} string The string to capitalise the first letter.
 * @return {String} The new string.
 */
dwv.utils.capitaliseFirstLetter = function (string)
{
    var res = string;
    if ( string ) {
        res = string.charAt(0).toUpperCase() + string.slice(1);
    }
    return res;
};

/**
 * Clean string: trim and remove ending.
 * @method cleanString
 * @static
 * @param {String} string The string to clean.
 * @return {String} The cleaned string.
 */
dwv.utils.cleanString = function (string)
{
    var res = string;
    if ( string ) {
        // trim spaces
        res = string.trim();
        // get rid of ending zero-width space (u200B)
        if ( res[res.length-1] === String.fromCharCode("u200B") ) {
            res = res.substring(0, res.length-1);
        }
    }
    return res;
};

/**
 * Split query string:
 *  'root?key0=val00&key0=val01&key1=val10' returns 
 *  { base : root, query : [ key0 : [val00, val01], key1 : val1 ] }
 * Returns an empty object if the input string is not correct (null, empty...)
 *  or if it is not a query string (no question mark).
 * @method splitQueryString
 * @static
 * @param {String} inputStr The string to split.
 * @return {Object} The split string.
 */
dwv.utils.splitQueryString = function (inputStr)
{
    // result
    var result = {};
    // check if query string
    var sepIndex = null;
    if ( inputStr && (sepIndex = inputStr.indexOf('?')) !== -1 ) {
        // base: before the '?'
        result.base = inputStr.substr(0, sepIndex);
        // query : after the '?'
        var query = inputStr.substr(sepIndex + 1);
        // split key/value pairs of the query
        result.query = dwv.utils.splitKeyValueString(query);
    }
    // return
    return result;
};

/**
 * Split key/value string:
 *  key0=val00&key0=val01&key1=val10 returns 
*   { key0 : [val00, val01], key1 : val1 }
 * @method splitKeyValueString
 * @static
 * @param {String} inputStr The string to split.
 * @return {Object} The split string.
 */
dwv.utils.splitKeyValueString = function (inputStr)
{
    // result
    var result = {};
    // check input string
    if ( inputStr ) {
         // split key/value pairs
        var pairs = inputStr.split('&');
        for ( var i = 0; i < pairs.length; ++i )
        {
            var pair = pairs[i].split('=');
            // if the key does not exist, create it
            if ( !result[pair[0]] ) 
            {
                result[pair[0]] = pair[1];
            }
            else
            {
                // make it an array
                if ( !( result[pair[0]] instanceof Array ) ) {
                    result[pair[0]] = [result[pair[0]]];
                }
                result[pair[0]].push(pair[1]);
            }
        }
    }
    return result;
};
