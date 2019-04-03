d3.csv("../kde.csv").then(kde=>{
    let svgWidth = 600;
    let svgHeight = 600;

    console.log(kde)
    // construct mesh
    let xList = [];
    let yList = [];
    kde.forEach(e => {
        xList.push(parseFloat(e.x));
        yList.push(parseFloat(e.y));
    });
    let xRange = {"min":Math.min.apply(null,xList),"max":Math.max.apply(null,xList)};
    let yRange = {"min":Math.min.apply(null,yList),"max":Math.max.apply(null,yList)};
    // console.log(xList)
    console.log(xRange)
    console.log(yRange)
    let xRange_new = {"min":-70,"max":70};
    let yRange_new = {"min":-30,"max":30};
    let N = 100;
    let xStep = (xRange_new.max-xRange_new.min)/N;
    let yStep = (yRange_new.max-yRange_new.min)/N;
    let xp = d3.range(N).map(i=>{
        return xRange_new.min + xStep*i;
    })
    let yp = d3.range(N).map(i=>{
        return yRange_new.min + yStep*i;
    })
    console.log(xp,yp)
    let mesh_2d = []
    for(let i=0;i<xp.length;i++){
        for(let j=0;j<yp.length;j++){
            mesh_2d.push({"x":xp[i],"y":yp[j],"kde":0})
        }
    }

    //assign KDE value to each mesh
    let maxKDE = 0;
    for(let i=0;i<kde.length;i++){
        let x = parseFloat(kde[i].x)
        let y = parseFloat(kde[i].y)
        let d = parseFloat(kde[i]["2dKDE"])
        // console.log(d)
        let xId = Math.floor((x-xRange_new.min)/xStep);
        let yId = Math.floor((y-yRange_new.min)/yStep);
        let meshId = xId*100+yId; 
        if(d>maxKDE){
            maxKDE = d;
        }
        // *** TODO: some point may fall in the same mesh
        mesh_2d[meshId].kde = d;
    }
    console.log(mesh_2d)

    let xMap = d3.scaleLinear()
                .domain([xRange_new.min, xRange_new.max])
                .range([0, svgWidth]);
    let yMap = d3.scaleLinear()
                .domain([yRange_new.min, yRange_new.max])
                .range([0, svgHeight]);

    let colorMap = d3.scaleLinear()
                    .domain([0, maxKDE])
                    .range(['white', 'red']);

    d3.select("#kde").append("g")
        .attr("id","meshgroup");
    let kdeRect = d3.select("#meshgroup").selectAll("rect").data(mesh_2d);
    kdeRect.exit().remove();
    let newKdeRect = kdeRect.enter().append("rect");
    kdeRect = newKdeRect.merge(kdeRect);
    kdeRect
        .attr("x",d=>xMap(d.x))
        .attr("y",d=>yMap(d.y))
        .attr("width",xMap(xStep))
        .attr("height",yMap(yStep))
        .attr("fill",d=>colorMap(d.kde))
        // .attr("fill","red")
        // .style("opacity",0.1)

    // *** TODO : need smooth for kde value, construct Morse complex

    // *** TODO: find local maximum & saddle of Morse complex

    // *** TODO: extract ridge from the complex, and visualize the ridge




})