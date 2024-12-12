/* * * * * * * * * * * * * *
*      class LineVis        *
* * * * * * * * * * * * * */


class LineVis {
    constructor(parentElement, data){
        this.parentElement = parentElement;
        this.data = data;
        this.parseDate = d3.timeParse("%Y");
        this.formatDate = d3.timeFormat("%Y");

        this.initVis()
    }

    initVis(){
        let vis = this;

        console.log(document.getElementById(vis.parentElement))

        vis.margin = {top: 60, right: 40, bottom: 50, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.svg.append('rect')
            .attr("x", vis.width - 150)
            .attr("y", -50)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", "#FFA340")
            .attr("stroke", "black")
            .attr("stroke-width", "0.5px");

        vis.svg.append("text")
            .text(" - Indicates World Series win")
            .attr('transform', `translate(${vis.width - 130}, -40)`)
            .attr("style", "font-size: .7em")

        vis.svg.append('rect')
            .attr("x", vis.width - 150)
            .attr("y", -30)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", "#95CCEB")
            .attr("stroke", "black")
            .attr("stroke-width", "0.5px");

        vis.svg.append("text")
            .text(" - Indicates divisional win")
            .attr('transform', `translate(${vis.width - 130}, -20)`)
            .attr("style", "font-size: .7em")

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        // Scales and axes
        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.x = d3.scaleTime()
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

        vis.path = vis.svg.append("path")
            .attr("class", "line");

        this.createSlider();

        this.wrangleData();
    }

    createSlider() {
        let vis = this;
        let slider = document.getElementById("slider");

        noUiSlider.create(slider, {
            start: [1998,2023],
            connect: true,
            step: 1,
            margin: 5,
            range: {
                'min': 1998,
                'max': 2023
            },
            tooltips: false,
            format: {
                to: function(value) {
                    return Math.round(value);
                },
                from: function(value) {
                    return Number(value);
                }
            }
        });

        // When slide is changed filter the data to only include slider values
        slider.noUiSlider.on('slide', function (values) {
            vis.timeValues = values
            vis.timeInfo = vis.timeInfoCopy.filter(d => d.year.getFullYear() >= values[0] && d.year.getFullYear() <= values[1]);
            vis.updateVis();
            comparison();
        });
    }

    wrangleData(){
        let vis = this

        let teamFilteredData = [];

        let teamCategory = document.getElementById('teamSelector').value;

        vis.data.forEach(row => {
            if (row.franchID === teamCategory) {
                teamFilteredData.push(row);
            }
        });

        vis.timeInfo = []

        // merge
        teamFilteredData.forEach(year => {
            vis.timeInfo.push(
                {
                    year: vis.parseDate(year.yearID),
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

                    pointColor: year.WSWin === "Y" ? "#FFA340" : year.DivWin === "Y" ? "#95CCEB" : "#4279AB"
                }
            )
        })

        vis.timeInfoCopy = vis.timeInfo;

        vis.updateVis()

    }

    getData() {
        return {data: this.timeInfoCopy,
                timeValues: this.timeValues
        };
    }

    updateVis(){
        let vis = this;

        let categorySelector = document.getElementById('dataSelector');
        let selectedCategory = categorySelector.value;
        let selectedLabel = categorySelector.options[categorySelector.selectedIndex].text;

        // Update title
        d3.select("#lineTitle")["_groups"][0][0].innerText = selectedLabel + " by Year";

        vis.y.domain([d3.min(vis.timeInfo, d => d[selectedCategory]) - 10, d3.max(vis.timeInfo, d => d[selectedCategory])]);
        vis.x.domain([d3.min(vis.timeInfo, d => d.year), d3.max(vis.timeInfo, d => d.year)]);

        vis.line = d3.line()
            .x(d => vis.x(d.year))
            .y(d => vis.y(d[selectedCategory]));

        vis.path
            .datum(vis.timeInfo)
            .transition().duration(1000)
            .attr("d", vis.line)
            .attr("fill", "none")
            .attr("stroke", "black");

        // Points
        vis.svg.selectAll(".point")
            .data(vis.timeInfo)
            .join("circle")
            .attr("class", "point")
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
            .attr("cx", d => vis.x(d.year))
            .attr("cy", d => vis.y(d[selectedCategory]));

        // Update the axes
        vis.xAxisGroup
            .transition().duration(1000)
            .call(vis.xAxis);
        vis.yAxisGroup
            .transition().duration(1000)
            .call(vis.yAxis);

    }
}