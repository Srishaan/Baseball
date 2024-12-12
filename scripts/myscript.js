// Batting data
const batRowConverter = function (d) {
  return {
    fWAR: +d.fWAR,
    pick_round: +d.pick_round, 
    pick_number: +d.pick_number, 
    person_full_name: d.person_full_name, 
    person_bat_side_code: d.person_bat_side_code 
  };
};

d3.csv("https://raw.githubusercontent.com/a1anw0ng/Baseball/refs/heads/main/data/subsets/bat_stats_subset.csv", batRowConverter)
  .then(function (data) {
    // Filter out invalid `pick_round` values 
    const filteredData = data.filter(d => d.pick_round !== 1000);

    const margin = { top: 20, right: 150, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#bat_plot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
      
      svg.append("text")
        .attr("class", "x-axis-title")
        .attr("text-anchor", "middle")
        .attr("x", margin.left + width / 2)
        .attr("y", height + margin.top + margin.bottom - 10)
        .text("Draft Round");
      
      svg.append("text")
        .attr("class", "y-axis-title")
        .attr("text-anchor", "middle")
        .attr("x", -(margin.top + height / 2))
        .attr("y", margin.left - 50)
        .attr("transform", "rotate(-90)")
        .text("WAR (Wins Above Replacement)");

    // Zooming
    const zoomGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const tooltip = d3.select("body")
      .append("div")
      .style("visibility", "hidden")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("box-shadow", "0px 0px 10px rgba(0, 0, 0, 0.1)");

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.pick_round) + 1])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, Math.max(0.5, d3.max(filteredData, d => d.fWAR))]) 
      .range([height, 0]);
      
    const colorScale = d3.scaleOrdinal()
      .domain(["R", "L", "S"]) 
      .range(["steelblue", "orange", "green"]);

    const xAxisGroup = zoomGroup.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).ticks(Math.ceil(d3.max(filteredData, d => d.pick_round)))); 

    const yAxisGroup = zoomGroup.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));

    const points = zoomGroup.selectAll(".dot")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.pick_round))
      .attr("cy", d => yScale(d.fWAR))
      .attr("r", 4)
      .attr("fill", d => colorScale(d.person_bat_side_code)) 
      .on("mouseover", function (event, d) {
        tooltip.style("visibility", "visible")
          .html(`
            <strong>${d.person_full_name}</strong><br>
            WAR: ${d.fWAR}<br>
            Draft Round: ${d.pick_round}<br>
            Pick #: ${d.pick_number}
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
        d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
      })
      .on("mousemove", function (event) {
        tooltip.style("left", `${event.pageX + 10}px`)
               .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
        d3.select(this).attr("stroke", "none");
      });

    // Add zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([1, 20]) 
      .translateExtent([[-width, -height], [2 * width, 2 * height]])
      .on("zoom", function (event) {
        const transform = event.transform;

        const newXScale = transform.rescaleX(xScale);
        const newYScale = transform.rescaleY(yScale);

        const xAxisTicks = Math.max(5, Math.floor((newXScale.domain()[1] - newXScale.domain()[0]) / 0.5));

        xAxisGroup.call(d3.axisBottom(newXScale).ticks(Math.ceil(newXScale.domain()[1]))); 
        yAxisGroup.call(d3.axisLeft(newYScale));

        points.attr("cx", d => newXScale(d.pick_round))
              .attr("cy", d => newYScale(d.fWAR));
      });

    svg.call(zoom);

    const legend = svg.append("g")
      .attr("transform", `translate(${width + margin.left + 20}, ${margin.top})`);

    const legendItems = colorScale.domain().slice(0, 3); 
    legend.selectAll(".legend-item")
      .data(legendItems)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`)
      .call(g => {
        g.append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 8)
          .attr("fill", d => colorScale(d));
        
        g.append("text")
          .attr("x", 15)
          .attr("y", 5)
          .text(d => (d === "R" ? "Right-handed" : d === "L" ? "Left-handed" : "Switch-hitter"))
          .style("font-size", "12px")
          .style("alignment-baseline", "middle");
      });
  });
  
