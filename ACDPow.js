// JavaScript source code

function FlareBase(name, value, obj) {
    this.instance = { "name": name, "value": value, "other": obj }
}
FlareBase.prototype = {
    constructor: FlareBase
}

function FlareParent(name, children, obj) {
    console.log(obj)
    this.instance = { "name": name, "children": children, "other": obj }
}
FlareParent.prototype = {
    constructor: FlareParent
}

function ADCPow() {
    this.flareJson = {};
    this.Type = "CLIENT"; //reserved for future, sets a flag that will cause a switch in the produceFlare method below
    this.SpaceUsageType = { 0: "RESERVED", 1: "CONTRACTED" }
    this.PodBuildoutType = { 0: "FREE", 1: "BUILT" }
    this.PodUsageType = { 0: "PROD", 1: "DR" }
}

ADCPow.prototype = {
    constructor: ADCPow,
    FreshSite: function (clientname, siteName, squareFeetRequested, powerRequested) {
        var other = {
            "provision_ratio": 0,
            "kW": powerRequested,
            "PCL": 0
        }
        var client = new FlareParent(clientName, [], other).instance;
        this.flareJson = client;
        var site = FlareBase(siteName, squareFeetRequested, other).instance;
        client.children.push(site);
        var div = "#chartDiv";
        var em = new EMD3(div);
        em.makeSunburstChart(this.flareJson)
    }

}

function EMD3(divname) {
    this.aDiv = divname;
}

EMD3.prototype = {
    constructor: EMD3,
    makeSunburstChart: function (flare) {

        var formatNumber = d3.format(".2");

        var margin = { top: 20, right: 20, bottom: 30, left: 50 },
            width = parseInt(d3.select(this.aDiv).style('width'), 10) - margin.left - margin.right,
            height = parseInt(d3.select(this.aDiv).style('height'), 10) - margin.top - margin.bottom,
	        radius = Math.min(width, height) / 2;


        console.log(width, height);
        var x = d3.scaleLinear()
            .range([0, 2 * Math.PI]);

        var y = d3.scaleLinear()
            .range([0, radius]);

        var colorRange = ["#E7601F", "#F6834B", "#FFB981", "#FFD2BC", "#006666", "#2E97E2", "#61B1EB", "#8CCDFF", "#D1EBFF", "#EEEEEE"];
        colorRange.reverse();
        var color = d3.scaleQuantize()
            .domain([0, 1])
            .range(colorRange);

        var partition = d3.partition();

        var arc = d3.arc()
            .startAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
            .endAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
            .innerRadius(function (d) { return Math.max(0, y(d.y0)); })
            .outerRadius(function (d) { return Math.max(0, y(d.y1)); });


        var svg = d3.select(this.aDiv).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // filters go in defs element
        var defs = svg.append("defs");

        // create filter with id #drop-shadow
        // height=130% so that the shadow is not clipped
        var filter = defs.append("filter")
            .attr("id", "drop-shadow")
            .attr("width", "115%")
            .attr("height", "115%");

        // SourceAlpha refers to opacity of graphic that this filter will be applied to
        // convolve that with a Gaussian with standard deviation 3 and store result
        // in blur
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 4)
            .attr("result", "blur");

        //filter.append("feSpecularLighting")
        //    .attr("in", "blur")
        //    .attr("surfaceScale", 5)
        //    .attr("specularExponent", 20)
        //    .attr("lighting-color", "#ffffff")
        //    .attr("result", "specOut");



        filter.append('feColorMatrix')
          .attr('in', 'specOut')
          .attr('type', 'matrix')
          .attr('values', '1 0 0 0 1  0 1 0 0 1  0 0 1 0 1  0 0 0 1 0')
          .attr("result", "colorBlur");

        // translate output of Gaussian blur to the right and downwards with 2px
        // store result in offsetBlur
        filter.append("feOffset")
            .attr("in", "colorBlur")
            //.attr("color","#ffffff")
            .attr("dx", 1)
            .attr("dy", 1)
            .attr("result", "offsetBlur");

        // overlay original SourceGraphic over translated blurred opacity by using
        // feMerge filter. Order of specifying inputs is important!
        var feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");

        d3.json(flare.flareJson, function (error, root) {
            console.log("Final root json", root);

            //turn into something I can throw into d3.hierarchy and subsequently pass in as root
            var root = d3.hierarchy(root);
            root.sum(function (d) { //console.log(d.value); 
                return d.value;
            });
            svg.selectAll("path")
                .data(partition(root).descendants())
                .enter().append("path")
                .attr("d", arc)
                .attr("stroke", "#ffffff")
                .attr("stroke-width", "2px")
                .style("fill", function (d) {
                    return color(d.data.other.provision_ratio);
                })
                .style("filter", "url(#drop-shadow)")
                //.attr("class","flare-section")
                .on("mouseover", function (d) {
                    //console.log(this);
                    var arc = d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("stroke", "#bbbbbb")
                        .attr("stroke-width", "6px")
                    //.transition()
                    //.duration(700)
                    //.attr("stroke", "#ffffff")
                    //.attr("stroke-width", "2px")
                    //.style("fill", "purple")
                })
                .on("mouseout", function (d) {
                    d3.select(this)
                        .transition()
                        .duration(10)
                        .attr("stroke", "#ffffff")
                        .attr("stroke-width", "2px")
                    //.style("fill", function (d) { return color(d.data.other.provision_ratio); })
                })
                .on("click", function (d) { console.log(d); click(this, d, arcTweenClick); })
                .append("title")
                .text(function (d) {
                    //console.log(d)
                    var t = d.data.name + "\n";
                    t += d.value + " Square Feet" + "\n";
                    t += formatNumber(d.data.other.provision_ratio * 100) + "% of provisioned capacity";
                    return t;
                });
        });
        //reformat data
        //var flare = new Flare();
        //flare.produceFlare(retdata);
        //console.log("Final root json", flare.flareJson);
        //flare.produceFlareComplete(retdata);
        
        
    }
}