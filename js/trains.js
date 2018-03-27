function padTime(number) {
   
     return (number < 10 ? '0' : '') + number;
   
}
// Chart dimensions
var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 140 /*39.5*/};
var width = 960 - margin.right;
var height = 500 - margin.top - margin.bottom;

// Create the SVG container and set the origin
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("../schedule.json", function(schedule) {
d3.json("../distances.json", function(distances) { 

    
    function timeToInt(time){
        var strArr = time.split("h");
        var strVal = parseInt(strArr[0])*100 + parseInt(strArr[1]);
        return strVal;
    }
    function timeToDate(time){
        var hours = Math.floor(time/100);
        var minutes = time-(hours*100);
        return new Date(0,0,0,hours,minutes);
    }
    
    
    var maxTime = d3.max(schedule, function(d) {
                return +d3.max(d, function(innerD) { return +Math.max(timeToInt(innerD[1]), timeToInt(innerD[2]));})
                } );
    
    var maxDate = timeToDate(maxTime);
    
    var minTime = d3.min(schedule, function(d) { 
                return +d3.min(d, function(innerD) { return +Math.min(timeToInt(innerD[1]), timeToInt(innerD[2]));})
                } );
    
    var minDate = timeToDate(minTime);
    
    var distKeys = Object.keys(distances);
    
    var minDist = d3.min(distKeys, function(d) {
        return +distances[d];
    });
    var maxDist = d3.max(distKeys, function(d) {
        return +distances[d];
    });
    
    var xScale = d3.scaleTime().domain([minDate, maxDate]).range([0, width]),
    yScale = d3.scaleLinear().domain([minDist, maxDist]).range([height, 0]);
    
    var xAxis = d3.axisBottom(xScale).tickFormat(function(d) { return padTime(d.getHours()) + "h"+ padTime(d.getMinutes()); }),
        xAxis2 = d3.axisTop(xScale).tickFormat(function(d) { return padTime(d.getHours()) + "h"+ padTime(d.getMinutes()); }),
     yAxis = d3.axisLeft(yScale);
    svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0, " + height + ")")
    .call(xAxis);
    
    svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0,0)")
    .call(xAxis2);
    
    var dists = svg.append("g")
        .selectAll("text")
	   .data(distKeys)
	   .enter()
        .append("text")
	   .attr("x", -20)
        .attr("y", function(d) {
            return -1*(yScale(distances[d])- height);
        })
        .attr("class", "label")
        .style("text-anchor", "end")
        .style("font-size", "9pt")
        .text(function(d) {
            return d;
        });
    svg.append("g")
        .selectAll("line")
	    .data(distKeys)
	    .enter()
        .append("line")
        .attr("x1", -10)
        .attr("y1", function(d) {
            return -1*(yScale(distances[d])- height);
        })
        .attr("x2", width)
        .attr("y2", function(d) {
            return -1*(yScale(distances[d])- height);
        })
        .attr("stroke-width", 0.5)
        .attr("stroke", "grey");
    
    var parsedSched = [];
    var arrayLength = schedule.length;
    for (var i = 0; i < arrayLength; i++) {
        var train = [];
        var curTrain = schedule[i];
        for (var j = 0; j < curTrain.length; j++) {
            var stop = [];
            var curStop = curTrain[j];
            stop.push(curStop[0]);
            stop.push(timeToDate(timeToInt(curStop[1])));
            stop.push(timeToDate(timeToInt(curStop[2])));
            train.push(stop);
        }
        parsedSched.push(train);
    }
    function dataToLine(trainData) {
        var lineData = "M";
        if (trainData.length < 0) {
            lineData += xScale(trainData[0][1]) + "," + -1*(yScale(distances[trainData[0][0]]) - height);
        }
        for (var i = 0; i < trainData.length; i++) {
            lineData += xScale(trainData[i][1]) + "," + -1*(yScale(distances[trainData[i][0]]) - height);
            lineData += "L";
            lineData += xScale(trainData[i][2]) + "," + -1*(yScale(distances[trainData[i][0]]) - height);
            if (i != trainData.length - 1) {
            lineData += "L";
        }
        }
        return lineData;
    }
    
    var node = svg.append("g");
    
    var curLine = node.append("line")
        .attr("x1", 100)
        .attr("y1", 0)
        .attr("x2", 100)
        .attr("y2", height)
        .attr("stroke", "black")
        .attr('stroke-opacity', 0)
        .attr("stroke-width", 1);
    
    node.insert("rect")
      .attr("width", width)
      .attr("height", height)
    .attr('fill-opacity', 0)
      .style("fill", "white")
      .on("mouseover", function() { 
        var x0 = d3.mouse(this);
    curLine.attr("x1", x0[0])
        .attr("x2", x0[0])
        .attr('stroke-opacity', 1);
    })
    .on("mouseout", function() { 
    curLine.attr('stroke-opacity', 0);
    })
      .on("mousemove", function () {
        var x0 = d3.mouse(this);
    curLine.attr("x1", x0[0])
        .attr("x2", x0[0]);
    });
    
    var focus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("circle")
      .attr("r", 4.5);

  focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");
    
var lines1;
var lines2;
    
function makeLines(data){
    lines1 = svg.append("g")
    .selectAll("line")
	.data(data)
	.enter()
    .append("line")
        .attr("x1", function(d) {
            return xScale(d[1]);})
        .attr("y1", 0)
        .attr("x2", function(d) {return xScale(d[1]);})
        .attr("y2", height)
        .attr("stroke", "black")
        .attr('stroke-opacity', 1)
        .attr("stroke-width", 1);
    lines2 = svg.append("g")
    .selectAll("line")
	.data(data)
	.enter()
    .append("line")
        .attr("x1", function(d) {
            return xScale(d[2]);})
        .attr("y1", 0)
        .attr("x2", function(d) {return xScale(d[2]);})
        .attr("y2", height)
        .attr("stroke", "black")
        .attr('stroke-opacity', 1)
        .attr("stroke-width", 1);
}


    var trains = svg.append("g")
    .selectAll("path")
	.data(parsedSched)
	.enter()
    .append("path")
	.attr("d", function(d) {return d ? dataToLine(d) : null; })
	.style("stroke", "#2074A0")
    .attr("stroke-width", 3)
	.style("stroke-opacity", 0.5)
	.style("fill", "none")
	.on("mouseover", function(d, i) {
        d3.select(this)
                .style("stroke-opacity", 10)
                .attr("stroke-width", 6);
       makeLines(d);
    })
	.on("mouseout", function() {
        d3.select(this)
                .style("stroke-opacity", 0.5)
                .attr("stroke-width", 3);
        lines1.remove();
        lines2.remove();
    });
    
});
});