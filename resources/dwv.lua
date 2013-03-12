--
-- DICOM Web Viewer (DWV) lua script for integration in a Conquest PACS server. 
--
-- Usage
-- In the dicom.ini of your web server, create the dwv viewer:
-- >> [dwv]
-- >> source = viewers\dwv.lua
-- And set it as the default viewer:
-- >> [webdefaults]
-- >> ...
-- >> viewer = dwv
-- This script relies on the 'kFactorFile', 'ACRNemaMap' and 'Dictionary' 
-- variables being set correctly.
-- Then copy the 'css', 'src' and 'ext' folders of DWV in a 'dwv' folder
-- in the web folder of your web server.

-- Get ids

local patientid = string.gsub(series2, ':.*$', '')
local seriesuid = string.gsub(series2, '^.*:', '')

-- Functions declaration

function getstudyuid()
  local a, b, s
  s = servercommand('get_param:MyACRNema')
  b = newdicomobject()
  b.PatientID = patientid
  b.SeriesInstanceUID = seriesuid
  b.StudyInstanceUID = ''
  a = dicomquery(s, 'SERIES', b)
  return a[0].StudyInstanceUID
end

function queryimages()
  local images, imaget, b, s
  s = servercommand('get_param:MyACRNema')
  b = newdicomobject()
  b.PatientID = patientid
  b.SeriesInstanceUID = seriesuid
  b.SOPInstanceUID = ''
  images = dicomquery(s, 'IMAGE', b)

  imaget={}
  for k=0,#images-1 do
    imaget[k+1]={}
    imaget[k+1].SOPInstanceUID = images[k].SOPInstanceUID
  end
  table.sort(imaget, function(a,b) return a.SOPInstanceUID < b.SOPInstanceUID end)

  return imaget
end

-- Main

local studyuid = getstudyuid()
local images = queryimages()

local url = webscriptadress
url = url .. '?requestType=WADO&contentType=application/dicom'
url = url .. '&seriesUID=' .. seriesuid
url = url .. '&studyUID=' .. studyuid
url = url .. '&objectUID=' .. images[1].SOPInstanceUID
  
-- Generate html

HTML('Content-type: text/html\n\n')
--print([[<!DOCTYPE html>]])
print([[<html>]])

print([[<head>]])

print([[<title>DICOM Web Viewer</title>
<meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">
<link rel="stylesheet" href="/dwv/css/style.css">
<style>
body { font-size: 80%; }
#toolbox li:first-child { list-style-type: none; padding-bottom: 10px; margin-left: -20px; }
</style>
<link rel="stylesheet" href="/dwv/ext/jquery/ui/1.10.1/themes/ui-darkness/jquery-ui.min.css">]])

print([[<!-- Third party -->  
<script type="text/javascript" src="/dwv/ext/jquery/jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="/dwv/ext/jquery/ui/1.10.1/jquery-ui.min.js"></script>
<script type="text/javascript" src="/dwv/ext/flot/jquery.flot.min.js"></script>]])

print([[<!-- Local -->
<script type="text/javascript" src="/dwv/src/dwv.js"></script>
<script type="text/javascript" src="/dwv/src/application.js"></script>
<script type="text/javascript" src="/dwv/src/dicom/dicomParser.js"></script>
<script type="text/javascript" src="/dwv/src/dicom/dictionary.js"></script>
<script type="text/javascript" src="/dwv/src/html/gui.js"></script>
<script type="text/javascript" src="/dwv/src/html/gui_ui.js"></script>
<script type="text/javascript" src="/dwv/src/html/html.js"></script>
<script type="text/javascript" src="/dwv/src/html/style.js"></script>
<script type="text/javascript" src="/dwv/src/html/layer.js"></script>
<script type="text/javascript" src="/dwv/src/image/filter.js"></script>
<script type="text/javascript" src="/dwv/src/image/image.js"></script>
<script type="text/javascript" src="/dwv/src/image/lookupTable.js"></script>
<script type="text/javascript" src="/dwv/src/image/luts.js"></script>
<script type="text/javascript" src="/dwv/src/math/shapes.js"></script>
<script type="text/javascript" src="/dwv/src/math/bucketQueue.js"></script>
<script type="text/javascript" src="/dwv/src/math/scissors.js"></script>
<script type="text/javascript" src="/dwv/src/utils/string.js"></script>]])

