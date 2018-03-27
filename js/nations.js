console.log("hello");

function x(d) {
  return d.income;
    // Return nation's income
  }
  function y(d) {
    return d.lifeExpectancy; 
    // Return nation's lifeExpectancy
  }
  function radius(d) {
    return d.population;
    // Return nation's population
  }
  function color(d) {
    return d.region;
    // Return nation's region
  }
  function key(d) {
    return d.name;
    // Return nation's name
  }

  var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5};
  var width = 960 - margin.right;
  var height = 500 - margin.top - margin.bottom;

// Various scales
var xScale = d3.scaleLog().domain([300, 1e5]).range([0, width]),
yScale = d3.scaleLinear().domain([10, 85]).range([height, 0]),
radiusScale = d3.scaleSqrt().domain([0, 5e8]).range([0, 40]),
colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// The x & y axes
var xAxis = d3.axisBottom(xScale).ticks(12, d3.format(",d")),
yAxis = d3.axisLeft(yScale);

// Create the SVG container and set the origin
var svg = d3.select("#chart").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
.attr("class", "axis")
.attr("transform", "translate(0, " + height + ")")
.call(xAxis);

svg.append("g")
.attr("class", "axis")
.call(yAxis);

svg.append("text")     
.attr("x", 900 )
.attr("y", 457 )
.attr("class", "label")
.style("text-anchor", "middle")
.text("Income (dollars)");

svg.append("text")
.attr("transform", "rotate(-90)")
.attr("y",2)
.attr("x",-50)
.attr("dy", "1em")
.attr("class", "label")
.style("text-anchor", "middle")
.text("Life Expectancy (years)");

year_label = svg.append("text")      
.attr("x", 700 )
.attr("y", 440 )
.style("text-anchor", "middle")
.attr("class", "year label")
.text("1800");

