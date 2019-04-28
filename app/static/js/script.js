let kde;
let ridge;
async function init(){
  kde = await d3.csv("../static/assets/kdeMesh3d.csv")
  ridge = await d3.csv('../static/assets/ridge.csv')
}
init();

let xArray = new Set([])
let yArray = new Set([])
let zArray = new Set([])
kde.forEach(dataEntry=>{
  dataEntry.x = parseFloat(dataEntry.x)
  dataEntry.y = parseFloat(dataEntry.y)
  dataEntry.z =parseFloat( d3.format('.2f')(dataEntry.z))
  dataEntry['3dKDE'] = parseFloat(dataEntry['3dKDE'])
  xArray.add(dataEntry.x)
  yArray.add(dataEntry.y)
  zArray.add(dataEntry.z)
})

let xPoints = []
let yPoints = []
let zPoints = []
ridge.forEach(dataEntry=>{
  xPoints.push (parseFloat(dataEntry.x))
  yPoints.push (parseFloat(dataEntry.y))
  zPoints.push(parseFloat(dataEntry['3dKDE']))
})
console.log(ridge)

let svgWidth = 600;
let svgHeight = 600;
xArray = Array.from(xArray).sort(d3.ascending)
yArray = Array.from(yArray).sort(d3.ascending)
zArray = Array.from(zArray).sort(d3.ascending)
let layout = {
    autosize: false,
    uirevision:'true',
    width: 600,
    height: 600,
    margin: {
        l: 65,
        r: 50,
        b: 65,
        t: 90
    },
    scene:{
      xaxis:{title: 'Z Value'},
      yaxis:{title: 'Y Value'},
      zaxis:{title: 'Density'},}
};

let dataToDraw = [
   {
     x:zArray,
     y:yArray,
     z: [],
     type: 'surface'
   }
   // {
   //   x:[0],
   //   y: [0],
   //   z:[0],
   //   type:'scatter3d'
   // }
 ];

for(let y=-30;y <= 28;y+=2){
   let zz = [];
   for(let z=-5;z <= 4.8; z +=0.2){
       zz.push(findValue(0, y, z))
   }
   dataToDraw[0].z.push(zz)
};

Plotly.newPlot('container', dataToDraw, layout);
let selectedDimension = 'x';
drawXSlider()
function changeDimension(){
  const form = document.getElementById('dimensions')
  if (form[0].checked){
    selectedDimension = 'x'
    drawXSlider()
  }
  else if (form[1].checked){
    selectedDimension = 'y'
    drawYSlider()
  }
  else if (form[2].checked){
    selectedDimension = 'z'
    drawZSlider()
  }
}

function drawXSlider(){
    d3.select('#slider-g').remove()
    let sliderStep = d3.sliderBottom()
                     .min(d3.min(xArray))
                     .max(d3.max(xArray))
                     .step(2)
                     .width(500)
                     .on('onchange',xVal=>{
                        dataToDraw = [
                           {
                             x:zArray,
                             y:yArray,
                             z: [],
                             type: 'surface'
                           }
                         ];
                       for(let y=-30;y <= 28;y+=2){
                           let zz = [];
                           for(let z=-5;z <= 4.8; z +=0.2){
                               // console.log(i,j)
                               zz.push(findValue(xVal, y, z))
                           }
                           dataToDraw[0].z.push(zz)
                       }
                       layout.scene={
                         xaxis:{title: 'Z Value'},
                         yaxis:{title: 'Y Value'},
                         zaxis:{title: 'Density'},}
                       Plotly.react('container', dataToDraw, layout);
                     })
  let gStep = d3.select('#slider')
                .append('g')
                .attr('id','slider-g')
                .attr('transform', 'translate(30,30)')

                .call(sliderStep)
}

