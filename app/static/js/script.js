// let kde;
// let ridge;
// async function init(){
//   kde = await d3.csv("static/assets/kdeMesh3d.csv")
//   ridge = await d3.csv('static/assets/ridge.csv')
// }
// init();

// let kde = document.getElementById('kde_select');
//   kde.onclick = (e) => {
//     // e.preventDefault();
//     // $("#vistype").val("nodelink3d")

//   }

let content = new FormData();
//let kde;
  // $("[data-parent='#accordion']").addClass('collapsed').attr('aria-expanded','false');
  // $(".panel-collapse").removeClass('show');
$.ajax({
    type: "POST",
    enctype: 'multipart/form-data',
    url: "/demoKDE",
    data: content,
    processData: false, //prevent jQuery from automatically transforming the data into a query string
    contentType: false,
    cache: false,
    dataType:'json',
    success: function (response) {
    //  console.log(response)
      src(response)
    },
    error: function (error) {
          console.log("error",error);
    }
  });
let xArray = new Set([])
let yArray = new Set([])
let zArray = new Set([])
let mesh_matrix;
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

function src(response) {
    const kde = JSON.parse(response['kde'])
    const ridge = JSON.parse(response['ridge'])


    kde.forEach(dataEntry=>{
      dataEntry.x = parseFloat(dataEntry.x)
      dataEntry.y = parseFloat(dataEntry.y)
      dataEntry.z =parseFloat( d3.format('.2f')(dataEntry.z))
      dataEntry['3dKDE'] = parseFloat(dataEntry['3dKDE'])
      xArray.add(dataEntry.x)
      yArray.add(dataEntry.y)
      zArray.add(dataEntry.z)
    })
    d3.select('#dimensions').on('change',d=>{
      changeDimension(kde)
    })
    // let xPoints = []
    // let yPoints = []
    // let zPoints = []
    // ridge.forEach(dataEntry=>{
    //   xPoints.push (parseFloat(dataEntry.x))
    //   yPoints.push (parseFloat(dataEntry.y))
    //   zPoints.push(parseFloat(dataEntry['3dKDE']))
    // })


    let svgWidth = 600;
    let svgHeight = 600;
    xArray = Array.from(xArray).sort(d3.ascending)
    yArray = Array.from(yArray).sort(d3.ascending)
    zArray = Array.from(zArray).sort(d3.ascending)


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
           zz.push(findValue(0, y, z,kde))
       }
       dataToDraw[0].z.push(zz)
    };
    mesh_matrix = dataToDraw[0]


    let xPoints = []
    let yPoints = []
    let zPoints = []

    Plotly.newPlot('container', dataToDraw, layout);
    let selectedDimension = 'x';
    drawXSlider(kde)
    d3.select("#kde_select")
        .on("click",()=>{

            d3.select(".plot-container")
                .style("visibility","visible");
        })

    d3.select('#ridge_select')
        .on('click',()=>{
          console.log(mesh_matrix)
          let result = constructMesh(mesh_matrix)

          mesh = result[0];
          let X = result[1]
          let Y = result[2]
          let cp_max = find_max(mesh,X,Y)
          let cp_saddle = find_saddle(mesh,X,Y);
          let paths = [];
          for(let i=0;i<cp_saddle.length;i++){
            let smani = stable_mani_saddle(cp_saddle[i],mesh,cp_max,X,Y);
            paths.push(smani[0]);
            paths.push(smani[1])
          }

          paths.forEach(p=>{
            p.forEach(dataEntry=>{
              xPoints.push (parseFloat(dataEntry[0]))
              yPoints.push (parseFloat(dataEntry[1]))
              zPoints.push(parseFloat(dataEntry[2]))
            })})
          dataToDraw = [
             mesh_matrix,    {
                  x:xPoints,
                  y: yPoints,
                  z:zPoints,
                  type:'scatter3d'
                }
           ];
        
        //  console.log(kde)

         Plotly.react('container', dataToDraw, layout);
        })
}


function changeDimension(kde){
  const form = document.getElementById('dimensions')
  if (form[0].checked){
    selectedDimension = 'x'
    drawXSlider(kde)
  }
  else if (form[1].checked){
    selectedDimension = 'y'
    drawYSlider(kde)
  }
  else if (form[2].checked){
    selectedDimension = 'z'
    drawZSlider(kde)
  }
}

function drawXSlider(kde){
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
                               zz.push(findValue(xVal, y, z,kde))
                           }
                           dataToDraw[0].z.push(zz)
                       }
                       mesh_matrix = dataToDraw[0]
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

function drawYSlider(kde){
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
                               zz.push(findValue(x, yVal, z,kde))
                           }
                           dataToDraw[0].z.push(zz)
                       }
                       mesh_matrix = dataToDraw[0]
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

function drawZSlider(kde){
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
                               zz.push(findValue(x, y, zVal,kde))
                           }
                           dataToDraw[0].z.push(zz)
                       }
                       mesh_matrix = dataToDraw[0]
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


