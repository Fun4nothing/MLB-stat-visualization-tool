/* * * * * * * * * * * * * *
*      class ScatterVis        *
* * * * * * * * * * * * * */


class ScatterVis {

    constructor(parentElement, data, type){
        this.parentElement = parentElement;
        this.data = data;
        this.type = type;
        this.parseDate = d3.timeParse("%m/%d/%Y");

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 45, right: 40, bottom: 30, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.title = vis.svg.append('g')
            .attr('class', 'title scatter-title')
            .append('text')
            .text("Title")
            .attr('transform', `translate(${vis.width / 2}, -20)`)
            .attr('text-anchor', 'middle');

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        // Scales and axes
        // Color scale

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.x = d3.scaleLinear()
            .range([0, vis.width]);

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

        // merge
        timeFilteredData.forEach(team => {
            vis.teamInfo.push(
                {
                    team: team.name,
                    teamAbr: team.teamIDBR,
                    hits: +team.H,
                    runs: +team.R,

                    doublePlays: +team.DP,
                    errors: +team.E,

                    stolenBases: +team.SB,
                    caughtStealing: +team.CS,

                    SOPitch: +team.SOA,
                    walksAllow: +team.BBA,

                    pointColor: team.WSWin === "Y" ? "#FFA340" : team.DivWin === "Y" ? "#95CCEB" : "#4279AB"
                }
            )
        })

        let selectedFilter = document.getElementById('filterSelector').value;
        if (selectedFilter !== "all") {
            vis.teamInfo = vis.teamInfo.slice(0, 30 - parseInt(selectedFilter));
        }

        vis.linePoints =
                vis.type === "H/R" ?
            vis.calculateRegression(vis.teamInfo, "runs", "hits"):
                vis.type === "SOA/BBA" ?
            vis.calculateRegression(vis.teamInfo, "walksAllow", "SOPitch"):
                vis.type === "SB/CS" ?
            vis.calculateRegression(vis.teamInfo, "caughtStealing", "stolenBases"):
            vis.calculateRegression(vis.teamInfo, "errors", "doublePlays");

        vis.updateVis()

    }

    calculateRegression(data, xValue, yValue) {
        // Initialize sums
        let n = data.length;
        let sum = 0, xSum = 0, ySum = 0, sumSq = 0;

        // Calculate sums
        data.forEach(team => {
            let x = team[xValue];
            let y = team[yValue];

            sum += x * y;
            xSum += x;
            ySum += y;
            sumSq += x ** 2;
        });

        // Calculate slope (m) and y-intercept (b)
        let a = sum * n;
        let b = xSum * ySum;
        let c = sumSq * n;
        let d = xSum ** 2;

        let m = (a - b) / (c - d);
        let yInt = (ySum - m * xSum) / n;

        // Compute line points
        let xMin = d3.min(data, d => d[xValue]);
        let xMax = d3.max(data, d => d[yValue]);

        return {
            A: {
                x: xMin,
                y: m * xMin + yInt
            },
            B: {
                x: xMax,
                y: m * xMax + yInt
            }

        };
    }

    updateVis(){
        let vis = this;
        let yearCategory = document.getElementById('categorySelector').value;

        let xcat =
            vis.type === "H/R" ? "runs":
            vis.type === "SOA/BBA" ? "walksAllow":
            vis.type === "SB/CS" ? "caughtStealing":
                "errors";
        let ycat =
            vis.type === "H/R" ? "hits":
            vis.type === "SOA/BBA" ? "SOPitch":
            vis.type === "SB/CS" ? "stolenBases":
                "doublePlays";

        // Update title
        vis.type === "H/R" ?
            vis.title.text("Hitting Efficiency by Team " + yearCategory + " (Hits/Runs)"):
        vis.type === "SOA/BBA" ?
            vis.title.text("Pitching Efficiency by Team " + yearCategory + " (Strikeouts/Walk)"):
        vis.type === "SB/CS" ?
            vis.title.text("Stealing Efficiency by Team " + yearCategory + " (Steals/Caught Stealing)"):
            vis.title.text("Fielding Efficiency by Team " + yearCategory + " (Double Plays/Error)");

        vis.y.domain([d3.min(vis.teamInfo, d => d[ycat]) - 30, d3.max(vis.teamInfo, d => d[ycat])]);
        vis.x.domain([d3.min(vis.teamInfo, d => d[xcat]) - 1, d3.max(vis.teamInfo, d => d[xcat])]);

        console.log(vis.linePoints)

        // Regression line
        vis.svg.selectAll(".regressionLine")
            .data([0])
            .join("line")
            .attr("class", "regressionLine")
            .attr("style", "stroke:red")
            .transition()
            .duration(1000)
            .attr('x1', vis.x(vis.linePoints.A.x))
            .attr('x2', vis.linePoints.B.x < vis.linePoints.A.x ? vis.width - vis.x(vis.linePoints.B.x) : vis.x(vis.linePoints.B.x))
            .attr('y1', vis.y(vis.linePoints.A.y))
            .attr('y2', vis.linePoints.B.x < vis.linePoints.A.x ? vis.height - vis.y(vis.linePoints.B.y) : vis.y(vis.linePoints.B.y));

        // Points
        vis.svg.selectAll(".scatter")
            .data(vis.teamInfo)
            .join("circle")
            .attr("class", "scatter")
            .attr("r", 5)
            .attr('stroke', 'black')
            .attr("stroke-width", "0.5px")
            .on('mouseover', function(event, d){

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
                             <h4> ${vis.type === "H/R" ? "Hits":
                                    vis.type === "SOA/BBA" ? "Strikeouts":
                                    vis.type === "SB/CS" ? "Stolen Bases":
                                    "Double Plays"}: ${d[ycat]}</h4>
                             <h4> ${vis.type === "H/R" ? "Runs": 
                                    vis.type === "SOA/BBA" ? "Walks":
                                    vis.type === "SB/CS" ? "Caught Stealing":
                                    "Errors"}: ${d[xcat]}</h4>
                             <h4> ${vis.type === "H/R" ? "Hits/Run": 
                                    vis.type === "SOA/BBA" ? "Strikeouts/Walk":
                                    vis.type === "SB/CS" ? "Steals/Caught Stealing":
                                    "Double Plays/Error"}: ${(Math.round(d[ycat]/d[xcat] * 100) / 100).toFixed(2)}</h4>
                             <!-- Format as a percentage but keep decimal 1 to 1 hence division by 100 -->
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
            .attr("cx", d => vis.x(d[xcat]))
            .attr("cy", d => vis.y(d[ycat]));


        // Update the axes
        vis.xAxisGroup
            .transition().duration(1000)
            .call(vis.xAxis);
        vis.yAxisGroup
            .transition().duration(1000)
            .call(vis.yAxis);

    }
}