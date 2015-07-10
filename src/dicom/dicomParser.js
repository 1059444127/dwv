/** 
 * DICOM module.
 * @module dicom
 */
var dwv = dwv || {};
dwv.dicom = dwv.dicom || {};

var JpxImage = JpxImage || {};

/**
 * Clean string: trim and remove ending.
 * @method cleanString
 * @static
 * @param {String} string The string to clean.
 * @return {String} The cleaned string.
 */
dwv.dicom.cleanString = function (string)
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
 * Is the Native endianness Little Endian.
 * @property isNativeLittleEndian
 * @type Boolean
 */
dwv.dicom.isNativeLittleEndian = function ()
{
    return new Int8Array(new Int16Array([1]).buffer)[0] > 0;
};

/**
 * Data reader.
 * @class DataReader
 * @namespace dwv.dicom
 * @constructor
 * @param {Array} buffer The input array buffer.
 * @param {Boolean} isLittleEndian Flag to tell if the data is little or big endian.
 */
dwv.dicom.DataReader = function (buffer, isLittleEndian)
{
    // Set endian flag if not defined.
    if ( typeof isLittleEndian === 'undefined' ) {
        isLittleEndian = true;
    }
    
    /**
     * Is the Native endianness Little Endian.
     * @property isNativeLittleEndian
     * @private
     * @type Boolean
     */
    var isNativeLittleEndian = dwv.dicom.isNativeLittleEndian();

    /**
     * Flag to know if the TypedArray data needs flipping.
     * @property needFlip
     * @private
     * @type Boolean
     */
    var needFlip = (isLittleEndian !== isNativeLittleEndian);
    
    /**
     * The main data view.
     * @property view
     * @private
     * @type DataView
     */
    var view = new DataView(buffer);
    
    /**
     * Flip an array's endianness.
     * Inspired from https://github.com/kig/DataStream.js.
     * @method flipArrayEndianness
     * @param {Object} array The array to flip (modified).
     */
    this.flipArrayEndianness = function (array) {
       var blen = array.byteLength;
       var u8 = new Uint8Array(array.buffer, array.byteOffset, blen);
       var bpel = array.BYTES_PER_ELEMENT;
       var tmp;
       for ( var i = 0; i < blen; i += bpel ) {
         for ( var j = i + bpel - 1, k = i; j > k; j--, k++ ) {
           tmp = u8[k];
           u8[k] = u8[j];
           u8[j] = tmp;
         }
       }
    };
      
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
     * Read Uint8 array.
     * @method readUint8Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint8Array = function(byteOffset, size) {
        return new Uint8Array(buffer, byteOffset, size);
    };
    /**
     * Read Uint16 array.
     * @method readUint16Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint16Array = function(byteOffset, size) {
        var data = new Uint16Array(buffer, byteOffset, (size / 2));
        if ( needFlip ) {
            this.flipArrayEndianness(data);
        }
        return data;
    };
    /**
     * Read Uint32 array.
     * @method readUint32Array
     * @param {Number} byteOffset The offset to start reading from.
     * @param {Number} size The size of the array.
     * @return {Array} The read data.
     */
    this.readUint32Array = function(byteOffset, size) {
        var arraySize = size / 4;
        var data = null;
        if ( (byteOffset % 4) === 0 ) {
            data = new Uint32Array(buffer, byteOffset, arraySize);
            if ( needFlip ) {
                this.flipArrayEndianness(data);
            }
        }
        else {
            data = new Uint32Array(arraySize);
            for ( var i = 0; i < arraySize; ++i ) {
                data[i] = this.readUint32( byteOffset + 4*i );
            }
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
        var data = this.readUint8Array(byteOffset, nChars);
        for ( var i = 0; i < nChars; ++i ) {
            result += String.fromCharCode( data[ i ] );
        }
        return result;
    };
};

/**
 * Get the group-element key used to store DICOM elements.
 * @param {Number} group The DICOM group.
 * @param {Number} element The DICOM element.
 * @returns {String} The key.
 */
dwv.dicom.getGroupElementKey = function (group, element)
{
    return 'x' + group.substr(2,6) + element.substr(2,6);
};

/**
 * Split a group-element key used to store DICOM elements.
 * @param key The key in form "x00280102.
 * @returns {Object} The DICOM group and element.
 */
dwv.dicom.splitGroupElementKey = function (key)
{
    return {'group': key.substr(1,4), 'element': key.substr(5,8) };
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
 * Get the transfer syntax name.
 * @method getTransferSyntaxName
 * @param {String} The transfer syntax.
 * @returns {String} The name of the transfer syntax.
 */
dwv.dicom.getTransferSyntaxName = function (syntax)
{
    var name = "unknown";
    // Implicit VR - Little Endian
    if( syntax === "1.2.840.10008.1.2" ) {
        name = "Little Endian Implicit";
    }
    // Explicit VR - Little Endian
    else if( syntax === "1.2.840.10008.1.2.1" ) {
        name = "Little Endian Explicit";
    }
    // Deflated Explicit VR - Little Endian
    else if( syntax === "1.2.840.10008.1.2.1.99" ) {
        name = "Little Endian Deflated Explicit";
    }
    // Explicit VR - Big Endian
    else if( syntax === "1.2.840.10008.1.2.2" ) {
        name = "Big Endian Explicit";
    }
    // JPEG
    else if( dwv.dicom.isJpegTransferSyntax(syntax) ) {
        name = "JPEG";
    }
    // JPEG-LS
    else if( dwv.dicom.isJpeglsTransferSyntax(syntax) ) {
        name = "JPEG-LS";
    }
    // JPEG 2000
    else if( dwv.dicom.isJpeg2000TransferSyntax(syntax) ) {
        name = "JPEG 2000 (Lossless or Lossy)";
    }
    // MPEG2 Image Compression
    else if( syntax === "1.2.840.10008.1.2.4.100" ) {
        name = "MPEG2";
    }
    // RLE (lossless)
    else if( syntax === "1.2.840.10008.1.2.5" ) {
        name = "RLE";
    }
    // return
    return name;
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
     * The pixel buffer.
     * @property pixelBuffer
     * @type Array
     */
    this.pixelBuffer = [];
    
    /**
     * Unknown tags count.
     * @property unknownCount
     * @type Number
     */
    var unknownCount = 0;
    /**
     * Get the next unknown tags count.
     * @method getNextUnknownCount
     * @returns {Number} The next count.
     */
    this.getNextUnknownCount = function () {
        unknownCount++;    
        return unknownCount;
    }; 
};

/**
 * Get the DICOM data elements.
 * @method getDicomElements
 * @returns {Object} The DICOM elements.
 */
dwv.dicom.DicomParser.prototype.getDicomElements = function()
{
    return new dwv.dicom.DicomElementsWrapper(this.dicomElements);
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
 * If tags have same name (for the 'unknown' private tags cases), a number is appended
 * making the name unique.
 * @method appendDicomElement
 * @param {Object} element The element to add.
 * @param {Object} sequences The sequence the element belongs to (optional).
 */
dwv.dicom.DicomParser.prototype.appendDicomElement = function( element, sequences )
{
    // simple case: not a sequence
    if ( typeof sequences === "undefined" || sequences.length === 0) {
        this.dicomElements[element.tag.name] = { 
            "group": element.tag.group, 
            "element": element.tag.element,
            "vr": element.vr,
            "vl": element.vl,
            "value": element.data 
        };
    }
    else {
        // nothing to do for items and delimitations
        // (Item, ItemDelimitationItem, SequenceDelimitationItem)
        if ( element.tag.name === "xFFFEE000" ||
                element.tag.name === "xFFFEE00D" ||
                element.tag.name === "xFFFEE0DD" ) {
            return;
        }
        // create root for nested sequences
        var sequenceName = sequences[0].name;
        var itemNumber = sequences[0].itemNumber;
        var root = this.dicomElements;
        for ( var i = 1; i < sequences.length; ++i ) {
            // update root with previous name and number
            if ( typeof root[sequenceName].value[itemNumber] !== "undefined" ) {
                root = root[sequenceName].value[itemNumber];
            }
            // update name and number
            sequenceName = sequences[i].name;
            itemNumber = sequences[i].itemNumber;
        }
        // append
        this.appendElementToSequence(root, sequenceName, itemNumber, element);
    }
};

/**
 * Append an element to a sequence.
 * @method appendElementToSequence
 * @param {Object} root The DICOM element root where to append the element.
 * @param {String} sequenceName The tail sequence name.
 * @param {Number} itemNumber The tail item number.
 * @param {Object} element The element to append.
 */
dwv.dicom.DicomParser.prototype.appendElementToSequence = function (
    root, sequenceName, itemNumber, element)
{
    // start the sequence
    if ( typeof root[sequenceName] === "undefined" ) {
        root[sequenceName] = {
            "group": element.tag.group,
            "element": element.tag.element,
            "vr": element.vr,
            "vl": element.vl,
            "value": []
        };
    }
    // continue the sequence
    else {
        // add item array if needed
        if ( typeof root[sequenceName].value[itemNumber] === "undefined" ) {
            root[sequenceName].value[itemNumber] = {};
        }
        // append element
        root[sequenceName].value[itemNumber][element.tag.name] = {
            "group": element.tag.group,
            "element": element.tag.element,
            "vr": element.vr,
            "vl": element.vl,
            "value": element.data
        };
    }
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
    var name = dwv.dicom.getGroupElementKey(group, element);
    /*var dict = dwv.dicom.dictionary;
    if( typeof dict[group] !== "undefined" &&
            typeof dict[group][element] !== "undefined" ) {
        vr = dict[group][element][0];
        name = dict[group][element][2];
    }
    else {
        name = "dwv::unknown" + this.getNextUnknownCount().toString();
    }*/

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
    
    var vr = null; // Value Representation (VR)
    var vl = 0; // Value Length (VL)
    var vrOffset = 0; // byte size of VR
    var vlOffset = 0; // byte size of VL
    
    var isOtherVR = false; // OX, OW, OB and OF
    
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
            var dict = dwv.dicom.dictionary;
            if ( typeof dict[tag.group] !== "undefined" &&
                    typeof dict[tag.group][tag.element] !== "undefined" ) {
                vr = dwv.dicom.dictionary[tag.group][tag.element][0];
            }
            isOtherVR = (vr[0] === 'O');
            vrOffset = 0;
            vl = reader.readUint32( offset+tagOffset+vrOffset );
            vlOffset = 4;
        }
        else {
            vr = reader.readString( offset+tagOffset, 2 );
            isOtherVR = (vr[0] === 'O');
            vrOffset = 2;
            // long representations
            if ( isOtherVR || vr === "SQ" || vr === "UN" ) {
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
    
    var isUnsignedVR = ( vr === "US" || vr === "UL" );
    
    // check the value of VL
    var vlString = vl;
    if( vl === 0xffffffff ) {
        vlString = "u/l";
        vl = 0;
    }
    
    // data
    var data = null;
    var dataOffset = offset+tagOffset+vrOffset+vlOffset;
    if( vr === "N/A")
    {
        data = reader.readUint8Array( dataOffset, vl );
    }
    else if ( isUnsignedVR ) 
    {
        if( vr === "US")
        {
            data = reader.readUint16Array( dataOffset, vl );
        }
        else // UL
        {
            data = reader.readUint32Array( dataOffset, vl );
        }
    }
    else if( isOtherVR )
    {
        if ( vr === "OX" ) {
            console.warn("OX value representation for tag: "+tag.name+".");
        }
        // OB or BitsAllocated == 8
        if ( vr === "OB" || 
                ( typeof this.dicomElements.x00280100 !== 'undefined' &&
                    this.dicomElements.x00280100.value[0] === 8 ) ) {
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
        'vl': vlString, 
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
    
    // 0x0002, 0x0000: FileMetaInformationGroupLength
    var dataElement = this.readDataElement(metaReader, offset);
    // store the data element
    this.appendDicomElement( dataElement );
    // get meta length
    var metaLength = parseInt(dataElement.data[0], 10);
    offset += dataElement.offset;
    
    // meta elements
    var metaStart = offset;
    var metaEnd = metaStart + metaLength;
    var i = metaStart;
    while( i < metaEnd ) 
    {
        // get the data element
        dataElement = this.readDataElement(metaReader, i, false);
        // store the data element
        this.appendDicomElement( dataElement );
        // increment index
        i += dataElement.offset;
    }
    
    // check the TransferSyntaxUID (has to be there!)
    var syntax = dwv.dicom.cleanString(this.dicomElements.x00020010.value[0]);
    
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

    var startedPixelItems = false;
    var tagName = "";
    var tagOffset = 0;
    var sequences = [];

    // DICOM data elements
    while( i < buffer.byteLength ) 
    {
        // get the data element
        dataElement = this.readDataElement(dataReader, i, implicit);
        
        // locals
        tagName = dataElement.tag.name;
        tagOffset = dataElement.offset;
        var vlNumber = (dataElement.vl === "u/l") ? 0 : dataElement.vl;
        
        // new sequence
        if ( dataElement.vr === "SQ" && dataElement.vl !== 0 ) {
            sequences.push( {
                'name': tagName, 'itemNumber': -1,
                'vl': dataElement.vl, 'vlCount': 0
            });
            tagOffset -= vlNumber;
        }
        // new Item
        if ( sequences.length !== 0 && tagName === "xFFFEE000" ) {
            sequences[sequences.length-1].itemNumber += 1;
            if ( !startedPixelItems ) {
                tagOffset -= vlNumber;
            }
        }
        // end of sequence with implicit length (SequenceDelimitationItem)
        else if ( tagName === "xFFFEE0DD" ) {
            sequences = sequences.slice(0, -1);
        }
        
        // store pixel data from multiple Items
        if( startedPixelItems ) {
            // Item
            if( tagName === "xFFFEE000" ) {
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
            // SequenceDelimitationItem
            else if( tagName === "xFFFEE0DD" ) {
                startedPixelItems = false;
            }
            else {
                throw new Error("Unexpected tag in encapsulated pixel data: "+dataElement.tag.name);
            }
        }
        // check the PixelData tag
        if( tagName === "x7FE00010") {
            if( dataElement.data.length !== 0 ) {
                this.pixelBuffer = dataElement.data;
            }
            else {
                startedPixelItems = true;
            }
        }
        
        // store the data element
        this.appendDicomElement( dataElement, sequences );
        
        // end of sequence with explicit length
        if ( dataElement.vr !== "SQ" && sequences.length !== 0 ) {
            var last = sequences.length - 1;
            sequences[last].vlCount += tagOffset;
            if ( sequences[last].vlCount === sequences[last].vl ) {
                sequences = sequences.slice(0, -1);
            }
        }
        
        // increment index
        i += tagOffset;
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
        // decompress pixel buffer into Int16 image
        var jpxImage = new JpxImage();
        jpxImage.parse( this.pixelBuffer );
        // set the pixel buffer
        this.pixelBuffer = jpxImage.tiles[0].items;
    }
};

/**
 * DicomElements wrapper.
 * @class DicomElementsWrapper
 * @namespace dwv.dicom
 * @constructor
 * @param {Array} dicomElements The elements to wrap.
 */
dwv.dicom.DicomElementsWrapper = function (dicomElements) {

    /**
    * Get a DICOM Element value from a group/element key.
    * @method getFromKey
    * @param {String} groupElementKey The key to retrieve.
    * @param {Boolean} asArray Get the value as an Array.
    * @return {Object} The DICOM element value.
    */
    this.getFromKey = function ( groupElementKey, asArray ) {
        // default
        if ( typeof asArray === "undefined" ) {
            asArray = false;
        }
        var value = null;
        var dElement = dicomElements[groupElementKey];
        if ( typeof dElement !== "undefined" ) {
            // raw value if only one
            if ( dElement.value.length === 1 && asArray === false) {
                value = dElement.value[0];
            }
            else {
                value = dElement.value;
            }
        }
        return value;
    };
    
    /**
     * Dump the DICOM tags to an array.
     * @returns {Array}
     */
    this.dumpToTable = function () {
        var keys = Object.keys(dicomElements);
        var dict = dwv.dicom.dictionary;
        var table = [];
        var dicomElement = null;
        var dictElement = null;
        var row = null;
        for ( var i = 0 ; i < keys.length; ++i ) {
            dicomElement = dicomElements[keys[i]];
            row = {};
            // trying to have name first in row
            dictElement = null;
            if ( typeof dict[dicomElement.group] !== "undefined" && 
                    typeof dict[dicomElement.group][dicomElement.element] !== "undefined") {
                dictElement = dict[dicomElement.group][dicomElement.element];
            }
            if ( dictElement !== null ) {
                row.name = dictElement[2];
            }
            else {
                row.name = "Unknown Tag & Data";
            }
            var deKeys = Object.keys(dicomElement);
            for ( var j = 0 ; j < deKeys.length; ++j ) {
                row[deKeys[j]] = dicomElement[deKeys[j]];
            }
            table.push( row );
        }
        return table;
    };

    /**
     * Dump the DICOM tags to a string.
     * @returns {String} The dumped file.
     */
    this.dump = function () {
        var keys = Object.keys(dicomElements);
        var result = "\n";
        result += "# Dicom-File-Format\n";
        result += "\n";
        result += "# Dicom-Meta-Information-Header\n";
        result += "# Used TransferSyntax: ";
        if ( dwv.dicom.isNativeLittleEndian() ) {
            result += "Little Endian Explicit\n";
        }
        else {
            result += "NOT Little Endian Explicit\n";
        }
        var dicomElement = null;
        var checkHeader = true;
        for ( var i = 0 ; i < keys.length; ++i ) {
            dicomElement = dicomElements[keys[i]];
            if ( checkHeader && dicomElement.group !== "0x0002" ) {
                result += "\n";
                result += "# Dicom-Data-Set\n";
                result += "# Used TransferSyntax: ";
                var syntax = dwv.dicom.cleanString(dicomElements.x00020010.value[0]);
                result += dwv.dicom.getTransferSyntaxName(syntax);
                result += "\n";
                checkHeader = false;
            }
            result += this.getElementAsString(dicomElement) + "\n";
        }
        return result;
    };

};

/**
 * 
 * @param group
 * @param element
 * @returns
 */
dwv.dicom.DicomElementsWrapper.prototype.getElementAsString = function ( dicomElement, prefix )
{
    // default prefix
    prefix = prefix || "";
    
    // get element from dictionary
    var dict = dwv.dicom.dictionary;
    var dictElement = null;
    if ( typeof dict[dicomElement.group] !== "undefined" && 
            typeof dict[dicomElement.group][dicomElement.element] !== "undefined") {
        dictElement = dict[dicomElement.group][dicomElement.element];
    }
    
    var deSize = dicomElement.value.length;

    var line = null;
    
    // (group,element)
    line = "(";
    line += dicomElement.group.substr(2,5).toLowerCase();
    line += ",";
    line += dicomElement.element.substr(2,5).toLowerCase();
    line += ") ";
    // value representation
    line += dicomElement.vr;
    // value
    if ( dicomElement.value.length === 1 && dicomElement.value[0] === "" ) {
        line += " (no value available)";
        deSize = 0;
    }
    else {
        // simple number display
        if ( dicomElement.vr === "UL" || 
                dicomElement.vr === "US" ||
                dicomElement.vr === "na" ) {
            line += " ";
            line += dicomElement.value[0];
        }
        // 'O'ther array, limited display length
        else if ( dicomElement.vr[0] === 'O' ) {
            line += " ";
            var valuesStr = "";
            var valueStr = "";
            for ( var k = 0; k < dicomElement.value.length; ++k ) {
                valueStr = "";
                if ( k !== 0 ) {
                    valueStr += "\\";
                }
                valueStr += dicomElement.value[k];
                if ( valuesStr.length + valueStr.length <= 65 ) {
                    valuesStr += valueStr;
                }
                else {
                    valuesStr += "...";
                    break;
                }
            }
            line += valuesStr;
        }
        else if ( dicomElement.vr === 'SQ' ) {
            line += " (Sequence with undefined length #=";
    		line += dicomElement.value.length;
    		line += ")";
        }
        // default
        else {
            line += " [";
            for ( var j = 0; j < dicomElement.value.length; ++j ) {
                if ( j !== 0 ) {
                    line += "\\";
                }
                if ( typeof dicomElement.value[j] === "string" ) {
                    line += dwv.dicom.cleanString(dicomElement.value[j]);
                }
                else {
                    line += dicomElement.value[j];
                }
            }
            line += "]";
        }
    }
    
    // align #
    var nSpaces = 55 - line.length;
    if ( nSpaces > 0 ) {
        for ( var s = 0; s < nSpaces; ++s ) {
            line += " ";
        }
    }
    line += " # ";
    if ( dicomElement.vl < 100 ) {
        line += " ";
    }
    if ( dicomElement.vl < 10 ) {
        line += " ";
    }
    line += dicomElement.vl;
    line += ", ";
    line += deSize; //dictElement[1];
    line += " ";
    if ( dictElement !== null ) {
        line += dictElement[2];
    }
    else {
        line += "Unknown Tag & Data";
    }
    
    // continue for sequence
    if ( dicomElement.vr === 'SQ' ) {
        var item = null;
        for ( var l = 0; l < dicomElement.value.length; ++l ) {
            item = dicomElement.value[l];
            var itemKeys = Object.keys(item);
            var itemElement = {
                "group": "0xFFFE",
                "element": "0xE000",
                "vr": "na", 
                "vl": "u/l", 
                "value": ["(Item with undefined length #="+itemKeys.length+")"],
            };
            
            line += "\n";
            line += this.getElementAsString(itemElement, "  ");
            
            for ( var m = 0; m < itemKeys.length; ++m ) {
                line += "\n";
                line += this.getElementAsString(item[itemKeys[m]], "    ");
            }

            var itemDelimElement = {
                "group": "0xFFFE",
                "element": "0xE00D",
                "vr": "na", 
                "vl": "0", 
                "value": ["(ItemDelimitationItem)"],
            };
            line += "\n";
            line += this.getElementAsString(itemDelimElement, "  ");
        }
    }

    return prefix + line;
};

/**
* Get a DICOM Element value from a group and an element.
* @method getFromGroupElement
* @param {Number} group The group.
* @param {Number} element The element.
* @return {Object} The DICOM element value.
*/
dwv.dicom.DicomElementsWrapper.prototype.getFromGroupElement = function ( 
    group, element )
{
   return this.getFromKey(
       dwv.dicom.getGroupElementKey(group, element) );
};

/**
* Get a DICOM Element value from a tag name.
* Uses the DICOM dictionary.
* @method getFromName
* @param {String} name The tag name.
* @return {Object} The DICOM element value.
*/
dwv.dicom.DicomElementsWrapper.prototype.getFromName = function ( name )
{
   var group = null;
   var element = null;
   var dict = dwv.dicom.dictionary;
   var keys0 = Object.keys(dict);
   var keys1 = null;
   var k0 = 0;
   var k1 = 0;
   // label for nested loop break
   outLabel:
   // search through dictionary 
   for ( k0 = 0; k0 < keys0.length; ++k0 ) {
       group = keys0[k0];
       keys1 = Object.keys( dict[group] );
       for ( k1 = 0; k1 < keys1.length; ++k1 ) {
           element = keys1[k1];
           if ( dict[group][element][2] === name ) {
               break outLabel;
           }
       }
   }
   var dicomElement = null;
   // check that we are not at the end of the dictionary
   if ( k0 !== keys0.length && k1 !== keys1.length ) {
       dicomElement = this.getFromKey(dwv.dicom.getGroupElementKey(group, element));
   }
   return dicomElement;
};

