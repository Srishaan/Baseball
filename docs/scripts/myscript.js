// Sample data
const data = [
  { player: "Player A", home_runs: 30 },
  { player: "Player B", home_runs: 25 },
  { player: "Player C", home_runs: 28 },
  { player: "Player D", home_runs: 35 }
];

// Set up SVG dimensions and margins
const margin = { top: 20, right: 30, bottom: 70, left: 60 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG container for bar chart
const svg = d3.select("#plot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create x-axis scale
const x = d3.scaleBand()
  .domain(data.map(d => d.player))
  .range([0, width])
  .padding(0.2);

// Create y-axis scale
const y = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.home_runs)])
  .nice()
  .range([height, 0]);

// Append x-axis to the SVG
svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x))
  .selectAll("text")
  .attr("transform", "rotate(-45)")
  .style("text-anchor", "end")
  .style("font-size", "12px");

// Append y-axis to the SVG
svg.append("g")
  .call(d3.axisLeft(y));

// Define color scale
const colorScale = d3.scaleSequential()
  .domain([0, d3.max(data, d => d.home_runs)])
  .interpolator(d3.interpolateBlues);

// Add tooltip div
const tooltip = d3.select("#plot")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background-color", "white")
  .style("border", "1px solid #ddd")
  .style("padding", "10px")
  .style("border-radius", "5px")
  .style("box-shadow", "0px 0px 10px rgba(0, 0, 0, 0.1)");

// Draw bars with dynamic colors
svg.selectAll(".bar")
  .data(data)
  .enter()
  .append("rect")
  .attr("class", "bar")
  .attr("x", d => x(d.player))
  .attr("y", d => y(d.home_runs))
  .attr("width", x.bandwidth())
  .attr("height", d => height - y(d.home_runs))
  .attr("fill", d => colorScale(d.home_runs))
  .on("mouseover", function (event, d) {
    tooltip.transition().duration(200).style("opacity", 1);
    tooltip
      .html(`<strong>${d.player}</strong><br>Home Runs: ${d.home_runs}`)
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 28 + "px");
    d3.select(this).attr("fill", "#ffa07a");
  })
  .on("mouseout", function (event, d) {
    tooltip.transition().duration(200).style("opacity", 0);
    d3.select(this).attr("fill", colorScale(d.home_runs));
  })
  .transition()
  .duration(1000)
  .attr("height", d => height - y(d.home_runs))
  .attr("y", d => y(d.home_runs));

// Add labels above bars
svg.selectAll(".label")
  .data(data)
  .enter()
  .append("text")
  .attr("x", d => x(d.player) + x.bandwidth() / 2)
  .attr("y", d => y(d.home_runs) - 5)
  .attr("text-anchor", "middle")
  .style("font-size", "12px")
  .style("fill", "black")
  .text(d => d.home_runs);

// Add a pie chart
const pieData = data.map(d => d.home_runs);
const radius = Math.min(width, height) / 2 - 10;

const pieSvg = d3.select("#plot")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

const pie = d3.pie();
const arc = d3.arc().innerRadius(0).outerRadius(radius);

const pieColor = d3.scaleOrdinal(d3.schemeTableau10);

pieSvg.selectAll("path")
  .data(pie(pieData))
  .enter()
  .append("path")
  .attr("d", arc)
  .attr("fill", (d, i) => pieColor(i))
  .attr("stroke", "white")
  .style("stroke-width", "2px")
  .on("mouseover", function (event, d, i) {
    tooltip.transition().duration(200).style("opacity", 1);
    tooltip
      .html(`Home Runs: ${d.data}`)
      .style("left", event.pageX + "px")
      .style("top", event.pageY + "px");
  })
  .on("mouseout", function () {
    tooltip.transition().duration(200).style("opacity", 0);
  });