console.log("here");
$.getJSON('../nations.json', function(nations) {
  console.log("here", nations);
  var bisect = d3.bisector(function(d) { return d[0]; });

  function interpolateData(year) {
    return nations.map(function(d) {
      return {
        name: d.name,
        region: d.region,
        income: interpolateValues(d.income, year),
        population: interpolateValues(d.population, year),
        lifeExpectancy: interpolateValues(d.lifeExpectancy, year)
      };
    });
  }

  function interpolateValues(values, year) {
    var i = bisect.left(values, year, 0, values.length - 1),
    a = values[i];
    if (i > 0) {
      var b = values[i - 1],
      t = (year - a[0]) / (b[0] - a[0]);
      return a[1] * (1 - t) + b[1] * t;
    }
    return a[1];
  }

  var dot = svg.append("g")
  .selectAll(".dot")
  .data(interpolateData(1800))
  .enter()
  .append("circle")
  .attr("class", "dot")
  .attr("r", function(d) {
    return radiusScale(d.population);
  })
  .attr("cx", function(d) {
    return xScale(d.income);
  })
  .attr("cy", function(d) {
    return yScale(d.lifeExpectancy);
  })
  .style("fill", function(d) {
    return colorScale(d.region);
  });
  dot.sort(order);


  dot.append("title")
  .text(key);

  var box = year_label.node().getBBox();

  
////////voronoi////////////

var tipnode = svg.append("g");
var tip_label = tipnode.append("text")      
.attr("x", 400 )
.attr("y", 440 )
.style("text-anchor", "middle")
.style("font-size", "10pt")
.text("Country: ");
var tip_bbox = tip_label.node().getBBox();
var tip_box = tipnode.insert("rect","text")
.attr("x", tip_bbox.x)
.attr("y", tip_bbox.y)
.attr("width", tip_bbox.width)
.attr("height", tip_bbox.height)
.style("fill", "#ffffff");

var voronoi = d3.voronoi()
.x(function(d) {return xScale(d.income); })
.y(function(d) { return yScale(d.lifeExpectancy); })
.extent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

var voronoiGroup = svg.append("g")
.attr("class", "voronoiWrapper")
.selectAll("path")
.data(voronoi.polygons(interpolateData(1800)))
.enter()
.append("path")
.attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
.datum(function(d) { return d; })
	//.style("stroke", "#2074A0")
	.style("stroke-opacity", 0.5)
	.style("fill", "none")
	.style("pointer-events", "all")
	.on("mouseover", function(d, i) {
    tip_label.text("Country: " + nations[i].name)
    .attr("x", xScale(nations[i].income[0]))
    .attr("y", yScale(nations[i].lifeExpectancy[0]) - 10);
    tip_bbox = tip_label.node().getBBox();
    tip_box.attr("x", tip_bbox.x)
    .attr("y", tip_bbox.y)
    .style("fill", "#7de818")
    .attr("width", tip_bbox.width)
    .attr("height", tip_bbox.height);});

  function changeVoronoi(yeardata) {
    voronoiGroup.data(voronoi.polygons(yeardata))
    .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
    .datum(function(d) {
      return d; }) 

    .style("stroke-opacity", 0.5)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", function(d, i) {
      tip_label.text("Country: " + nations[i].name)
      .attr("x", xScale(yeardata[i].income))
      .attr("y", yScale(yeardata[i].lifeExpectancy) - 10);
      tip_bbox = tip_label.node().getBBox();
      tip_box.attr("x", tip_bbox.x)
      .attr("y", tip_bbox.y)
      .style("fill", "#7de818")
      .attr("width", tip_bbox.width)
      .attr("height", tip_bbox.height);
    });
  };

  var overlay = svg.append("rect")
  .attr("class", "overlay")
  .attr("x", box.x)
  .attr("y", box.y)
  .attr("width", box.width)
  .attr("height", box.height)
  .on("mouseover", enableInteraction);


  // Start a transition that interpolates the data based on year.
  svg.transition()
  .duration(30000)
  .ease(d3.easeLinear)
  .tween("year", tweenYear)
  .on("end", enableInteraction);

  // Positions the dots based on data.
  function position(dot) {
    dot .attr("cx", function(d) { return xScale(x(d)); })
    .attr("cy", function(d) { return yScale(y(d)); })
    .attr("r", function(d) { return radiusScale(radius(d)); });
  }

  // Defines a sort order so that the smallest dots are drawn on top.
  function order(a, b) {
    return radius(b) - radius(a);
  }

  function enableInteraction() {
    var yearScale = d3.scaleLinear()
    .domain([1800, 2009])
    .range([box.x + 10, box.x + box.width - 10])
    .clamp(true);
    // Cancel the current transition, if any.
    svg.transition().duration(0);

    overlay
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .on("mousemove", mousemove)
    .on("touchmove", mousemove);

    function mouseover() {
      year_label.classed("active", true);
    }

    function mouseout() {
      year_label.classed("active", false);
    }

    function mousemove() {
      var yearVal = yearScale.invert(d3.mouse(this)[0]);
      var yearData = interpolateData(yearVal);
      changeVoronoi(yearData);
      dot.data(yearData)
      .attr("r", function(d) {
        return radiusScale(d.population);
      })
      .attr("cx", function(d) {
        return xScale(d.income);
      })
      .attr("cy", function(d) {
        return yScale(d.lifeExpectancy);
      })
      .style("fill", function(d) {
        return colorScale(d.region);
      });
      dot.sort(order);
      year_label.text(Math.round(yearVal));
    }
  }

  // Tweens the entire chart by first tweening the year, and then the data.
  // For the interpolated data, the dots and label are redrawn.
  function tweenYear() {
    var year = d3.interpolateNumber(1800, 2009);

    return function(t) { 
      var yearval = year(t);
      var yearData = interpolateData(yearval);
      dot.data(yearData)
      .attr("r", function(d) {
        return radiusScale(d.population);
      })
      .attr("cx", function(d) {
        return xScale(d.income);
      })
      .attr("cy", function(d) {
        return yScale(d.lifeExpectancy);
      })
      .style("fill", function(d) {
        return colorScale(d.region);
      });
      dot.sort(order);
      changeVoronoi(yearData);
      year_label.text(Math.round(yearval));};
    }
  });
