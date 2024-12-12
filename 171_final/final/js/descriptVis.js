/* * * * * * * * * * * * * *
*      class DescriptVis        *
* * * * * * * * * * * * * */


class DescriptVis {

    constructor(parentElement){
        this.parentElement = parentElement;

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.descript = d3.select("#" + vis.parentElement).append("g")
            .attr('class', 'description')
            .append('text')
            .text("Wins - The number of season victories")
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate(0,40)');

        vis.wrangleData();
    }


    wrangleData(){
        let vis = this

        // merge
        vis.info = {
            wins: "The number of season victories.",
            hits: "A hit occurs when a batter strikes the baseball into fair territory and reaches base without doing so via an error or a fielder's choice.",
            runs: "A player is awarded a run if he crosses the plate to score his team a run. When tallying runs scored, the way in which a player reached base is not considered.",
            homeruns: "A home run occurs when a batter hits a fair ball and scores on the play without being put out or without the benefit of an error. In almost every instance of a home run, a batter hits the ball in the air over the outfield fence in fair territory.",
            walks: "A walk (or base on balls) occurs when a pitcher throws four pitches out of the strike zone, none of which are swung at by the hitter. After refraining from swinging at four pitches out of the zone, the batter is awarded first base.",
            SOTaken: "A strikeout occurs when a pitcher throws any combination of three swinging or looking strikes to a hitter.",

            stolenBases: "A stolen base occurs when a baserunner advances by taking a base to which he isn't entitled. This generally occurs when a pitcher is throwing a pitch.",
            caughtStealing: "A caught stealing occurs when a runner attempts to steal but is tagged out before reaching second base, third base or home plate. This typically happens after a pitch, when a catcher throws the ball to the fielder at the base before the runner reaches it.",

            ERA: "Earned run average represents the number of earned runs a pitcher allows per nine innings -- with earned runs being any runs that scored without the aid of an error or a passed ball.",
            hitsAllow: "A hit occurs when a batter strikes the baseball into fair territory and reaches base without doing so via an error or a fielder's choice.",
            homerunsAllow: "A home run occurs when a batter hits a fair ball and scores on the play without being put out or without the benefit of an error. In almost every instance of a home run, a batter hits the ball in the air over the outfield fence in fair territory.",
            walksAllow: "A walk (or base on balls) occurs when a pitcher throws four pitches out of the strike zone, none of which are swung at by the hitter. After refraining from swinging at four pitches out of the zone, the batter is awarded first base.",
            SOPitch: "A strikeout occurs when a pitcher throws any combination of three swinging or looking strikes to a hitter.",

            errors: "A fielder is given an error if, in the judgment of the official scorer, he fails to convert an out on a play that an average fielder should have made. Fielders can also be given errors if they make a poor play that allows one or more runners to advance on the bases.",
        }

        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        let categorySelector = document.getElementById('dataSelector');
        let selectedCategory = categorySelector.value;

        // Update text
        vis.descript.text(vis.info[selectedCategory]);
    }
}