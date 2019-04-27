d3.csv("../kde.csv").then(kde=>{
    let svgWidth = 600;
    let svgHeight = 600;

    console.log(kde)
    let layout = {
        // title: 'Mt Bruno Elevation',
        autosize: false,
        width: 600,
        height: 600,
        margin: {
            l: 65,
            r: 50,
            b: 65,
            t: 90
        }
    };

    let data = [
        {
          z: [],
          type: 'surface'
        }
      ];

    for(let i=0;i<140;i++){
        let zz = [];
        for(let j=0;j<60;j++){
            // console.log(i,j)
            zz.push(kde[i*60+j]["2dKDE"])
        }
        data[0].z.push(zz)
    }
    console.log(data)

    Plotly.newPlot('container', data, layout);
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
    d3.select("#kde2d")
        .on("click",()=>{
            console.log("clicking")
            d3.select("#kde")
                .style("visibility","visible");
            d3.select(".plot-container")
                .style("visibility","hidden");
        })
    d3.select("#kde3d")
        .on("click",()=>{
            d3.select("#kde")
                .style("visibility","hidden");
            d3.select(".plot-container")
                .style("visibility","visible");
        })


    // *** TODO: find local maximum & saddle of Morse complex

    // *** TODO: extract ridge from the complex, and visualize the ridge

})
