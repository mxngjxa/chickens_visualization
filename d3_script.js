import define1 from "./helper.js";

function _1(md){return(
md`# Garden Chickens Timeline
Data provided by Prof. Dong Xianjun, original spreadsheet can be found [here](https://docs.google.com/spreadsheets/d/1GCvYFv9Pqc0H12itqHtpfBVSDR87uFGcJY2aniJgJk0/edit?gid=0#gid=0).

`
)}

function _sorting(select){return(
select({title: 'Sorted by', options:["batch", "color"], value:"color"})
)}

function _chart(sorting,dataByFeatherColor,data,d3,color,DOM,width,height,margin,createTooltip,y,getRect,getTooltipContent,axisTop,axisBottom)
{

  let filteredData;
  if(sorting !== "color") {
    filteredData = [].concat.apply([], dataByFeatherColor.map(d=>d.values));
  } else { 
    filteredData = data.sort((a,b) => a.start - b.start);
  }

  filteredData.forEach(d => d.color = d3.color(color(d.color)))


  let parent = this; 
  if (!parent) {
    parent = document.createElement("div");
    const svg = d3.select(DOM.svg(width, height));


    const g = svg.append("g").attr("transform", (d,i)=>`translate(${margin.left} ${margin.top})`);

    const groups = g
    .selectAll("g")
    .data(filteredData)
    .enter()
    .append("g")
    .attr("class", "civ")


    const tooltip = d3.select(document.createElement("div")).call(createTooltip);

    const line = svg.append("line").attr("y1", margin.top-10).attr("y2", height-margin.bottom).attr("stroke", "rgba(0,0,0,0.2)").style("pointer-events","none");

    groups.attr("transform", (d,i)=>`translate(0 ${y(i)})`)

    groups
      .each(getRect)
      .on("mouseover", function(d) {
      d3.select(this).select("rect").attr("fill", d.color.darker())

      tooltip
        .style("opacity", 1)
        .html(getTooltipContent(d))
    })
      .on("mouseleave", function(d) {
      d3.select(this).select("rect").attr("fill", d.color)
      tooltip.style("opacity", 0)
    })


    svg
      .append("g")
      .attr("transform", (d,i)=>`translate(${margin.left} ${margin.top-10})`)
      .call(axisTop)

    svg
      .append("g")
      .attr("transform", (d,i)=>`translate(${margin.left} ${height-margin.bottom})`)
      .call(axisBottom)



    svg.on("mousemove", function(d) {

      let [x,y] = d3.mouse(this);
      line.attr("transform", `translate(${x} 0)`);
      y +=20;
      if(x>width/2) x-= 100;

      tooltip
        .style("left", x + "px")
        .style("top", y + "px")
    })

    parent.appendChild(svg.node());
    parent.appendChild(tooltip.node());
    parent.groups = groups;

  } else {


    const civs = d3.selectAll(".civ")

    civs.data(filteredData, d=>d.name)
      .transition()
      // .delay((d,i)=>i*10)
      .ease(d3.easeCubic)
      .attr("transform", (d,i)=>`translate(0 ${y(i)})`)


  }
  return parent

}


function _getTooltipContent(formatDate){
  return(
    function(d) {
      return `<b>${d.name}</b>
              <br/>
              <b style="color:${d.color.darker()}">${d.color}</b>
              <br/>
              ${formatDate(d.start)} - ${formatDate(d.end)}`
              }
          )
        }

function _height() {
  return 1000;
}

function _margin() {
  return {
    top: 30,
    right: 30,
    bottom: 30,
    left: 30
  };
}

function _y(d3, data, height, margin) {
  return d3.scaleBand()
    .domain(d3.range(data.length))
    .range([0, height - margin.bottom - margin.top])
    .padding(0.2);
}

function _x(d3, data, width, margin) {
  return d3.scaleLinear()
    .domain([d3.min(data, d => d.start), d3.max(data, d => d.end)])
    .range([0, width - margin.left - margin.right]);
}


function _createTooltip() {
  return function(el) {
    el
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("top", 0)
      .style("opacity", 0)
      .style("background", "white")
      .style("border-radius", "5px")
      .style("box-shadow", "0 0 10px rgba(0,0,0,.25)")
      .style("padding", "10px")
      .style("line-height", "1.3")
      .style("font", "11px sans-serif");
  }
}