function findValue(xValue, yValue, zValue,kde){
  let kdeValue;
  zValue = d3.format('.2')(zValue)
  const xIndex = parseInt((xValue+70)/2)
  const yIndex = parseInt((yValue + 30)/2)
  const zIndex = parseInt((zValue*10+50)/2)
  const result_index = parseInt(zIndex + xIndex*1500 + yIndex * 50)
  return kde[result_index]['3dKDE']
}
function constructMesh(matrix){
  let mesh = [];
  let X = matrix["x"]
  let Y = matrix["y"]
  let D = matrix["z"]
  for(let i=0;i<X.length-1;i++){
    for(let j=0;j<Y.length;j++){
      // let idx = i*Y.length+j;
      mesh.push([X[i],Y[j],D[j][i]])
    }
  }
  return [mesh,X,Y];
}


function find_max(mesh,X,Y){
  let cps = [];
  for(let i=0;i<X.length-2;i++){
    for(let j=0;j<Y.length-1;j++){
      if(i>0&&j>0){
        let idx = i*Y.length+j;
        let idx_1_1 = (i-1)*Y.length+j-1;
        let idx0_1 = (i-1)*Y.length+j;
        let idx1_1 = (i-1)*Y.length+j+1;
        let idx_10 = i*Y.length+j-1;
        let idx10 = i*Y.length+j+1;
        let idx_11 = (i+1)*Y.length+j-1;
        let idx01 = (i+1)*Y.length+j;
        let idx11 = (i+1)*Y.length+j+1;
        let f = mesh[idx][2];
        let f_1_1 = mesh[idx_1_1][2];
        let f0_1 = mesh[idx0_1][2];
        let f1_1 = mesh[idx1_1][2];
        let f_10 = mesh[idx_10][2];
        let f10 = mesh[idx10][2];
        let f_11 = mesh[idx_11][2];
        let f01 = mesh[idx01][2];
        let f11 = mesh[idx11][2];
        if (f>=f_1_1 && f>=f0_1 && f>=f1_1 && f>=f_10 && f>=f10 && f>=f_11 && f>=f01 && f>=f11){
          cps.push(mesh[idx]);
        }


      }
    }
  }
  return cps;
}

function find_saddle(mesh,X,Y){
  let cps = [];
  for(let i=0;i<X.length-2;i++){
    for(let j=0;j<Y.length-1;j++){
      if(i>0&&j>0){
        let idx = i*Y.length+j;
        let idx_1_1 = (i-1)*Y.length+j-1;
        let idx0_1 = (i-1)*Y.length+j;
        let idx1_1 = (i-1)*Y.length+j+1;
        let idx_10 = i*Y.length+j-1;
        let idx10 = i*Y.length+j+1;
        let idx_11 = (i+1)*Y.length+j-1;
        let idx01 = (i+1)*Y.length+j;
        let idx11 = (i+1)*Y.length+j+1;
        let f = mesh[idx][2];
        let f_1_1 = mesh[idx_1_1][2];
        let f0_1 = mesh[idx0_1][2];
        let f1_1 = mesh[idx1_1][2];
        let f_10 = mesh[idx_10][2];
        let f10 = mesh[idx10][2];
        let f_11 = mesh[idx_11][2];
        let f01 = mesh[idx01][2];
        let f11 = mesh[idx11][2];
        if ((f>=f_10 && f>=f10 && f<=f0_1 && f<=f01) || (f<=f_10 && f<=f10 && f>=f0_1 && f>=f01)){
          cps.push(mesh[idx]);
        }

      }

    }
  }
  return cps;
}
function calDist(loc1, loc2){
  let dist = Math.sqrt(Math.pow(loc1[0]-loc2[0],2)+Math.pow(loc1[1]-loc2[1],2));
  return dist;
}

function findMinPt(pt0, pts){
  let dist = calDist(pt0,pts[0]);
  let minPt = pts[0];
  for(let i=1;i<pts.length;i++){
      let disti = calDist(pt0,pts[i]);
      if(disti < dist){
          dist = disti;
          minPt = pts[i]
      }
  }
  return minPt
}

function find2MinPt(pt,pts){
  let pt1 = findMinPt(pt,pts);
  let idx1 = pts.indexOf(pt1);
  let pts1 = pts.slice(0,idx1);
  let pts2 = pts.slice(idx1+1);
  let pts_new = pts1.concat(pts2);
  let pt2 = findMinPt(pt,pts_new);
  return [pt1,pt2];
}