print([[<!-- Tools: beware order is important... -->
<script type="text/javascript" src="/dwv/src/tools/toolbox.js"></script>
<script type="text/javascript" src="/dwv/src/tools/windowLevel.js"></script>
<script type="text/javascript" src="/dwv/src/tools/draw.js"></script>
<script type="text/javascript" src="/dwv/src/tools/line.js"></script>
<script type="text/javascript" src="/dwv/src/tools/rectangle.js"></script>
<script type="text/javascript" src="/dwv/src/tools/roi.js"></script>
<script type="text/javascript" src="/dwv/src/tools/circle.js"></script>
<script type="text/javascript" src="/dwv/src/tools/livewire.js"></script>
<script type="text/javascript" src="/dwv/src/tools/zoom.js"></script>
<script type="text/javascript" src="/dwv/src/tools/filter.js"></script>
<script type="text/javascript" src="/dwv/src/tools/undo.js"></script>]])

print([[<script type="text/javascript">
function toggle(dialogName)
{
    if( $(dialogName).dialog('isOpen') )
    {
        $(dialogName).dialog('close');
    }
    else
    {
        $(dialogName).dialog('open');
    }
}
function getUriParam(name)
{
    var val = 0;
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)")
    var results = regex.exec(window.location.href);
    if( results && results[1] ) val = results[1];
    return val;
}
function load()
{
  app.loadDicomURL(']]..webscriptadress..[[?requestType=WADO&contentType=application/dicom'+
    '&studyUID=]]..studyuid..[[' +
    '&seriesUID=]]..seriesuid..[[' +
    '&objectUID=' + document.forms[0].slice.value);
}
function nextslice()
{ 
  if (document.forms[0].slice.selectedIndex == document.forms[0].slice.length-1) 
    document.forms[0].slice.selectedIndex = 0; 
  else 
    document.forms[0].slice.selectedIndex = document.forms[0].slice.selectedIndex + 1;
  load();
}]])

print([[// main application
var app = new dwv.App();
// jquery
$(document).ready(function(){
    // create buttons and dialogs
    $("button").button();
    $("#openData").dialog({ position: [10, 110] });
    $("#toolbox").dialog({ position: [10, 310] });
    $("#history").dialog({ position: [10, 500], autoOpen: false });
    $("#tags").dialog({ position: ['right', 110], autoOpen: false, 
        height: 400, width: 400 });
    $("#layerContainer").dialog({ position: [340, 110], 
        width: [570], height: [590] });
    // initialise the application
    app.init();
    // possible load from URL
    app.loadDicomURL("]].. url ..[[");
});
</script>]])

print([[</head>]])

print([[<body>]])

print([[<!-- Title -->
<h1>DICOM Web Viewer (<a href="https://github.com/ivmartel/dwv">dwv</a> v0.3b)</h1>

<!-- Buttons -->
<button onclick="toggle('#openData')">File</button>
<button onclick="toggle('#toolbox')">Toolbox</button>
<button onclick="toggle('#history')">History</button>
<button onclick="toggle('#tags')">Tags</button>
<button onclick="toggle('#layerContainer')">Image</button>]])

print([[<!-- Open file -->
<div id="openData" title="File">
<p><form>
Path: <input type="file" id="dicomfiles" multiple />
URL: <input type="url" id="dicomurl" />
<br>Slice: <select name=slice onchange=load()>]])

for i=1, #images do
  print('  <option value='..images[i].SOPInstanceUID..'>'..i..'</option>')
end

print([[</select>
  <input type=button value='>' onclick=nextslice() />
</form>]])

print([[</p>
<div id="progressbar"></div>
</div>]])

print([[<!-- Toolbox -->
<div id="toolbox" title="Toolbox">
<ul id="toolList"></ul>
</div>

<!-- History -->
<div id="history" title="History"></div>

<!-- Tags -->
<div id="tags" title="Tags" style="display:none;"></div>]])

print([[<!-- Layer Container -->
<div id="layerContainer" title="Image">
<canvas id="imageLayer" width="512" height="512"></canvas>
<canvas id="drawLayer" width="512" height="512"></canvas>
<canvas id="infoLayer" width="512" height="512"></canvas>
<canvas id="tempLayer" width="512" height="512"></canvas>
<div id="plot" style="width:100px;height:70px"></div>
</div>]])

print([[</body>]])
print([[</html>]])