function drawYSlider(){
  d3.select('#slider-g').remove()
  let sliderStep = d3.sliderBottom()
                     .min(d3.min(yArray))
                     .max(d3.max(yArray))
                     .step(2)
                     .width(500)
                     .on('onchange',yVal=>{
                        dataToDraw = [
                           {
                             x:zArray,
                             y:xArray,
                             z: [],
                             type: 'surface'
                           }
                         ];

                       for(let x=-70;x <= 68;x+=2){
                           let zz = [];
                           for(let z=-5;z <= 4.8; z +=0.2){
                               // console.log(i,j)
                               zz.push(findValue(x, yVal, z))
                           }
                           dataToDraw[0].z.push(zz)
                       }
                       layout.scene={
                         xaxis:{title: 'Z Value'},
                         yaxis:{title: 'X Value'},
                         zaxis:{title: 'Density'},}
                       Plotly.react('container', dataToDraw, layout);
                     })
  let gStep = d3.select('#slider')
                .append('g')
                .attr('id','slider-g')
                .attr('transform', 'translate(30,30)')
                .call(sliderStep)

}

function drawZSlider(){
  d3.select('#slider-g').remove()
  let sliderStep = d3.sliderBottom()
                     .min(d3.min(zArray))
                     .max(d3.max(zArray))
                     .tickFormat(d3.format('.2f'))
                     .step(0.2)
                     .width(500)
                     .on('onchange',zVal=>{
                        dataToDraw = [
                           {
                             x:xArray,
                             y:yArray,
                             z: [],
                             type: 'surface'
                           }
                         ];

                       for(let y=-30;y <= 28;y+=2){
                           let zz = [];
                           for(let x=-70;x <= 68; x +=2){
                               // console.log(i,j)
                               zz.push(findValue(x, y, zVal))
                           }
                           dataToDraw[0].z.push(zz)
                       }
                       layout.scene={
                         xaxis:{title: 'X Value'},
                         yaxis:{title: 'Y Value'},
                         zaxis:{title: 'Density'},}
                       Plotly.react('container', dataToDraw, layout);
                     })
  let gStep = d3.select('#slider')
                .append('g')
                .attr('id','slider-g')
                .attr('transform', 'translate(30,30)')
                .call(sliderStep)

}



d3.select('#dimensions').on('change',changeDimension)
function findValue(xValue, yValue, zValue){
  let kdeValue;
  zValue = d3.format('.2')(zValue)
  const xIndex = parseInt((xValue+70)/2)
  const yIndex = parseInt((yValue + 30)/2)
  const zIndex = parseInt((zValue*10+50)/2)

  return kde[zIndex + xIndex*1500 + yIndex * 50]['3dKDE']
}





// d3.select("#js-plotly-tester")
    // .style("z-index",7)
    // .style("width",600)
    // .style("height",600)

// console.log(kde)
// // construct mesh
// let xList = [];
// let yList = [];
// kde.forEach(e => {
//     xList.push(parseFloat(e.x));
//     yList.push(parseFloat(e.y));
// });
// let xRange = {"min":Math.min.apply(null,xList),"max":Math.max.apply(null,xList)};
// let yRange = {"min":Math.min.apply(null,yList),"max":Math.max.apply(null,yList)};
// // console.log(xList)
// console.log(xRange)
// console.log(yRange)
let xRange_new = {"min":-70,"max":70};
let yRange_new = {"min":-30,"max":30};
// let N = 100;
let xStep = (xRange_new.max-xRange_new.min)/140;
let yStep = (yRange_new.max-yRange_new.min)/60;
// let xp = d3.range(N).map(i=>{
//     return xRange_new.min + xStep*i;
// })
// let yp = d3.range(N).map(i=>{
//     return yRange_new.min + yStep*i;
// })
// console.log(xp,yp)
// let mesh_2d = []
// for(let i=0;i<xp.length;i++){
//     for(let j=0;j<yp.length;j++){
//         mesh_2d.push({"x":xp[i],"y":yp[j],"kde":0})
//     }
// }

//assign KDE value to each mesh
let maxKDE = 0;
for(let i=0;i<kde.length;i++){
//     let x = parseFloat(kde[i].x)
//     let y = parseFloat(kde[i].y)
    let d = parseFloat(kde[i]["2dKDE"])
//     // console.log(d)
//     let xId = Math.floor((x-xRange_new.min)/xStep);
//     let yId = Math.floor((y-yRange_new.min)/yStep);
//     let meshId = xId*100+yId;
    if(d>maxKDE){
        maxKDE = d;
    }
//     // *** TODO: some point may fall in the same mesh
//     mesh_2d[meshId].kde = d;
}
// console.log(mesh_2d)

