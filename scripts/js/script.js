d3.csv("../kde.csv").then(kde=>{
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
    let xp = d3.range(N).map(i=>{
        return xRange_new.min + (xRange_new.max-xRange_new.min)*i/N;
    })
    let yp = d3.range(N).map(i=>{
        return yRange_new.min + (yRange_new.max-yRange_new.min)*i/N;
    })
    console.log(xp,yp)

    //assign KDE value to each mesh

})