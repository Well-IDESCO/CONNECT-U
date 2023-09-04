// ------------------------------- MENU  ------------------------------- //

// menu upper left corner
$(document).ready(function() {
  var Menu = {
      body: $('.menu'),
      button: $('.button'),
      tools: $('.tools')
  };
  Menu.button.click(function () {
      Menu.body.toggleClass('menu--closed');
      Menu.body.toggleClass('menu--open');
      Menu.tools.toggleClass('tools--visible');
      Menu.tools.toggleClass('tools--hidden');
  });
});

// hide menu clicking in eye
function Changestate2block(el) {
  var display = document.getElementById(el).style.display;
  if(display == "none")
      document.getElementById(el).style.display = 'block';
  else
      document.getElementById(el).style.display = 'none';
}
function Changestate2flex(el) {
  var display = document.getElementById(el).style.display;
  if(display == "none")
      document.getElementById(el).style.display = 'flex';
  else
      document.getElementById(el).style.display = 'none';
}

// hide menu pressing the ESC key
document.onkeydown = function(e) {
  if(e.key === 'Escape') {
    Changestate2block('interfacebuttons')
    Changestate2flex('buttonsmenuhidden')
  }
}
function hide(){
  Changestate2block('interfacebuttons')
  Changestate2flex('buttonsmenuhidden')
}

// EFFECTS MENU
function toggleFAB(fab){
	if(document.querySelector(fab).classList.contains('show')){
  	document.querySelector(fab).classList.remove('show');
  }else{
  	document.querySelector(fab).classList.add('show');
  }
}

document.querySelector('.fab .main').addEventListener('click', function(){
	toggleFAB('.fab');
});

document.querySelectorAll('.fab ul li button').forEach((item)=>{
	item.addEventListener('click', function(){
		toggleFAB('.fab');
	});
});

//EFFECTS BUTTONS

//POLYGON
$('#circular').click(function(){
  s.stopForceAtlas2();
  sigma.plugins.animate(s, {x: 'circular_x', y: 'circular_y', size: 'circular_size', color: 'circular_color'});
});

//GRID
$('#grid').click(function(){
  s.stopForceAtlas2();
  sigma.plugins.animate(s,{x: 'grid_x', y: 'grid_y', size: 'grid_size', color: 'grid_color'});
});

//ON/OFF ForceAtlas
function onoff(){
  currentvalue = document.getElementById('onoff').value;
  if(currentvalue == "Fluir"){
    document.getElementById("onoff").value="Parar";
    s.startForceAtlas2();
  }
  else{
    document.getElementById("onoff").value="Fluir";
    s.stopForceAtlas2();
  }
}

// ------------------------------- GRAPH ------------------------------- //
var i, 
s, 
o, 
csv_header, 
unique_category_counts, 
step = 0, 
arbitraryCsvFile="tables/amigos.csv";

Cols = 9;
Lines = 40;
FlagDrawLines = true;

function createGraph(g){
  if (typeof s != "undefined"){
    s.graph.clear();
    s.refresh()
  }
  s = new sigma({
    graph: g,
    container: 'graph-container',
    type: 'webgl',
    settings:{
      labelThreshold:7,
      animationsTime: 4000,
      skipErrors: true,
      //edgeColor:"rgb(255,0,0)", -- standardize the color of the lines --
      drawEdges: FlagDrawLines,
      minNodeSize:0,
      maxNodeSize:0,
      //autoSettings: true,
      //linLogMode: false,
      //outboundAttractionDistribution: false,
      //adjustSizes: true,
      //edgeWeightInfluence: .1,
      //scalingRatio: 1,
      //strongGravityMode: false,
      //gravity: 10,
      //jitterTolerance: 2,
      //barnesHutOptimize: true,
      //barnesHutTheta: 1.2,
      //speed: 10,
      //outboundAttCompensation: 1,
      //totalSwinging: 0,
      //totalEffectiveTraction: 0,
      //complexIntervals: 500,
      //simpleIntervals: 1000,
      //batchEdgesDrawing:true,
      //webglEdgesBatchSize:1000
    }
  });
  s.startForceAtlas2();
}

