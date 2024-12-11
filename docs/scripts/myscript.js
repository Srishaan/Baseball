// add your JavaScript/D3 to this file
// Sample data (replace with your actual dataset)
const data = [
  { player: "Player A", home_runs: 30 },
  { player: "Player B", home_runs: 25 },
  { player: "Player C", home_runs: 28 },
  { player: "Player D", home_runs: 35 }
];

// Set up SVG dimensions and margins
const margin = { top: 20, right: 30, bottom: 40, left: 50 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG container
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
  .style("text-anchor", "middle");

// Append y-axis to the SVG
svg.append("g")
  .call(d3.axisLeft(y));

// Draw bars
svg.selectAll(".bar")
  .data(data)
  .enter()
  .append("rect")
  .attr("class", "bar")
  .attr("x", d => x(d.player))
  .attr("y", d => y(d.home_runs))
  .attr("width", x.bandwidth())
  .attr("height", d => height - y(d.home_runs));

// Add labels above bars
svg.selectAll(".label")
  .data(data)
  .enter()
  .append("text")
  .attr("x", d => x(d.player) + x.bandwidth() / 2)
  .attr("y", d => y(d.home_runs) - 5)
  .attr("text-anchor", "middle")
  .text(d => d.home_runs);
