/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches
let mainBarVis,
    lineVis,
    descriptVis,
    compareVis,
    scatterBatVis,
    scatterBatVis2,
    scatterPitchVis,
    scatterPitchVis2;

let selectedTimeRange = [];
let selectedState = '';

let baseballData;
let pitchingInit = false;
let lineInit = false;

// load data using promises
let promises = [

    d3.csv("data/Teams.csv")
];

Promise.all(promises)
    .then(function (data) {
        baseballData = data;
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// initMainPage
function initMainPage(dataArray) {

    // log data
    console.log('check out the data', dataArray);

    mainBarVis = new BarVis('barDiv', dataArray[0]);
    scatterBatVis = new ScatterVis('scatterBatDiv', dataArray[0], "H/R");
    scatterBatVis2 = new ScatterVis('scatterBatDiv2', dataArray[0], "SB/CS");
    descriptVis = new DescriptVis('descriptDiv');
}

function categoryChange() {
    if (lineVis) {
        lineVis.wrangleData();
        compareVis.wrangleData(lineVis.getData());
    }
    mainBarVis.wrangleData();

    scatterBatVis.wrangleData();
    scatterBatVis2.wrangleData();

    if (scatterPitchVis) {
        scatterPitchVis.wrangleData();
        scatterPitchVis2.wrangleData();
    }

    descriptVis.wrangleData();
}

function comparison() {
    compareVis.wrangleData(lineVis.getData());
}

function carouselTypeChange() {
    switchTypeView();

    // Only initialize once
    if (!pitchingInit) {
        scatterPitchVis = new ScatterVis('scatterPitchDiv', baseballData[0], "SOA/BBA");
        scatterPitchVis2 = new ScatterVis('scatterPitchDiv2', baseballData[0], "DP/E");
        pitchingInit = true;
    }
    categoryChange();
}

function carouselTimeChange() {
    switchTimeView();

    if (!lineInit) {
        lineVis = new LineVis('lineDiv', baseballData[0]);
        compareVis = new CompareVis('compareDiv', baseballData[0]);
        lineInit = true;
    }
    categoryChange();
}