function find_steepest_path(m1,m2,mesh,X,Y){
  let stepX = (Math.max(...X)-Math.min(...X))/(X.length-1);
  let stepY = (Math.max(...Y)-Math.min(...Y))/(Y.length-1);
  let path = [];
  let dirc_x = Math.round((m1[0]-m2[0])/Math.abs(m1[0]-m2[0]));
  let dirc_y=0
  if(Math.abs(m1[1]-m2[1])!=0){
    dirc_y = Math.round((m1[1]-m2[1])/Math.abs(m1[1]-m2[1]));
  }

  let step_x = parseInt(Math.abs(m1[0]-m2[0])/stepX);
  let step_y = parseInt(Math.abs(m1[1]-m2[1])/stepY);
  let sx = 0;
  let sy = 0;
  let x_status = m1[0];
  let y_status = m1[1];
  let fv = m1[2];
  let i = 0;
  while((sx < step_x )|| (sy < step_y)){
    i+=1
    let pt1 = [x_status, y_status-dirc_y*stepY];
    let pt2 = [x_status-dirc_x*stepX, y_status];
    let idx1 = Math.round((pt1[0]-Math.min(...X))/stepX*Y.length+(pt1[1]-Math.min(...Y))/stepY);
    let idx2 = Math.round((pt2[0]-Math.min(...X))/stepX*Y.length+(pt2[1]-Math.min(...Y))/stepY);
    let d1 = mesh[idx1][2];
    let d2 = mesh[idx2][2];
    if (Math.abs(fv-d1) > Math.abs(fv-d2)){// d1 is steeper
      if (sy<step_y){
        path.push(mesh[idx1])
        x_status = pt1[0]
        y_status = pt1[1]
        fv = d1
        sy += 1
      }

      else if(sx < step_x){
        path.push(mesh[idx2])
        x_status = pt2[0]
        y_status = pt2[1]
        fv = d2
        sx += 1
      }
    }
    else{
      if (sx < step_x){
        path.push(mesh[idx2])
        x_status = pt2[0]
        y_status = pt2[1]
        fv = d2
        sx += 1
      }
      else if(sy < step_y){
        path.push(mesh[idx1])
        x_status = pt1[0]
        y_status = pt1[1]
        fv = d1
        sy += 1
      }
    }
  }
  return path
}

function stable_mani_saddle(saddle,mesh,cp_max,X,Y){
  // let stepX = (Math.max(X)-Math.min(X))/(X.length-1);
  // let stepY = (Math.max(Y)-Math.min(Y))/(Y.length-1);
  // let i = (saddle[0]-Math.min(X))/stepX;
  // let j = (saddle[1]-Math.min(Y))/stepY;
  let maxes = find2MinPt(saddle,cp_max);
  let max1 = maxes[0];
  let max2 = maxes[1];
  let path1 = find_steepest_path(saddle,max1,mesh,X,Y);
  let path2 = find_steepest_path(saddle,max2,mesh,X,Y);
  return [path1,path2];
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
// let xRange_new = {"min":-70,"max":70};
// let yRange_new = {"min":-30,"max":30};
// // let N = 100;
// let xStep = (xRange_new.max-xRange_new.min)/140;
// let yStep = (yRange_new.max-yRange_new.min)/60;
// // let xp = d3.range(N).map(i=>{
// //     return xRange_new.min + xStep*i;
// // })
// // let yp = d3.range(N).map(i=>{
// //     return yRange_new.min + yStep*i;
// // })
// // console.log(xp,yp)
// // let mesh_2d = []
// // for(let i=0;i<xp.length;i++){
// //     for(let j=0;j<yp.length;j++){
// //         mesh_2d.push({"x":xp[i],"y":yp[j],"kde":0})
// //     }
// // }
//
// //assign KDE value to each mesh
// let maxKDE = 0;
// for(let i=0;i<kde.length;i++){
// //     let x = parseFloat(kde[i].x)
// //     let y = parseFloat(kde[i].y)
//     let d = parseFloat(kde[i]["2dKDE"])
// //     // console.log(d)
// //     let xId = Math.floor((x-xRange_new.min)/xStep);
// //     let yId = Math.floor((y-yRange_new.min)/yStep);
// //     let meshId = xId*100+yId;
//     if(d>maxKDE){
//         maxKDE = d;
//     }
// //     // *** TODO: some point may fall in the same mesh
// //     mesh_2d[meshId].kde = d;
// }
// // console.log(mesh_2d)
//
// let xMap = d3.scaleLinear()
//             .domain([xRange_new.min, xRange_new.max])
//             .range([0, svgWidth]);
// let yMap = d3.scaleLinear()
//             .domain([yRange_new.min, yRange_new.max])
//             .range([0, svgHeight]);
//
// let colorMap = d3.scaleLinear()
//                 .domain([0, maxKDE])
//                 .range(["blue", 'red']);
//
// d3.select("#kde").append("g")
//     .attr("id","meshgroup");
//
// let kdeRect = d3.select("#meshgroup").selectAll("rect").data(kde);
// kdeRect.exit().remove();
// let newKdeRect = kdeRect.enter().append("rect");
// kdeRect = newKdeRect.merge(kdeRect);
// kdeRect
//     .attr("x",d=>xMap(d.x))
//     .attr("y",d=>yMap(d.y))
//     .attr("width",xMap(xStep))
//     .attr("height",yMap(yStep))
//     .attr("fill",d=>colorMap(d["2dKDE"]))
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