let xMap = d3.scaleLinear()
            .domain([xRange_new.min, xRange_new.max])
            .range([0, svgWidth]);
let yMap = d3.scaleLinear()
            .domain([yRange_new.min, yRange_new.max])
            .range([0, svgHeight]);

let colorMap = d3.scaleLinear()
                .domain([0, maxKDE])
                .range(["blue", 'red']);

d3.select("#kde").append("g")
    .attr("id","meshgroup");

let kdeRect = d3.select("#meshgroup").selectAll("rect").data(kde);
kdeRect.exit().remove();
let newKdeRect = kdeRect.enter().append("rect");
kdeRect = newKdeRect.merge(kdeRect);
kdeRect
    .attr("x",d=>xMap(d.x))
    .attr("y",d=>yMap(d.y))
    .attr("width",xMap(xStep))
    .attr("height",yMap(yStep))
    .attr("fill",d=>colorMap(d["2dKDE"]))
    // .style("visibility","hidden")
    // .attr("fill","red")
    // .style("visibility","hidden")
// let ul=d3.select('#container')
//        .append('ul');

// let surfaceGroup = d3.select("#kde").append("g")
//                     .attr("id","surfacegroup");
// surfaceGroup.data(mesh_2d)
//     .surface3D(svgWidth,svgHeight)
//     .surfaceHeight(function(d){
//         return d;
//       }).surfaceColor(function(d){
//         var c=d3.hsl((d+100), 0.6, 0.5).rgb();
//         return "rgb("+parseInt(c.r)+","+parseInt(c.g)+","+parseInt(c.b)+")";
//       });
// d3.select("#kde").on("mousedown",function(){
//         drag=[d3.mouse(this),yaw,pitch];
//     }).on("mouseup",function(){
//         drag=false;
//       }).on("mousemove",function(){
//         if(drag){
//           var mouse=d3.mouse(this);
//           yaw=drag[1]-(mouse[0]-drag[0][0])/50;
//           pitch=drag[2]+(mouse[1]-drag[0][1])/50;
//           pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,pitch));
//           md.turntable(yaw,pitch);
//         }
//       });
// d3.select("#kde2d")
//     .on("click",()=>{
//         console.log("clicking")
//         d3.select("#kde")
//             .style("visibility","visible");
//         d3.select(".plot-container")
//             .style("visibility","hidden");
//     })
d3.select("#kde_select")
    .on("click",()=>{

        d3.select(".plot-container")
            .style("visibility","visible");
    })

d3.select('#ridge_select')
    .on('click',()=>{
      dataToDraw = [
         {
           x:xArray,
           y:yArray,
           z: [],
           type: 'surface'
         },    {
              x:xPoints,
              y: yPoints,
              z:zPoints,
              type:'scatter3d'
            }
       ];
       console.log(dataToDraw)
     for(let y=-30;y <= 28;y+=2){
         let zz = [];
         for(let x=-70;x <= 68; x +=2){
             // console.log(i,j)
             zz.push(findValue(x, y, 2))
         }
         dataToDraw[0].z.push(zz)
     }
     layout.scene={
       xaxis:{title: 'X Value'},
       yaxis:{title: 'Y Value'},
       zaxis:{title: 'Density'},}
     Plotly.react('container', dataToDraw, layout);
    })

// *** TODO: find local maximum & saddle of Morse complex

// *** TODO: extract ridge from the complex, and visualize the ridge



d3.select("#files")
   .on("change",()=>{
       let form = $('#upload')[0];
       let content = new FormData(form);
       $.ajax({
           type: "POST",
           enctype: 'multipart/form-data',
           url: "/import",
           data: content,
           processData: false, //prevent jQuery from automatically transforming the data into a query string
           contentType: false,
           cache: false,
           dataType:'json',
           success: function (response) {
               data=response;
               console.log(data)
           },
           error: function (error) {
               console.log("error",error);
           }
       });

   })
