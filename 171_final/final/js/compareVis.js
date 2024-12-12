/* * * * * * * * * * * * * *
*      class CompareVis        *
* * * * * * * * * * * * * */


class CompareVis {

    constructor(parentElement, data){
        this.parentElement = parentElement;
        this.data = data;
        this.parseDate = d3.timeParse("%Y");
        this.formatDate = d3.timeFormat("%Y");

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 40, right: 0, bottom: 30, left: 35};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add team names
        vis.title1 = vis.svg.append('g')
            .attr('class', 'comparison-title1')
            .append('text')
            .text("Anaheim Angels")
            .attr('transform', `translate(${vis.width / 4 + 65}, -15)`)
            .attr('text-anchor', 'end')
            .attr("font-size", "10px");

        vis.title2 = vis.svg.append('g')
            .attr('class', 'comparison-title1')
            .append('text')
            .text("Baltimore Orioles")
            .attr('transform', `translate(${3 * vis.width / 4 - 100}, -15)`)
            .attr('text-anchor', 'start')
            .attr("font-size", "10px");

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        // Scales and axes
        vis.y = d3.scaleBand()
            .range([0, vis.height])
            .padding(0.1);

        vis.x = d3.scaleLinear()
            .range([0, vis.width/2 - 37]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(" + vis.width / 2 + ", " + vis.height + ")");

        // Second xAxis
        vis.x2 = d3.scaleLinear()
            .range([vis.width/2 - 37, 0]);

        vis.xAxis2 = d3.axisBottom()
            .scale(vis.x2);

        vis.xAxisGroup2 = vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0, " + vis.height + ")");

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + vis.width / 2 + ", 0)");

        this.wrangleData();
    }

    wrangleData(lineData){
        let vis = this

        if (lineData) {
            vis.timeData1 = lineData.data
            vis.timeValues = lineData.timeValues
        }

        let teamFilteredData = [];

        let teamCategory2 = document.getElementById('teamSelector2').value;

        vis.data.forEach(row => {
            if (row.franchID === teamCategory2) {
                teamFilteredData.push(row);
            }
        });

        vis.timeInfo = []

        // merge
        teamFilteredData.forEach(year => {
            vis.timeInfo.push(
                {
                    year: +year.yearID,
                    wins: +year.W,
                    losses: +year.L,
                    hits: +year.H,
                    runs: +year.R,
                    homeruns: +year.HR,
                    walks: +year.BB,
                    SOTaken: +year.SO,

                    stolenBases: +year.SB,
                    caughtStealing: +year.CS,

                    ERA: +year.ERA,
                    hitsAllow: +year.HA,
                    homerunsAllow: +year.HRA,
                    walksAllow: +year.BBA,
                    SOPitch: +year.SOA,

                    errors: +year.E,
                    fieldingPerc: +year.FP,

                    barColor: year.WSWin === "Y" ? "#FFA340" : year.DivWin === "Y" ? "#95CCEB" : "#4279AB"
                }
            )
        })

        vis.timeInfoCopy = vis.timeInfo;
        vis.timeData1Copy = vis.timeData1;

        if (vis.timeData1 && vis.timeValues) {
            vis.timeInfo = vis.timeInfoCopy.filter(d => d.year >= vis.timeValues[0] && d.year <= vis.timeValues[1]);
            vis.timeData1 = vis.timeData1Copy.filter(d => d.year.getFullYear() >= vis.timeValues[0] && d.year.getFullYear() <= vis.timeValues[1]);
        }

        vis.updateVis();

    }

    updateVis(){
        let vis = this;

        let teamSelector = document.getElementById('teamSelector');
        let teamSelector2 = document.getElementById('teamSelector2');

        let teamSelectorLabel = teamSelector.options[teamSelector.selectedIndex].text;
        let teamSelectorLabel2 = teamSelector2.options[teamSelector2.selectedIndex].text;

        vis.title1.text(teamSelectorLabel);
        vis.title2.text(teamSelectorLabel2);

        let categorySelector = document.getElementById('dataSelector');
        let selectedCategory = categorySelector.value;
        let selectedLabel = categorySelector.options[categorySelector.selectedIndex].text;

        vis.x.domain([0, d3.max(vis.timeInfo, d => d[selectedCategory])]);
        vis.y.domain(vis.timeInfo.map(d => d.year));

        // Bars
        vis.svg.selectAll(".bar")
            .data(vis.timeInfo)
            .join("rect")
            .attr("class", "bar")
            .attr("x", vis.width / 2)
            .attr("height", vis.y.bandwidth())
            .attr('stroke', 'black')
            .attr('stroke-width', '0.5px')
            .on('mouseover', function(event, d){
                let teamData = d;

                d3.select(this)
                    .attr('stroke-width', '1px')
                    .attr('stroke', 'black')
                    .attr('fill', 'lightgray')

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                             <h3> ${d.year}<h3>
                             <h4> ${selectedLabel}: ${d[selectedCategory]}</h4>
                         </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0.5px')
                    .attr("fill", d => d.barColor)

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition()
            .duration(1000)
            .attr("fill", d => d.barColor)
            .attr("y", d => vis.y(d.year))
            .attr("width", d => vis.x(d[selectedCategory]));

        console.log(vis.timeData1);

        // Second bar graph
        if (vis.timeData1) {
            vis.x2.domain([0, d3.max(vis.timeData1, d => d[selectedCategory])])

            vis.svg.selectAll(".bar2")
                .data(vis.timeData1)
                .join("rect")
                .attr("class", "bar2")
                .attr("height", vis.y.bandwidth())
                .attr('stroke', 'black')
                .attr('stroke-width', '0.5px')
                .on('mouseover', function(event, d){
                    let teamData = d;

                    d3.select(this)
                        .attr('stroke-width', '1px')
                        .attr('stroke', 'black')
                        .attr('fill', 'lightgray')

                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                             <h3> ${vis.formatDate(d.year)}<h3>
                             <h4> ${selectedLabel}: ${d[selectedCategory]}</h4>
                         </div>`);
                })
                .on('mouseout', function(event, d){
                    d3.select(this)
                        .attr('stroke-width', '0.5px')
                        .attr("fill", d => d.pointColor)

                    vis.tooltip
                        .style("opacity", 0)
                        .style("left", 0)
                        .style("top", 0)
                        .html(``);
                })
                .transition()
                .duration(1000)
                .attr("fill", d => d.pointColor)
                .attr("x", d => vis.x2(d[selectedCategory]))
                .attr("y", d => vis.y(parseInt(vis.formatDate(d.year))))
                .attr("width", d => (vis.width/2 - 37) - vis.x2(d[selectedCategory]));
        }

        // Update the axes
        vis.xAxisGroup
            .transition().duration(1000)
            .call(vis.xAxis);
        vis.xAxisGroup2
            .transition().duration(1000)
            .call(vis.xAxis2);
        vis.yAxisGroup
            .transition().duration(1000)
            .call(vis.yAxis);

        // Remove y-axis line
        vis.yAxisGroup.selectAll(".domain,.tick>line")
            .style("opacity",1)
            .transition()
            .duration(1000)
            .style("opacity",0)
            .remove();

    }



}