// Pitching data
const pitchRowConverter = function (d) {
  return {
    fWAR: +d.fWAR, 
    pick_round: +d.pick_round, 
    pick_number: +d.pick_number, 
    person_full_name: d.person_full_name, 
    person_pitch_hand_code: d.person_pitch_hand_code 
  };
};

d3.csv("https://raw.githubusercontent.com/a1anw0ng/Baseball/refs/heads/main/data/subsets/pitch_stats_subset.csv", pitchRowConverter)
  .then(function (data) {
    // Filter out invalid `pick_round` values (e.g., 1000 if it’s a placeholder)
    const filteredData = data.filter(d => d.pick_round !== 1000);

    const margin = { top: 20, right: 150, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#pitch_plot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
      
    svg.append("text")
      .attr("class", "x-axis-title")
      .attr("text-anchor", "middle")
      .attr("x", margin.left + width / 2)
      .attr("y", height + margin.top + margin.bottom - 10)
      .text("Draft Round");
    
    svg.append("text")
      .attr("class", "y-axis-title")
      .attr("text-anchor", "middle")
      .attr("x", -(margin.top + height / 2))
      .attr("y", margin.left - 50)
      .attr("transform", "rotate(-90)")
      .text("WAR (Wins Above Replacement)");

    // Zooming
    const zoomGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const tooltip = d3.select("body")
      .append("div")
      .style("visibility", "hidden")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("box-shadow", "0px 0px 10px rgba(0, 0, 0, 0.1)");

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.pick_round) + 1])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, Math.max(0.5, d3.max(filteredData, d => d.fWAR))]) 
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(["R", "L"])
      .range(["steelblue", "orange"]);

    const xAxisGroup = zoomGroup.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).ticks(Math.ceil(d3.max(filteredData, d => d.pick_round)))); 

    const yAxisGroup = zoomGroup.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));

    const points = zoomGroup.selectAll(".dot")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.pick_round))
      .attr("cy", d => yScale(d.fWAR))
      .attr("r", 4)
      .attr("fill", d => colorScale(d.person_pitch_hand_code))
      .on("mouseover", function (event, d) {
        tooltip.style("visibility", "visible")
          .html(`
            <strong>${d.person_full_name}</strong><br>
            WAR: ${d.fWAR}<br>
            Draft Round: ${d.pick_round}<br>
            Pick #: ${d.pick_number}
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
        d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
      })
      .on("mousemove", function (event) {
        tooltip.style("left", `${event.pageX + 10}px`)
               .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
        d3.select(this).attr("stroke", "none");
      });

    // Zooming
    const zoom = d3.zoom()
      .scaleExtent([1, 20]) 
      .translateExtent([[-width, -height], [2 * width, 2 * height]])
      .on("zoom", function (event) {
        const transform = event.transform;

        const newXScale = transform.rescaleX(xScale);
        const newYScale = transform.rescaleY(yScale);

        const xAxisTicks = Math.max(5, Math.floor((newXScale.domain()[1] - newXScale.domain()[0]) / 0.5));

        xAxisGroup.call(d3.axisBottom(newXScale).ticks(Math.ceil(newXScale.domain()[1]))); 
        yAxisGroup.call(d3.axisLeft(newYScale));

        points.attr("cx", d => newXScale(d.pick_round))
              .attr("cy", d => newYScale(d.fWAR));
      });

    svg.call(zoom);

    const legend = svg.append("g")
      .attr("transform", `translate(${width + margin.left + 20}, ${margin.top})`);

    const legendItems = colorScale.domain().slice(0, 2); // Only include the first two items
    legend.selectAll(".legend-item")
      .data(legendItems)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`)
      .call(g => {
        g.append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 8)
          .attr("fill", d => colorScale(d));
        
        g.append("text")
          .attr("x", 15)
          .attr("y", 5)
          .text(d => (d === "R" ? "Right-handed" : "Left-handed"))
          .style("font-size", "12px")
          .style("alignment-baseline", "middle");
      });
  });
