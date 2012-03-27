/**
* dwvApp
* Main application.
*/
function DwvApp()
{
    // Local object.
    var self = this;
    
    // Image details.
    var image = null;
    
    var imageData = null;
    // Get the image details.
    this.getImageData = function() { return imageData; };
    
    // Image layer.
    var imageLayer = null;
    // Draw layer.
    var drawLayer = null;
    // Temporary layer.
    var tempLayer = null;
    // Information layer.
    var infoLayer = null;

    // Tool box.
    var toolBox = new ToolBox(this);
    
    // Style.
    var style = new Style();
    
    // UndoStack
    var undoStack = new UndoStack(this);
    
    // Get the image details.
    this.getImage = function() { return image; };
    
    // Get the tool box.
    this.getToolBox = function() { return toolBox; };

    // Get the image layer.
    this.getImageLayer = function() { return imageLayer; };
    // Get the draw layer.
    this.getDrawLayer = function() { return drawLayer; };
    // Get the temporary layer.
    this.getTempLayer = function() { return tempLayer; };
    // Get the information layer.
    this.getInfoLayer = function() { return infoLayer; };

    // Get the drawing context.
    this.getStyle = function() { return style; };

    // Get the image details.
    this.getUndoStack = function() { return undoStack; };

    /**
     * Initialise the HTML for the application.
     */
    this.init = function()
    {
        // add the HTML for the tool box 
        toolBox.appendHtml();
        // add the HTML for the history 
        undoStack.appendHtml();
        // bind open files with method
        document.getElementById('files').addEventListener('change', this.loadDicom, false);
    };
    
    /**
     * Set the line color.
     * @param event
     */
    this.setLineColor = function(event)
    {
        // get the color
        var color = event.target.id;
        // set style var
        self.getStyle().setLineColor(color);
        // reset borders
        tool.draw.setLineColor(color);
    };
    
    /**
     * Handle key event.
     * - CRTL-Z: undo
     * - CRTL-Y: redo
     * Default behavior. Usually used in tools. 
     * @param event
     */
    this.handleKeyDown = function(event)
    {
        if( event.keyCode === 90 && event.ctrlKey ) // CRTL-Z
        {
            self.getUndoStack().undo();
        }
        else if( event.keyCode === 89 && event.ctrlKey ) // CRTL-Y
        {
            self.getUndoStack().redo();
        }
    };
    
    /**
     * @private
     * The general-purpose event handler. This function just determines the mouse 
     * position relative to the canvas element.
     */
    function eventHandler(event)
    {
        // if mouse event, check that it is in the canvas
        if( event.type === "mousemove"
            || event.type === "mousedown"
            || event.type === "mouseup"
            || event.type === "mousewheel" )
        {
            // set event._x and event._y to be used later
            // layerX is for firefox
            event._x = event.offsetX === undefined ? event.layerX : event.offsetX;
            event._y = event.offsetY === undefined ? event.layerY : event.offsetY;
            
            if(event._x < 0 
                || event._y < 0 
                || event._x >= image.getSize().getNumberOfColumns() 
                || event._y >= image.getSize().getNumberOfRows() )
            {
                // exit
                return;
            }
        }
            
        // Call the event handler of the tool.
        var func = self.getToolBox().getSelectedTool()[event.type];
        if (func)
        {
            func(event);
        }
    }

    /**
     * @public
     */
    this.loadDicom = function(evt) 
    {
        loadDicomFile(evt.target.files[0]);
    };
    
    /**
     * @private
     * @param file
     */
    function loadDicomFile(file) 
    {
        var myreader = new FileReader();
        myreader.onload = ( function() {
            return function(e) {
                // read the DICOM file
                parseAndLoadDicom(e.target.result);
                // prepare display
                postLoadInit();
                // Generate and draw the image data array
                self.generateAndDrawImage();
                 
                // add the tag list data
                var span = document.createElement('div');
                span.innerHTML = ['<p><b>', e.target.result.length, '</b></p>'].join('');
                document.getElementById('tagList').insertBefore(span, null);
            };
        }()
        );
        myreader.readAsBinaryString(file);
    }
    
    /**
     * @private
     * @param file
     */
    function parseAndLoadDicom(file)
    {    
        var reader = new DicomInputStreamReader();    
        reader.readDicom(file);
        var dicomBuffer = reader.getInputBuffer();
        var dicomReader = reader.getReader();
        var dicomParser = new DicomParser(dicomBuffer,dicomReader);
        dicomParser.parseAll();     
        
        // tag list table      
        var table = document.getElementById("tagList");
        
        var numberOfRows = 0;
        var numberOfColumns = 0;
        var rowSpacing = 0;
        var columnSpacing = 0;
        var windowWidth = 0;
        var windowCenter = 0;
        var rescaleIntercept = 0;
        var rescaleSlope = 0;
        
        var elementindex=0;
        for(;elementindex<dicomParser.dicomElement.length;elementindex++)
        {
            var dicomElement=dicomParser.dicomElement[elementindex];            
            if(dicomElement.name === "Rows")
            {
                numberOfRows=dicomElement.value[0];
            }
            else if(dicomElement.name === "Columns")
            {
                numberOfColumns=dicomElement.value[0];
            }
            else if(dicomElement.name === "PixelSpacing")
            {
                rowSpacing=parseFloat(dicomElement.value[0]);    
                columnSpacing=parseFloat(dicomElement.value[1]);    
            }
            else if(dicomElement.name === "WindowWidth")
            {
                windowWidth=dicomElement.value[0];
            }
            else if(dicomElement.name === "WindowCenter")
            {
                windowCenter=dicomElement.value[0];            
            }
            else if(dicomElement.name === "RescaleSlope")
            {
                rescaleSlope=parseInt(dicomElement.value, 10);    
            }
            else if(dicomElement.name === "RescaleIntercept")
            {
                rescaleIntercept=parseInt(dicomElement.value, 10);
            }

            var lastRow = table.rows.length;
            var row = table.insertRow(lastRow);
            var cell0 = row.insertCell(0);
            cell0.appendChild(document.createTextNode(dicomElement.group+", "+dicomElement.element));
            var cell1 = row.insertCell(1);
            cell1.appendChild(document.createTextNode(dicomElement.name));
            var cell2 = row.insertCell(2);
            cell2.appendChild(document.createTextNode(dicomElement.value));
        } 
               
        document.getElementById("tags").style.display='';
        
        // create the DICOM image
        image = new DicomImage(
            ImageSize(numberOfColumns, numberOfRows),
            ImageSpacing(columnSpacing, rowSpacing),
            dicomParser.pixelBuffer );
        image.setLookup( windowCenter, windowWidth, rescaleSlope, rescaleIntercept);
    }
    
    /**
     * @private
     * To be called once the image is loaded.
     */
    function postLoadInit()
    {
        var numberOfColumns = image.getSize().getNumberOfColumns();
        var numberOfRows = image.getSize().getNumberOfRows();
        
        // image layer
        imageLayer = new Layer("imageLayer");
        imageLayer.init(numberOfColumns, numberOfRows);
        imageLayer.fillContext();
        // draw layer
        drawLayer = new Layer("drawLayer");
        drawLayer.init(numberOfColumns, numberOfRows);
        // temp layer
        tempLayer = new Layer("tempLayer");
        tempLayer.init(numberOfColumns, numberOfRows);
        // Attach the mousedown, mousemove and mouseup event listeners.
        tempLayer.getCanvas().addEventListener('mousedown', eventHandler, false);
        tempLayer.getCanvas().addEventListener('mousemove', eventHandler, false);
        tempLayer.getCanvas().addEventListener('mouseup', eventHandler, false);
        tempLayer.getCanvas().addEventListener('mousewheel', eventHandler, false);
        tempLayer.getCanvas().addEventListener('DOMMouseScroll', eventHandler, false);
        // info layer
        infoLayer = new Layer("infoLayer");
        infoLayer.init(numberOfColumns, numberOfRows);
        
        // Keydown listener
        window.addEventListener('keydown', eventHandler, true);

        // initialise the toolbox
        toolBox.init();
    }
    
    /**
     * @private
     */
    this.generateAndDrawImage = function()
    {         
        // store first image data
        if( imageData === null )
        {
            imageData = self.getImageLayer().getContext().getImageData( 
                0, 0, 
                self.getImage().getSize().getNumberOfColumns(), 
                self.getImage().getSize().getNumberOfRows());
        }
        // generate image data from DICOM
        self.getImage().generateImageData(imageData);         
        // set the image data of the layer
        self.getImageLayer().setImageData(imageData);
        // draw the image
        self.getImageLayer().draw();
    };
}