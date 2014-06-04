/** 
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
 * @param {Object} app The associated application.
 */
dwv.tool.UndoStack = function(app)
{ 
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
        dwv.gui.addCommandToUndoHtml(cmd.getName());
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
            // decrement index
            --curCmdIndex; 
            // reset image
            app.restoreOriginalImage();
            
            stack[curCmdIndex].undo();
            
            // redo from first command
            //for( var i = 0; i < curCmdIndex; ++i)
            //{
            //    stack[i].execute(); 
            //}
            // display
            if( curCmdIndex === 0 ) {
                // just draw the image
                app.generateAndDrawImage();
            }
            // disable last in display history
            dwv.gui.enableInUndoHtml(false);
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
            // run command
            var cmd = stack[curCmdIndex];
            cmd.execute();
            // increment index
            ++curCmdIndex;
            // enable next in display history
            dwv.gui.enableInUndoHtml(true);
        }
    };

}; // UndoStack class