function _getRect(d3, x, width, y) {
  return function(d) {
    const el = d3.select(this);
    const sx = x(d.start);
    const w = x(d.end) - x(d.start);
    const isLabelRight = (sx > width / 2 ? sx + w < width : sx - w > 0);

    el.style("cursor", "pointer");

    el
      .append("rect")
      .attr("x", sx)
      .attr("height", y.bandwidth())
      .attr("width", w)
      .attr("fill", d.color);

    el
      .append("text")
      .text(d.name)
      .attr("x", isLabelRight ? sx - 5 : sx + w + 5)
      .attr("y", y.bandwidth() / 2)
      .attr("dy", "0.35em") // This vertically centers the text within the rect
      .attr("fill", "black")
      .style("text-anchor", isLabelRight ? "end" : "start")
      .style("dominant-baseline", "middle");
  }
}

function _dataByBatch(d3,data){
  return (d3.nest().key(d=>d.batch).entries(data)
)} 

function _dataByFeatherColor(d3,data){
  return(d3.nest().key(d=>d.color).entries(data)
)}

function _axisBottom(d3,x,formatDate){
  return(
    d3.axisBottom(x)
      .tickPadding(2)
      .tickFormat(formatDate)
)}

function _axisTop(d3,x,formatDate){return(
d3.axisTop(x)
    .tickPadding(2)
    .tickFormat(formatDate)
)}

function _formatDate(){return(
d=> d < 0 ? `${-d}BC` : `${d}AD`
)}

function _d3(require){return(
require("d3@5")
)}

async function _csv(d3,FileAttachment){return(
d3.csvParse(await FileAttachment("chickens.csv").text())
)}

function _data(csv) {
  return csv.map(d => {
    return {
      ...d,
      start: +d.start,
      end: +d.end
    };
  }).sort((a, b) => a.start - b.start);
}


function _batch(d3,data){return(
d3.nest().key(d=>d.batch).entries(data).map(d=>d.batch)
)}

function _batches(dataByBatch){return(
dataByBatch.map(d=>d.batch)
)}

function _color(d3,batch){return(
d3.scaleOrdinal(d3.schemeSet2).domain(batch)
)}

function _23(html){return(
html`CSS<style> svg{font: 11px sans-serif;}</style>`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["chickens.csv", {url: new URL("./data/chickens.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("viewof sorting")).define("viewof sorting", ["select"], _sorting);
  main.variable(observer("sorting")).define("sorting", ["Generators", "viewof sorting"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["sorting","dataByBatch","data","d3","color","DOM","width","height","margin","createTooltip","y","getRect","getTooltipContent","axisTop","axisBottom"], _chart);
  main.variable(observer("getTooltipContent")).define("getTooltipContent", ["formatDate"], _getTooltipContent);
  main.variable(observer("height")).define("height", _height);
  main.variable(observer("y")).define("y", ["d3","data","height","margin"], _y);
  main.variable(observer("x")).define("x", ["d3","data","width","margin"], _x);
  main.variable(observer("margin")).define("margin", _margin);
  main.variable(observer("createTooltip")).define("createTooltip", _createTooltip);
  main.variable(observer("getRect")).define("getRect", ["d3","x","width","y"], _getRect);
  main.variable(observer("dataByBatch")).define("dataByBatch", ["d3","data"], _dataByBatch);
  main.variable(observer("dataByFeatherColor")).define("dataByFeatherColor", ["d3","data"], _dataByFeatherColor);
  main.variable(observer("axisBottom")).define("axisBottom", ["d3","x","formatDate"], _axisBottom);
  main.variable(observer("axisTop")).define("axisTop", ["d3","x","formatDate"], _axisTop);
  main.variable(observer("formatDate")).define("formatDate", _formatDate);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer("csv")).define("csv", ["d3","FileAttachment"], _csv);
  main.variable(observer("data")).define("data", ["csv"], _data);
  main.variable(observer("batch")).define("batch", ["d3","data"], _batch);
  main.variable(observer("batches")).define("batches", ["dataByBatch"], _batches);
  main.variable(observer("color")).define("color", ["d3","batch"], _color);
  const child1 = runtime.module(define1);
  main.import("checkbox", child1);
  main.import("select", child1);
  main.variable(observer()).define(["html"], _23);
  return main;
}