// generates the color map
function generateColorMap(list){
  var cmap = {};
  var len = list.length;
  for(var i=0;i<len;i++){
    cmap[list[i]] = "#"+(Math.floor(5000000+i*(10777215/len)).toString(16)+ '000000').substr(0,6);
  }
  return cmap;
}

// generates the graph body
function csv2graph(body){
  var rows = body.split(/\r\n|\n/);
  var num_rows = rows.length;
  var vtx_cache={};
  var row,cells;
  num_rows = Lines;
  var num_columns = Cols;
  var byrow = rows.slice(0,num_rows);
  csv_header = byrow.shift();
  csv_header = csv_header.split(/\,/).slice(0,num_columns);
  var columnColorMap = generateColorMap(csv_header);
  var length = csv_header.length;
  var vtx_id = 0;
  var edge_id = 0;
  var g = {nodes: [], edges: []}

  // for each line
  for(var a in byrow){
    cells = byrow[a].split(/\,/).slice(0,num_columns);

    // for each cell
    for(var i in cells){
      cell_name_a = csv_header[i]+"?"+cells[i];

      // is the vertex unique?
      if(typeof vtx_cache[cell_name_a] === "undefined"){
          o = generateVertex(cell_name_a, ++vtx_id, num_rows, columnColorMap, i,a,body);
          vtx_cache[cell_name_a] = i;

          // apply the basics atributes
          g.nodes.push(o);
      }
      // choose 2 cells in a line and draw an edge
      for(var j=length-1; j > i; j--){ 
        g.edges.push({id: 'e'+edge_id++, source: cell_name_a, target: csv_header[j]+"?"+cells[j]});
      }   
    }
  }
  return g;
}

//get the number of repeated cells
function getNumCellsRepeated(body){
  var rows = body.split(/\r\n|\n/);
  var num_rows = rows.length;
  var vtx_cache={};
  var cells;
  num_rows = Lines;
  var num_columns = Cols;
  var byrow = rows.slice(0,num_rows);
  var csv_header = byrow.shift();
  var csv_header = csv_header.split(/\,/).slice(0,num_columns);
  CellsRepeated = 0;

  // for each line
  for(var a in byrow){
    cells = byrow[a].split(/\,/).slice(0,num_columns);

    // for each cell
    for(var i in cells){
      var  cell_name_a = csv_header[i]+"?"+cells[i];

      // is the vertex unique?
      if(typeof vtx_cache[cell_name_a] === "undefined"){
        CellsRepeated++;

        vtx_cache[cell_name_a] = i;
      }
    }
  }
  return CellsRepeated;
}

//generate vertex
function generateVertex(name,i,n,columnColorMap,cell_idx,row_idx,body){
  NumCellsRepeated = getNumCellsRepeated(body);

  //cut the name for the label
  CellNameCutted = name.substring(name.indexOf("?") + 1);
  return {
    id:  name,
    label: CellNameCutted,

    //polygon effect settings
    circular_x: 32 * Math.cos(2*Math.PI*i / NumCellsRepeated - Math.PI / 2),
    circular_y: 32 * Math.sin(2*Math.PI*i / NumCellsRepeated - Math.PI / 2),
    circular_size: 9,
    circular_color: columnColorMap[name.split("?")[0]],

    x: i,
    y: Math.floor(i/csv_header.length),
          
    //nodes size
    size: 5,

    //grid effect settings
    color: columnColorMap[name.split("?")[0]],
    grid_x: 10 + (cell_idx*100),
    grid_y: 10 +  (row_idx*10),
    grid_size: 6,
    grid_color: columnColorMap[name.split("?")[0]]
  };
}

$.get(arbitraryCsvFile,function(body){
  createGraph(csv2graph(body));
});

//TESTES
 function edgeonoff(){
  s.refresh()
  FlagDrawLines = false;
}