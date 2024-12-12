/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class BarVis {

    constructor(parentElement, data){
        this.parentElement = parentElement;
        this.data = data;
        this.parseDate = d3.timeParse("%m/%d/%Y");

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 50, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.svg.append('rect')
            .attr("x", vis.width - 190)
            .attr("y", -10)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", "#FFA340")
            .attr("stroke", "black")
            .attr("stroke-width", "0.5px");

        vis.svg.append("text")
            .text(" - Indicates World Series winner")
            .attr('transform', `translate(${vis.width - 170}, 0)`)
            .attr("style", "font-size: .7em")

        vis.svg.append('rect')
            .attr("x", vis.width - 190)
            .attr("y", 10)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", "#95CCEB")
            .attr("stroke", "black")
            .attr("stroke-width", "0.5px");

        vis.svg.append("text")
            .text(" - Indicates divisional winner")
            .attr('transform', `translate(${vis.width - 170}, 20)`)
            .attr("style", "font-size: .7em")


        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        // Scales and axes
        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.1);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0, " + vis.height + ")");

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis");

        this.wrangleData();
    }

    wrangleData(){
        let vis = this

        let timeFilteredData = [];

        let yearCategory = document.getElementById('categorySelector').value;

        vis.data.forEach(row => {
            if (row.yearID === yearCategory) {
                timeFilteredData.push(row);
            }
        });

        vis.teamInfo = []

        timeFilteredData.forEach(team => {
            vis.teamInfo.push(
                {
                    team: team.name,
                    teamAbr: team.teamIDBR,
                    wins: +team.W,
                    losses: +team.L,
                    hits: +team.H,
                    runs: +team.R,
                    homeruns: +team.HR,
                    walks: +team.BB,
                    SOTaken: +team.SO,

                    stolenBases: +team.SB,
                    caughtStealing: +team.CS,

                    ERA: +team.ERA,
                    hitsAllow: +team.HA,
                    homerunsAllow: +team.HRA,
                    walksAllow: +team.BBA,
                    SOPitch: +team.SOA,

                    errors: +team.E,
                    fieldingPerc: +team.FP,

                    barColor: team.WSWin === "Y" ? "#FFA340" : team.DivWin === "Y" ? "#95CCEB" : "#4279AB"
                }
            )
        })

        let selectedCategory = document.getElementById('dataSelector').value;

        vis.teamInfo.sort((a,b) => {return b[selectedCategory] - a[selectedCategory]});

        let selectedFilter = document.getElementById('filterSelector').value;
        if (selectedFilter !== "all") {
            vis.teamInfo = vis.teamInfo.slice(0, 30 - parseInt(selectedFilter));
        }

        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        let categorySelector = document.getElementById('dataSelector');
        let selectedCategory = categorySelector.value;
        let selectedLabel = categorySelector.options[categorySelector.selectedIndex].text;

        // Update title
        d3.select("#barTitle")["_groups"][0][0].innerText = selectedLabel + " by Team";

        vis.y.domain([0, d3.max(vis.teamInfo, d => d[selectedCategory])]);
        vis.x.domain(vis.teamInfo.map(d => d.teamAbr));

        // Bars
        vis.svg.selectAll(".bar")
            .data(vis.teamInfo)
            .join("rect")
            .attr("class", "bar")
            .attr("width", vis.x.bandwidth())
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
                             <h3> ${d.team}<h3>
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
            .attr("x", d => vis.x(d.teamAbr))
            .attr("y", d => vis.y(d[selectedCategory]))
            .attr("height", d => vis.height - vis.y(d[selectedCategory]));

        // Update the axes
        vis.xAxisGroup
            .transition().duration(1000)
            .call(vis.xAxis);
        vis.yAxisGroup
            .transition().duration(1000)
            .call(vis.yAxis);

    }



}