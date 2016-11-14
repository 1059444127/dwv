// namespaces
var dwv = dwv || {};
//external
var Kinetic = Kinetic || {};

/**
 * State class.
 * Saves: data url/path, display info, undo stack.
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.State = function (app)
{
    /**
     * Save the application state as JSON.
     */
    this.toJSON = function () {
        // store each slice drawings group
        var drawings = app.getDraws();
        var drawingsDetails = app.getDrawStoreDetails();
        // return a JSON string
        return JSON.stringify( {
            "version": "0.2",
            "window-center": app.getViewController().getWindowLevel().center,
            "window-width": app.getViewController().getWindowLevel().width,
            "position": app.getViewController().getCurrentPosition(),
            "scale": app.getScale(),
            "scaleCenter": app.getScaleCenter(),
            "translation": app.getTranslation(),
            "drawings": drawings,
            // new in v0.2
            "drawingsDetails": drawingsDetails
        } );
    };
    /**
     * Load an application state from JSON.
     * @param {String} json The JSON representation of the state.
     */
    this.fromJSON = function (json) {
        var data = JSON.parse(json);
        if (data.version === "0.1") {
            readV01(data);
        }
        else if (data.version === "0.2") {
            readV02(data);
        }
        else {
            throw new Error("Unknown state file format version: '"+data.version+"'.");
        }
    };
    /**
     * Read an application state from an Object in v0.1 format.
     * @param {Object} data The Object representation of the state.
     */
    function readV01(data) {
        // display
        app.getViewController().setWindowLevel(data["window-center"], data["window-width"]);
        app.getViewController().setCurrentPosition(data.position);
        app.zoom(data.scale, data.scaleCenter.x, data.scaleCenter.y);
        app.translate(data.translation.x, data.translation.y);
        // drawings
        app.setDrawings( data.drawings, null);
        /*var nSlices = app.getImage().getGeometry().getSize().getNumberOfSlices();
        var nFrames = app.getImage().getNumberOfFrames();
        var isShape = function (node) {
            return node.name() === "shape";
        };
        for ( var k = 0 ; k < nSlices; ++k ) {
            for ( var f = 0; f < nFrames; ++f ) {
                for ( var i = 0 ; i < data.drawings[k][f].length; ++i ) {
                    var group = Kinetic.Node.create(data.drawings[k][f][i]);
                    var shape = group.getChildren( isShape )[0];
                    var cmd = new dwv.tool.DrawGroupCommand(
                        group, shape.className,
                        app.getDrawLayer(k,f) );
                    if ( typeof eventCallback !== "undefined" ) {
                        cmd.onExecute = eventCallback;
                        cmd.onUndo = eventCallback;
                    }
                    cmd.execute();
                    app.addToUndoStack(cmd);
                }
            }
        }*/
    }
    /**
     * Read an application state from an Object in v0.2 format.
     * @param {Object} data The Object representation of the state.
     */
    function readV02(data) {
        // display
        app.getViewController().setWindowLevel(data["window-center"], data["window-width"]);
        app.getViewController().setCurrentPosition(data.position);
        app.zoom(data.scale, data.scaleCenter.x, data.scaleCenter.y);
        app.translate(data.translation.x, data.translation.y);
        // drawings
        app.setDrawings( data.drawings, data.drawingsDetails);
        /*var nSlices = app.getImage().getGeometry().getSize().getNumberOfSlices();
        var nFrames = app.getImage().getNumberOfFrames();
        var isShape = function (node) {
            return node.name() === "shape";
        };
        var isLabel = function (node) {
            return node.name() === "label";
        };
        for ( var k = 0 ; k < nSlices; ++k ) {
            for ( var f = 0; f < nFrames; ++f ) {
                for ( var i = 0 ; i < data.drawings[k][f].length; ++i ) {
                    var group = Kinetic.Node.create(data.drawings[k][f][i]);
                    var shape = group.getChildren( isShape )[0];
                    var cmd = new dwv.tool.DrawGroupCommand(
                        group, shape.className,
                        app.getDrawLayer(k,f) );
                    if ( typeof eventCallback !== "undefined" ) {
                        cmd.onExecute = eventCallback;
                        cmd.onUndo = eventCallback;
                    }
                    // text (new in v0.2)
                    // TODO Verify ID?
                    var details = data.drawingsDetails[k][f][i];
                    var label = group.getChildren( isLabel )[0];
                    var text = label.getText();
                    // store details
                    text.textExpr = details.textExpr;
                    text.longText = details.longText;
                    text.quant = details.quant;
                    // reset text (it was not encoded)
                    text.setText(dwv.utils.replaceFlags(text.textExpr, text.quant));
                    // execute
                    cmd.execute();
                    app.addToUndoStack(cmd);
                }
            }
        }*/
    }
}; // State class
