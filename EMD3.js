function DataSampling(dataInbound) {
    this.maxDataLength = 1000;
    this.dataArray = dataInbound;
    this.startArrLength = this.dataArray.length
    this.endArray = [];
    this.minObject = {};
    this.maxObject = {};
}

DataSampling.prototype = {
    constructor: DataSampling,
    SimpleDownSample: function () {
        
        var skipCount = Math.ceil(this.startArrLength / this.maxDataLength);
        console.log("Skipcount:", skipCount)
        for(var i = 0; i < this.startArrLength; i+=skipCount)
        {
            var index = i / skipCount;
            console.log(index)
            this.endArray[index] = this.dataArray[i];
            if (this.startArrLength - i < skipCount) {
                break;
            }
        }
        //sort, then find min and max
        var b = [].concat(this.dataArray); // clones "a"
        b.sort(function (a, b) { return a.value - b.value; });
        this.minObject = b[0];
        this.maxObject = b[b.length - 1];
        //var min = Math.max.apply(Math, this.dataArray.map(function (o) { return o.value; })) //include max
        
        //var max = Math.min.apply(Math, this.dataArray.map(function (o) { return o.value; })) //include min
        this.endArray.push(this.maxObject);
        this.endArray.push(this.minObject);
        this.endArray.sort(function (a, b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return (b.timestamp - a.timestamp);
        });

        console.log("Downsampled array:", this.endArray)

    }
}

function FilterFunctions() {
}

FilterFunctions.prototype = {
    filterSites: function(sitename) {
        return function(obj) {
            if(obj.Site == sitename) return true;
        }
    },
    filterSpaceUsageTypes: function(usage){
        return function(obj) {
            if(obj.SpaceUsageType == usage) return true;
        }
    },
    filterPodBuildOuts: function(build)
    {
        return function (obj) {
            if (obj.PodBuildOutType == build) return true;
        }
    },
    filterPodUsages: function(usage){
        return function (obj) {
            if (obj.PodUsageType == usage) return true;
        }
    },
    getUnique: function (array, key) {
        var coll = array.map(function (obj) { return obj[key]; });
        var unique = coll.filter(function (v, i) { return coll.indexOf(v) == i; })
        //please remove nulls
        unique = unique.filter(function (obj) { return obj !== null; })
        return unique;
    }
}

function FlareBase(name,value,obj) {
    this.instance = { "name": name, "value": value, "other":obj }
}
FlareBase.prototype = {
    constructor: FlareBase
}

function FlareParent(name,children, obj)
{
    console.log(obj)
    this.instance = { "name": name, "children": children, "other": obj }
}
FlareParent.prototype = {
    constructor:FlareParent
}

function Flare(filetype) {
    this.flareJson = {};
    this.fileType = filetype; //reserved for future, sets a flag that will cause a switch in the produceFlare method below
    this.SpaceUsageType = { 0: "RESERVED", 1: "CONTRACTED" }
    this.PodBuildoutType = { 0: "FREE", 1: "BUILT" }
    this.PodUsageType = { 0: "PROD", 1: "DR" }
}

Flare.prototype = {
    constructor: Flare,
    //produceFlare: function (data) { //deprecated
    //    //reserve for future to switch based on the filetype passed in
    //    //for now, we are expecting an array of objects.
    //    //it is assumed that there is only one client present in this dataset.  Multiple clients would call instances of Flare
    //    filters = new FilterFunctions();
    //    var client = filters.getUnique(data, "Client");
    //    //console.log("Client", client[0]);

    //    var uniqueSites = filters.getUnique(data, "Site");
    //    //console.log("Unique Sites", uniqueSites);
    //    this.flareJson = new FlareParent(client[0], []).instance;
    //    for (var site = 0; site < uniqueSites.length; site++)
    //    {
    //        //console.log("Working on site", uniqueSites[site]);
    //        var siteCollection = data.filter(filters.filterSites(uniqueSites[site]))
    //        //console.log("Site collection", siteCollection);
    //        if (siteCollection.length == 1) {
    //            //this implies that there is only one object, the object's total value
    //            var obj = new FlareBase(uniqueSites[site], siteCollection[0].SqFt).instance;
    //            this.flareJson.children.push(obj);
    //        }
    //        else
    //        {
    //            var parent = new FlareParent(uniqueSites[site], []).instance;
    //            this.flareJson.children.push(parent);

    //            var uniqueSpaceUsageTypes = filters.getUnique(siteCollection, "SpaceUsageType");
    //            console.log(uniqueSpaceUsageTypes);
    //            for (var sut = 0; sut < uniqueSpaceUsageTypes.length; sut++) {
    //                //console.log("Working on site", uniqueSpaceUsageTypes[sut]);
    //                var spaceUsageCollection = siteCollection.filter(filters.filterSpaceUsageTypes(uniqueSpaceUsageTypes[sut]));
    //                //console.log("Space Usage Collection:", spaceUsageCollection);
    //                if (spaceUsageCollection.length == 1) {
    //                    //this implies that there is only one object, the object's total value
    //                    var obj2 = new FlareBase(uniqueSpaceUsageTypes[sut], spaceUsageCollection[0].SqFt).instance;
    //                    parent.children.push(obj2);
    //                }
    //                else {

    //                    var parent2 = new FlareParent(uniqueSpaceUsageTypes[sut], []).instance;
    //                    parent.children.push(parent2);
    //                    var uniquePodBuildOutTypes = filters.getUnique(spaceUsageCollection, "PodBuildOutType");
    //                    //console.log("Unique Pod Build Outs", uniquePodBuildOutTypes);
    //                    for (var upbt = 0; upbt < uniquePodBuildOutTypes.length; upbt++) {
    //                        //console.log("Working on PodBuildOut", uniquePodBuildOutTypes[upbt]);
    //                        var podBuildOutCollections = spaceUsageCollection.filter(filters.filterPodBuildOuts(uniquePodBuildOutTypes[upbt]));
    //                        //console.log("Pod Build Out Collections", podBuildOutCollections);
    //                        if (podBuildOutCollections.length == 1)
    //                        {
    //                            //this implies that there is only one object, the object's total value
    //                            var obj3 = new FlareBase(uniquePodBuildOutTypes[upbt], podBuildOutCollections[0].SqFt).instance;
    //                            parent2.children.push(obj3);
    //                        }
    //                        else
    //                        {
    //                            var parent3 = new FlareParent(uniquePodBuildOutTypes[upbt], []).instance;
    //                            parent2.children.push(parent3);

    //                            var uniquePodUsageTypes = filters.getUnique(podBuildOutCollections, "PodUsageType");
    //                            //console.log("Unique Pod Usage Types", uniquePodUsageTypes)
    //                            for (var uput = 0; uput < uniquePodUsageTypes.length; uput++) {
    //                                //console.log("Working on unique pod usage types", uniquePodUsageTypes[uput]);
    //                                var podUsageCollection = siteCollection.filter(filters.filterPodUsages(uniquePodUsageTypes[uput]));
    //                                //console.log("Pod Usage Collection:", podUsageCollection);

    //                                //at the end of the line (the lowest nest, we do not check the collection size, we always draw "pods"
    //                                //make the final pods
    //                                var parent4 = new FlareParent(uniquePodUsageTypes[uput], []).instance;
    //                                parent3.children.push(parent4);
    //                                for(var pod = 0; pod < podUsageCollection.length; pod++)
    //                                {
    //                                    var obj5 = new FlareBase(podUsageCollection[pod].PodName, podUsageCollection[pod].SqFt).instance;
    //                                    parent4.children.push(obj5);
    //                                }
                                    
    //                            }
    //                        }
    //                    }
    //                }
    //            }
    //        }
    //    }
    //},
    produceFlareComplete: function (data) {
        console.log("Produce Flare Complete Data provided ", data)
        var other = {
            "provision_ratio": data.kW / data.PCL,
            "kW": data.kW,
            "PCL": data.PCL
        }
        this.flareJson = new FlareParent(data.Name, [], other).instance; //client parent
        var sitesArray = data.Sites
        for(var s = 0; s< sitesArray.length; s++)
        {
            var reservedSpaces = sitesArray[s].ReservedSpaces;
            //console.log("Found reserved space:", reservedSpaces);
            var contractedSpaces = sitesArray[s].ContractedSpaces;
            //console.log("Found contracted spaces:", contractedSpaces);
            if(reservedSpaces.length > 0) //should never be equal to zero?
            {
                //there is only one reservedSpace
                if (contractedSpaces.length == 0) { //should never be equal to zero?
                    //there are no contracted spaces, only reserved
                    //just make the sites
                    //this route has never been tested!!
                    //TODO: fix this!
                    //console.log("Fix this!!!!!!!!!");
                    var other = {
                        "provision_ratio": sitesArray[s].kW / sitesArray[s].PCL,
                        "kW": sitesArray[s].kW,
                        "PCL": sitesArray[s].PCL
                    }
                    var site_childObj = new FlareBase(sitesArray[s].Name, sitesArray[s].ReservedSqFt, other).instance;
                    this.flare.children.push(site_childObj);
                    //don't add contracted, because there is no contracted (special??  talk to gregor)
                }
                else {
                    //still have to make contracted spaces, which do have pods
                    var site_children = []; //in this case, these are contractedSpaces
                    var other = {
                        "provision_ratio": sitesArray[s].kW / sitesArray[s].PCL,
                        "kW": sitesArray[s].kW,
                        "PCL": sitesArray[s].PCL
                    }
                    var siteParent = new FlareParent(sitesArray[s].Name, site_children, other).instance;
                    this.flareJson.children.push(siteParent);

                    for(var cs = 0; cs < contractedSpaces.length; cs++) //at least one contracted space
                    {
                        var contractSpace = contractedSpaces[cs];
                        //make the contractedSpacesParent
                        var contractedSpaceChildren = [];
                        
                        
                        //figure out if there needs to be a "FreeSqFt" Pod and Rack to fill out
                        if (contractedSpaces[cs].FreeSqFt == contractSpace.SqFt)
                        {
                            var contractedSpacesParent = new FlareParent("Contracted Space-" + cs, contractedSpaceChildren, {"provision_ratio":0}).instance;
                            site_children.push(contractedSpacesParent);
                            var freePod = {}
                            var podChild = []
                            freePod = new FlareParent("Free Pod Space",podChild,{"provision_ratio":0}).instance;
                            var freeRack = new FlareBase("Free Pod Space Empty Rack Space", contractSpace.SqFt,{"provision_ratio":0}).instance;
                            freePod.children.push(freeRack);
                            contractedSpaceChildren.push(freePod);
                        }
                        else
                        {
                            var contractedSpacesParent = new FlareParent("Contracted Space-" + cs, contractedSpaceChildren, { "provision_ratio": contractSpace.kW / contractSpace.PCL }).instance;
                            site_children.push(contractedSpacesParent);
                            //does the contracted space have pods or not?
                            if (contractSpace.Pods.length == 0) {
                                console.log("This is weird behavior...")
                            }
                            else {
                                //contracted space that is at least partially filled with pods
                                for(var pp = 0; pp < contractSpace.ProdPods.length;pp++)
                                {
                                    var currentPod = contractSpace.ProdPods[pp];
                                    //does it have racks?...if not, make an empty rack beneath
                                    if(currentPod.Racks.length == 0)
                                    {
                                        var emptyPod = {};
                                        var emptyPodChildren = [];
                                        
                                        emptyPod = new FlareParent(currentPod.Name, emptyPodChildren,{"provision_ratio":0}).instance;
                                        var freeRack = new FlareBase(currentPod.Name + " Empty Rack Space", currentPod.SqFt,{"provision_ratio":0}).instance;
                                        emptyPod.children.push(freeRack);
                                        contractedSpaceChildren.push(emptyPod);
                                        //console.log("Contracted Space Prod Pod with no Racks", contractedSpaces[cs].ProdPods[pp]);
                                        //console.log("Completed flare:", contractedSpaceChildren);
                                    }
                                    else
                                    {
                                        //console.log("Contracted Space Prod Pod with Racks", currentPod);
                                        //it does have racks
                                        var racks = currentPod.Racks;
                                        var rackCt = racks.length;
                                        var sqFt_per_rack = currentPod.SqFt / rackCt; //this is artificial because no other way...
                                        var Pod = {};
                                        var PodRacks = [];

                                        Pod = new FlareParent(currentPod.Name, PodRacks, {"provision_ratio":currentPod.kW/currentPod.PCL}).instance;
                                        for(var r = 0; r < racks.length; r++)
                                        {
                                            var Rack = new FlareBase(racks[r].Name, sqFt_per_rack, {"provision_ratio":racks[r].kW/racks[r].PCL}).instance;
                                            PodRacks.push(Rack);
                                            
                                        }
                                        contractedSpaceChildren.push(Pod);
                                        //console.log("Completed flare:", contractedSpaceChildren);
                                        //add empty rack space?  Right now there is no way to see if there is "Free Space" for racks in a pod...
                                    }
                                }
                                for(var drp = 0; drp < contractSpace.DRPods.length; drp++)
                                {
                                    var currentPod = contractSpace.DRPods[drp];
                                    //does it have racks?...if not, make an empty rack beneath
                                    if (currentPod.Racks.length == 0) {
                                        var emptyPod = {};
                                        var emptyPodChildren = [];
                                        emptyPod = new FlareParent(currentPod.Name, emptyPodChildren,{"provision_ratio":0}).instance;
                                        var freeRack = new FlareBase(currentPod.Name + " Empty Rack Space", currentPod.SqFt, {"provision_ratio":0}).instance;
                                        emptyPod.children.push(freeRack);
                                        contractedSpaceChildren.push(emptyPod);
                                        //console.log("Contracted Space DR Pod with no Racks", contractedSpaces[cs].DRPods[pp]);
                                        //console.log("Completed flare:", contractedSpaceChildren);
                                    }
                                    else {
                                        //it does have racks
                                        var racks = currentPod.Racks;
                                        var rackCt = racks.length;
                                        var sqFt_per_rack = currentPod.SqFt / rackCt; //this is artificial because no other way...
                                        var Pod = {};
                                        var PodRacks = [];
                                        Pod = new FlareParent(currentPod.Name, PodRacks,{"provision_ratio":currentPod.kW/currentPod.PCL}).instance;
                                        for (var r = 0; r < racks.length; r++) {
                                            var Rack = new FlareBase(racks[r].Name, sqFt_per_rack, {"provision_ratio":racks[r].kW/racks[r].PCL}).instance;
                                            PodRacks.push(Rack);
                                        }
                                        contractedSpaceChildren.push(Pod);
                                        //console.log("Completed flare:", contractedSpaceChildren);
                                        //add empty rack space?  Right now there is no way to see if there is "Free Space" for racks in a pod...
                                    }
                                }
                                //make a pod that is "Free" with contractedSpaces[cs].FreeSqFt
                                var FreeSpacePod = {}
                                var FreeSpacePod_children = [];
                                FreeSpacePod = new FlareParent("Unused Pod Space", FreeSpacePod_children, { "provision_ratio": 0 }).instance;
                                var FreeRack = new FlareBase("Unused Pod Space Empty Rack Space", contractSpace.FreeSqFt,{"provision_ratio":0}).instance;
                                FreeSpacePod_children.push(FreeRack)
                                contractedSpaceChildren.push(FreeSpacePod);
                                //console.log("Empty pod for contracted space FreeSqFt", contractedSpaces[cs].Name);
                                //console.log("Completed flare:", contractedSpaceChildren);
                            }
                        }
                    }

                    for (var rs = 0; rs < reservedSpaces.length; rs++) //at least one contracted space
                    {
                        var reservedSpace = reservedSpaces[rs];
                        //make the contractedSpacesParent
                        var reservedSpaceChildren = [];


                        //figure out if there needs to be a "FreeSqFt" Pod and Rack to fill out
                        if (reservedSpace.BuiltSqFt == 0) {
                            var reservedSpacesParent = new FlareParent("Reserved Space-" + rs, reservedSpaceChildren, {"provision_ratio":0}).instance;
                            site_children.push(reservedSpacesParent);
                            var freePod = {}
                            var podChild = []
                            freePod = new FlareParent("Free Pod Space", podChild, { "provision_ratio": 0 }).instance;
                            var freeRack = new FlareBase("Free Pod Empty Rack Space", reservedSpace.SqFt, {"provision_ratio":0}).instance;
                            freePod.children.push(freeRack);
                            reservedSpaceChildren.push(freePod);
                        }
                        //else {
                        //    var reservedSpacesParent = new FlareParent("Reserved Space-" + cs, reservedSpaceChildren, reservedSpace.kW / reservedSpace.PCL).instance;
                        //    site_children.push(reservedSpacesParent);
                        //    //does the contracted space have pods or not?
                        //    if (contractSpace.Pods.length == 0) {
                        //        console.log("This is weird behavior...")
                        //    }
                        //    else {
                        //        //contracted space that is at least partially filled with pods
                        //        for (var pp = 0; pp < reservedSpace.ProdPods.length; pp++) {
                        //            var currentPod = reservedSpace.ProdPods[pp];
                        //            //does it have racks?...if not, make an empty rack beneath
                        //            if (currentPod.Racks.length == 0) {
                        //                var emptyPod = {};
                        //                var emptyPodChildren = [];

                        //                emptyPod = new FlareParent(currentPod.Name, emptyPodChildren, 0).instance;
                        //                var freeRack = new FlareBase(curentPod.Name +" Empty Rack Space", currentPod.SqFt, 0).instance;
                        //                emptyPod.children.push(freeRack);
                        //                reservedSpaceChildren.push(emptyPod);
                        //                //console.log("Contracted Space Prod Pod with no Racks", contractedSpaces[cs].ProdPods[pp]);
                        //                //console.log("Completed flare:", contractedSpaceChildren);
                        //            }
                        //            else {
                        //                //console.log("Contracted Space Prod Pod with Racks", currentPod);
                        //                //it does have racks
                        //                var racks = currentPod.Racks;
                        //                var rackCt = racks.length;
                        //                var sqFt_per_rack = currentPod.SqFt / rackCt; //this is artificial because no other way...
                        //                var Pod = {};
                        //                var PodRacks = [];

                        //                Pod = new FlareParent(currentPod.Name, PodRacks, currentPod.kW / currentPod.PCL).instance;
                        //                for (var r = 0; r < racks.length; r++) {
                        //                    var Rack = new FlareBase(racks[r].Name, sqFt_per_rack, racks[r].kW / racks[r].PCL).instance;
                        //                    PodRacks.push(Rack);

                        //                }
                        //                reservedSpaceChildren.push(Pod);
                        //                //console.log("Completed flare:", contractedSpaceChildren);
                        //                //add empty rack space?  Right now there is no way to see if there is "Free Space" for racks in a pod...
                        //            }
                        //        }
                        //        for (var drp = 0; drp < contractSpace.DRPods.length; drp++) {
                        //            var currentPod = contractSpace.DRPods[drp];
                        //            //does it have racks?...if not, make an empty rack beneath
                        //            if (currentPod.Racks.length == 0) {
                        //                var emptyPod = {};
                        //                var emptyPodChildren = [];
                        //                emptyPod = new FlareParent(currentPod.Name, emptyPodChildren, 0).instance;
                        //                var freeRack = new FlareBase(currentPod.Name+ " Empty Rack Space", currentPod.SqFt, 0).instance;
                        //                emptyPod.children.push(freeRack);
                        //                reservedSpaceChildren.push(emptyPod);
                        //                //console.log("Contracted Space DR Pod with no Racks", contractedSpaces[cs].DRPods[pp]);
                        //                //console.log("Completed flare:", contractedSpaceChildren);
                        //            }
                        //            else {
                        //                //it does have racks
                        //                var racks = currentPod.Racks;
                        //                var rackCt = racks.length;
                        //                var sqFt_per_rack = currentPod.SqFt / rackCt; //this is artificial because no other way...
                        //                var Pod = {};
                        //                var PodRacks = [];
                        //                Pod = new FlareParent(currentPod.Name, PodRacks, currentPod.kW / currentPod.PCL).instance;
                        //                for (var r = 0; r < racks.length; r++) {
                        //                    var Rack = new FlareBase(racks[r].Name, sqFt_per_rack, racks[r].kW / racks[r].PCL).instance;
                        //                    PodRacks.push(Rack);
                        //                }
                        //                reservedSpaceChildren.push(Pod);
                        //                //console.log("Completed flare:", contractedSpaceChildren);
                        //                //add empty rack space?  Right now there is no way to see if there is "Free Space" for racks in a pod...
                        //            }
                        //        }
                        //        //make a pod that is "Free" with contractedSpaces[cs].FreeSqFt
                        //        var FreeSpacePod = {}
                        //        var FreeSpacePod_children = [];
                        //        FreeSpacePod = new FlareParent("Unused Space", FreeSpacePod_children, 0).instance;
                        //        var FreeRack = new FlareBase("Unused Space Free Rack Space", reservedSpace.FreeSqFt, 0).instance;
                        //        FreeSpacePod_children.push(FreeRack)
                        //        reservedSpaceChildren.push(FreeSpacePod);
                        //        //console.log("Empty pod for contracted space FreeSqFt", contractedSpaces[cs].Name);
                        //        //console.log("Completed flare:", contractedSpaceChildren);
                        //    }
                        //}
                    }
                }
            }
            else //No reserved space?
            {
                if (contractedSpaces.length > 0) {
                    //don't make contracted spaces in the flare

                    //still have to make reserved spaces, which have no pods 
                }
                else {
                    //the least likely to happen, has not been tested.
                }
            }
        }

    }
}

function EMD3() {
    this.aDiv = "";
}

EMD3.prototype = {
    constructor: EMD3,
	simpleMovingAverage: function(data,neighborCount){
		//creates a simpleUnweightedMovingAverage based on the neighborcount, and returns the timeseries data to the caller.
		var arrLength = data.length - (neighborCount - 1);
		var mats = []
		var matsct = 0;
		for(var i = 0; i < data.length; i++)
		{
			var ma = 0;
			var t = new Date();
			var mdpt = Math.ceil(neighborCount/2.0);
			var traverse = neighborCount - mdpt;
			if(i < mdpt - 1) continue;
				
			ma += data[i].value;
			t = data[i].timestamp;
			//go negative
			for(var n = 1; n <= traverse; n++)
			{
				ma += data[i-n].value;
			}
			//go positive
			for(var p = 1; p <= traverse; p++)
			{
				ma += data[i+p].value;
			}
			ma = ma / neighborCount;
			var obj = {
				value:ma,
				timestamp:t
			}
			mats.push(obj);
			matsct++;
			if(matsct == arrLength) break;
		}
		console.log("Moving average",mats)
		return mats
	},
	makeSunburstChart: function(divname)
	{

	    var formatNumber = d3.format(".2");

	    var margin = { top: 20, right: 20, bottom: 30, left: 50 },
            width = parseInt(d3.select(divname).style('width'), 10) - margin.left - margin.right,
            height = parseInt(d3.select(divname).style('height'), 10) - margin.top - margin.bottom,
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


	    var svg = d3.select(divname).append("svg")
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


	    d3.json("sunburst_story.json", function (error, retdata) {
	        if (error) {
	            console.log("Error: ", error)
	            throw error;
	        }

	        //reformat data
	        var flare = new Flare();
	        //flare.produceFlare(retdata);
	        //console.log("Final root json", flare.flareJson);
	        flare.produceFlareComplete(retdata);
	        console.log("Final root json", flare.flareJson);

	        //turn into something I can throw into d3.hierarchy and subsequently pass in as root
	        var root = d3.hierarchy(flare.flareJson);
	        root.sum(function (d) { //console.log(d.value); 
	            return d.value;
	        });
	        svg.selectAll("path")
                .data(partition(root).descendants())
              .enter().append("path")
                .attr("d", arc)
                .attr("stroke", "#ffffff")
                .attr("stroke-width","2px")
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
                    t+= formatNumber(d.data.other.provision_ratio * 100) + "% of provisioned capacity";
                    return t;
                });
	    });

        //used to zoom in and out on the sunburst
	    function arcTweenClick(d) {
	        svg.transition()
                .duration(750)
                .tween("scale", function () {
                    var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                        yd = d3.interpolate(y.domain(), [d.y0, 1]),
                        yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
                    return function (t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
                })
              .selectAll("path")
                .attrTween("d", function (d) { return function () { return arc(d); }; });
	    }

	    function click(a, d, callback) {
	        console.log("Passed to click", a);
	        d3.select(a)
                .attr("stroke", "#ffffff")
                .attr("stroke-width", "2px")
	            callback(d);
	    }

	    d3.select(self.frameElement).style("height", height + "px");

    },
	makeUnivariateChartData2:function (data, markers) {
          var svgWidth  = 960,
              svgHeight = 500,
              margin = { top: 20, right: 20, bottom: 40, left: 40 },
                chartWidth  = svgWidth  - margin.left - margin.right,
                chartHeight = svgHeight - margin.top  - margin.bottom;

        var x = d3.time.scale().range([0, chartWidth])
                  .domain(d3.extent(data, function (d) { return d.date; })),
            y = d3.scale.linear().range([chartHeight, 0])
                  .domain([0, d3.max(data, function (d) { return d.pct95; })]);

        var xAxis = d3.svg.axis().scale(x).orient('bottom')
                      .innerTickSize(-chartHeight).outerTickSize(0).tickPadding(10),
            yAxis = d3.svg.axis().scale(y).orient('left')
                      .innerTickSize(-chartWidth).outerTickSize(0).tickPadding(10);

        var svg = d3.select('body').append('svg')
          .attr('width',  svgWidth)
          .attr('height', svgHeight)
          .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // clipping to start chart hidden and slide it in later
        var rectClip = svg.append('clipPath')
          .attr('id', 'rect-clip')
          .append('rect')
            .attr('width', 0)
            .attr('height', chartHeight);

        addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight);
        drawPaths(svg, data, x, y);
        startTransitions(svg, chartWidth, chartHeight, rectClip, markers, x);

            function drawPaths(svg, data, x, y) {
                var upperOuterArea = d3.svg.area()
                  .interpolate('basis')
                  .x(function (d) { return x(d.date) || 1; })
                  .y0(function (d) { return y(d.pct95); })
                  .y1(function (d) { return y(d.pct75); });

                var upperInnerArea = d3.svg.area()
                  .interpolate('basis')
                  .x(function (d) { return x(d.date) || 1; })
                  .y0(function (d) { return y(d.pct75); })
                  .y1(function (d) { return y(d.pct50); });

                var medianLine = d3.svg.line()
                  .interpolate('basis')
                  .x(function (d) { return x(d.date); })
                  .y(function (d) { return y(d.pct50); });

                var lowerInnerArea = d3.svg.area()
                  .interpolate('basis')
                  .x(function (d) { return x(d.date) || 1; })
                  .y0(function (d) { return y(d.pct50); })
                  .y1(function (d) { return y(d.pct25); });

                var lowerOuterArea = d3.svg.area()
                  .interpolate('basis')
                  .x(function (d) { return x(d.date) || 1; })
                  .y0(function (d) { return y(d.pct25); })
                  .y1(function (d) { return y(d.pct05); });

                svg.datum(data);

                svg.append('path')
                  .attr('class', 'area upper outer')
                  .attr('d', upperOuterArea)
                  .attr('clip-path', 'url(#rect-clip)');

                svg.append('path')
                  .attr('class', 'area lower outer')
                  .attr('d', lowerOuterArea)
                  .attr('clip-path', 'url(#rect-clip)');

                svg.append('path')
                  .attr('class', 'area upper inner')
                  .attr('d', upperInnerArea)
                  .attr('clip-path', 'url(#rect-clip)');

                svg.append('path')
                  .attr('class', 'area lower inner')
                  .attr('d', lowerInnerArea)
                  .attr('clip-path', 'url(#rect-clip)');

                svg.append('path')
                  .attr('class', 'median-line')
                  .attr('d', medianLine)
                  .attr('clip-path', 'url(#rect-clip)');
            }
        },
    makeUnivariateOutlierLineChart: function(divname) {
        var margin = { top: 20, right: 20, bottom: 30, left: 50 },
            width = parseInt(d3.select(divname).style('width'), 10) - margin.left - margin.right,
            height = parseInt(d3.select(divname).style('height'), 10) - margin.top - margin.bottom;

        var formatDate = d3.timeParse("%d-%b-%y %H:%M:%S");

        var x = d3.scaleTime()
            .range([0, width]);

        var y = d3.scaleLinear()
            .range([height, 0]);

        var line = d3.line()
            .x(function (d) { return x(d.timestamp); })
            .y(function (d) { return y(d.value); });
				
		var smoothLine = d3.line()
            .x(function (d) { return x(d.timestamp); })
            .y(function (d) { return y(d.value); })
			.curve(d3.curveCatmullRom.alpha(0.5));

        var svg = d3.select(divname).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //loads the original data
        d3.csv("mainkw - test data.csv", type, function (error, data) {
            //downsample the data
            debugger;
            var smpl = new DataSampling(data);
            smpl.SimpleDownSample();
            data = smpl.endArray;
            lineData = data;
            if (error) {
                console.log("Error: ",error)
                throw error;
            }
            x.domain(d3.extent(data, function (d) { return d.timestamp; })); //this needs to be updated based on the new highpoint defined by the slider
            y.domain(d3.extent(data, function (d) { return d.value; })); //this needs to be updated based on the new minpoint defined by the slider

            svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            svg.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y))
                .append("text")
                .attr("class", "axis-title")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Price ($)");
                
            svg.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("id", "orig")
                .attr("d", line);
					
			//we are going to automatically calculate the moving average, but this should preferably be user-defined?
			//d3.select("#chartDiv")._groups[0][0]
			var em = new EMD3()
			var madata = em.simpleMovingAverage(lineData,13);
			lineData = madata; //this is very important!!  Should it be hardcoded?
			svg.append("path")
				.datum(madata)
				.attr("stroke","black")
				.attr("id","moving-avg")
				.attr("fill", "none")
				.attr("d",smoothLine)
				.attr("stroke-width",0.5);
        });

        //adds new lines to the graph of the existing data, keeping the originally loaded lines
        function addLines(data)
        {
            var t = d3.transition()
                .delay(0)
                .duration(5000)
                .ease(d3.easeSin);
            //remove oldLines
            var lines = d3.selectAll("path.newline")
            
            lines.remove(); 
            
            var color = '#' + 'FB5780'
            //var path = ma.select("path");
            var path = svg.append("path")
              .attr("d", line(data[0]))
              .attr("class", "newline")
              .attr("stroke", color)
              .attr("stroke-width", "2")
              .attr("fill", "none");        

            var totalLength = path.node().getTotalLength();

            path
              .attr("stroke-dasharray", totalLength + " " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition(t)
                .attr("stroke-dashoffset", 0);

            var path2 = svg.append("path")
              .attr("d", line(data[1]))
              .attr("class","newline")
              .attr("stroke", color)
              .attr("stroke-width", "2")
              .attr("fill", "none");
            console.log("Path 2: ",path2)
            var totalLength2 = path2.node().getTotalLength();
            path2
              .attr("stroke-dasharray", totalLength2 + " " + totalLength2)
              .attr("stroke-dashoffset", totalLength2)
              .transition(t)
                .attr("stroke-dashoffset", 0);

            //d3.area(data) tried and failed
            //var area = d3.area(data) //also failed
            //    .x(function (d) { return x(d.data[0].timestamp); })
            //    .y1(function (d) { return y(d.data[0].value); })
            //    .y0(function (d) { return y(d.data[1].value); });
            //console.log("Area:",area)  
            //var areaAboveTrafficLine = d3.svg.area()
            //  .x(trafficLine.x())
            //  .y0(trafficLine.y())
            //  .y1(0);

            //you need to check to see if you must redraw the axes
        }

        $(function () {
            $("#slider-range").slider({
                range: false,
                min: 0,
                max: 1,
                step:0.05,
                slide: function (event, ui) {
                    //var begin = d3.min([ui.values[0], data.length]);
                    //var end = d3.max([ui.values[1], 0]);
                    //console.log("begin:", begin, "end:", end);
                    console.log(ui.value)
                    newlinepositive = makeNewLine(lineData, ui.value)
                    //console.log("New positive",newlinepositive);
                    newlinenegative = makeNewLine(lineData, ui.value * -1)
                    //console.log("New negative",newlinenegative);
                    addLines([newlinenegative, newlinepositive])
                }
            });
        });
        //this is a place to handle multiple dates of many parsing formats
        function type(d) {
                
            d.timestamp = d3.isoParse(d.timestamp);

            d.value = +d.value;
            return d;
        }

        function makeNewLine(data,percent)
        {
            //be sure to deep copy the array before doing something with it
            var clonedArray = JSON.parse(JSON.stringify(data))
            for(var i =0;i < data.length; i++)
            {
                clonedArray[i].value = data[i].value * (1 + percent);
                clonedArray[i].timestamp = d3.isoParse(clonedArray[i].timestamp)
            }
            return clonedArray;
        }

            
    },
    MakeSimpleHorBarChart:function(categories, values, xAxisText, barcolor, divname)
    {
        console.log("Categories:", categories.length);
        console.log("Values:", values);
        var emdt = this;
        var padding = 2;
        var width = parseInt(d3.select(divname).style('width'), 10);
        var height = parseInt(d3.select(divname).style('height'), 10);
        var yaxPad = 50;
        var xaxPad = 40;
        var padTop = 40;
        var padRight = 20;
        var barHeight = ((height - xaxPad - padTop) / categories.length) - padding * 2;

        var xScale = d3.scale.linear()
            .domain([0, d3.max(values)])
            .range([0, (width - yaxPad - padRight)]);

        var yScale = d3.scale.linear()
            .domain([0, categories.length])
            .range([0, (height - xaxPad - padding - padTop)]);

        var canvas = d3.select(divname)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        canvas.append("text")
            .attr("dy", (height - 3))
            .attr("dx", (width / 2) * .9)
            .attr("style", "font-family:Palatino")
            .attr("style", "font-size:18px")
            .text(function (d) { return xAxisText })

        canvas.append("text")
            .attr("dy", 50)
            .attr("dx", width / 2)
            .attr("style", "font-family:Palatino")
            .attr("style", "font-size:18px")
            .text(function (d) {
                var sum = values.reduce(emdt.add, 0);
                return "Annual Projected Cost Penalty: $" + sum;
            })

        var xAxis = d3.svg.axis()
            .orient("bottom")
            .scale(xScale)
            .tickSize(2);

        var yAxis = d3.svg.axis()
            .orient("left")
            .scale(yScale)
            .tickSize(0)
            .tickFormat(function (d, i) { return categories[i]; })
            .tickValues(d3.range(categories.length));

        var y_xis = canvas.append('g')
                            .attr("transform", "translate(" + yaxPad + "," + padTop + ")")
                            .attr('id', ('yaxis' + (Math.random() * 100).toString()))
                            .call(yAxis);

        var x_xis = canvas.append('g')
                            .attr("transform", "translate(" + yaxPad + "," + (height - xaxPad - (padding * 2)) + ")")
                            .attr('id', ('xaxis' + (Math.random() * 100).toString()))
                            .call(xAxis);

        var div = d3.select("body").append("div")
                .attr("class", "d3-tip")
                .style("opacity", 1e-6);
        //would it make sense to pass in mouseover colors, functions, etc.?
        var chart = canvas.append("g")
            .attr("transform", "translate(" + yaxPad + "," + padTop + ")")
            .attr("id", "bars")
            .selectAll("rect")
            .data(values)
            .enter()
            .append("rect")
            .attr("height", barHeight)
            .attr("x", 0)
            .attr("opacity", 0.2)
            .attr("y", function (d, i) { return (yScale(i) - barHeight / 2); })
            .attr("width", 0)
            .attr("color", "grey")
            .on("mouseover", function (d) { //will "this" work as intended?
                d3.select(this)
                    .attr("fill", "orangered")
                    .attr("opacity", 1);
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
            })
            .on("mousemove", function (d, i) {
                //console.log(d)
                div.html(categories[i] + ": " + "$CAD " + values[i])
                    .style("left", (d3.event.pageX + 25) + "px")
                    .style("top", (d3.event.pageY - 20) + "px");
                //console.log(div);
            })
            .on("mouseout", function (d) {
                d3.select(this) //will "this" work as intended?
                    .attr("fill", barcolor)
                    .attr("opacity", 0.8);
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()
                .delay(function (d, i) { return i * 100 })
                .duration(200)
                .attr("width", function (d, i) { return xScale(d); })
                .attr("fill", barcolor)
                .attr("opacity", 0.8);
    },
    MakeSimpleScatterPlot:function(jsondata,divname,chartSetupJson)
    {
        var margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = parseInt(d3.select(divname).style("width"), 10) - margin.left - margin.right,
        height = parseInt(d3.select(divname).style("height"), 10) - margin.top - margin.bottom;
        console.log("Width:", width);
        console.log("Height", height);
        console.log("here!")
        var x = d3.scale.linear()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var color = d3.scale.category10();

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var svg = d3.select(divname).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        console.log("SVG", svg)

        d3.json(jsondata, function (error, data) {
            console.log("Here")
            if (error) throw error;
            console.log("Data?",data)
            data.forEach(function (d) {
                console.log(d)
                d.sepalLength = +d.sepalLength;
                d.sepalWidth = +d.sepalWidth;
            });

            x.domain(d3.extent(data, function (d) { return d.sepalWidth; })).nice();
            y.domain(d3.extent(data, function (d) { return d.sepalLength; })).nice();

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .append("text")
                .attr("class", "label")
                .attr("x", width)
                .attr("y", -6)
                .style("text-anchor", "end")
                .text("Sepal Width (cm)");

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Sepal Length (cm)")

            svg.selectAll(".dot")
                .data(data)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("r", 3.5)
                .attr("cx", function (d) { return x(d.sepalWidth); })
                .attr("cy", function (d) { return y(d.sepalLength); })
                .style("fill", function (d) { return color(d.species); })
                .style("opacity", 0.5)
                .style("stroke", function (d) { return color(d.species); })
                .style("stroke-width",'1.5');

            var legend = svg.selectAll(".legend")
                .data(color.domain())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

            legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color)
                .style("opacity",0.5);

            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function (d) { return d; });

        });
    },
    MakeGradientStackedBar:function(jsondata,divname,chartSetupJson)
    {
        //css styling, can be modified in case where text from axes do not fit
        var margin = {
            top: 20,
            right: 20,
            bottom: 40,
            left: 100
        },
			width = parseInt(d3.select(divname).style("width"),10) - margin.left - margin.right,
			height = parseInt(d3.select(divname).style("height"),10) - margin.top - margin.bottom,
			that = this;
        console.log("Width:", width);
        console.log("Height", height);
        var x = d3.scale.ordinal().rangeRoundBands([0, width], .3);
        //the yscale is vastly affected by the type of data being displayed
        var y = d3.scale.linear();
        if (chartSetupJson.hasOwnProperty("metaData"))
        {
            if (chartSetupJson.metaData.length > 0)
            {
                console.log(chartSetupJson.metaData[0].axisDomain)
                y.domain(chartSetupJson.metaData[0].axisDomain);
                console.log("Ydomain", y.domain())
            }
            else {
                //the domain is based upon the sum of the passed in jsondata
                if (!chartSetupJson.percentageScale) {
                    var sum = 0;
                    for (var key in jsondata[0]) {
                        if (key == chartSetupJson.xAxisKey) continue;
                        else sum += jsondata[0][key];
                    }
                    sum = sum * 1.1 //we apply 10% safety
                    y.domain([0, Math.ceil(sum / 10) * 10]); //round to the nearest 10
                }
                else {
                    y.domain([0, 1]); //as in zero to 100 percent
                }
            }
        }
        y.rangeRound([height, 0]);
        var xAxis = d3.svg.axis().scale(x).orient("bottom");
        var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(6).ticks(10).tickFormat(chartSetupJson.yaxisTickFormat);//interesting you can put a format inside
        var svg = d3.select(divname)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var colordomain = d3.keys(jsondata[0]).filter(function (key) {
            return key !== chartSetupJson.xAxisKey; //can we pass something in to indicate what key goes on the x-axis?
        });
        var colorrange = this.processOrdinalColorRange(chartSetupJson.colors, colordomain.length); //this is the color range
        var color = d3.scale.ordinal()
            .domain(colordomain)
            .range(colorrange);

        //do we want to inject our own d3 function in here that sorts out the data accordingly?
        jsondata.forEach(function (d) {
            var y0 = 0;
            d.rates = color.domain().map(function (name) {
                return {
                    name: name,
                    y0: y0,
                    y1: y0 += +d[name],
                    amount: d[name]
                };
            });
            console.log(d.rates);
            console.log(y0)
            if(chartSetupJson.percentageScale)
            {
                d.rates.forEach(function (d) { 
                    d.y0 /= y0; console.log(y0)//why? to turn into percentages
                    d.y1 /= y0; //why? to turn into percentages
                });
            }
                
        });

        jsondata.sort(function (a, b) {
            return b.rates[0].y1 - a.rates[0].y1;
        });

        x.domain(jsondata.map(function (d) {
            return d[chartSetupJson.xAxisKey]; //take note again of the x-axis name
        }));

        //draw axes
        //svg.append("g").attr("class", "axis").attr("transform", "translate(0," + height + ")").call(xAxis); (no x-axis)
        svg.append("g").attr("class", "y axis").call(yAxis).attr("transform", "translate(" + (margin.left) + "," + (height / 2));
            
        svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate(" + (-0.75 * margin.left) + "," + (height / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .style("font-family", "Helvetica").style("font-size",16).style("font-weight","bold")
        .text(chartSetupJson.yAxisText);

        var startx = 0;
        var bargauge = svg.selectAll("." + chartSetupJson.xAxisKey) //where is this class developed
            .data(jsondata)
            .enter()
            .append("g")
            .attr("class", chartSetupJson.xAxisKey)
            .attr("transform", function (d) {
                startx = x(d[chartSetupJson.xAxisKey]);
                return "translate(" + x(d[chartSetupJson.xAxisKey]) + ",0)"; //again take note of the x axis call
        });

        bargauge.selectAll("rect").data(function (d) {
            return d.rates;
        }).enter().append("rect").attr("width", x.rangeBand())
        .attr("y", function (d) {
            return height;
        })
        .attr("x", function (d) {
                return -margin.right;
        }).attr("height", function (d) {
            return 0;
        }).style("fill", function (d) {
            return color(d.name);
        }).style("opacity", function (d) { return 0; })
        .transition()
            .attr("y", function (d) {
                return y(d.y1);
            }).attr("height", function (d) {
                return y(d.y0) - y(d.y1);
            }).style("opacity", function (d) { return 1; })
            .duration(1000)
            .delay(50);

        //add the metadata, if any (which is the circles and the lines
        if (chartSetupJson.metaData.length > 0)
        {
            var jsoncircles = [];
            //get circles
            var allcircles = chartSetupJson.metaData[0].items.filter(function (val) { return val.type == "circle"; })
            for (var i = 0; i < allcircles.length; i++) {
                var cirobj = {
                    "x_axis": width / 2 - margin.right,
                    "y_axis": y(allcircles[i].value),
                    "radius": 10,
                    "color": allcircles[i].color
                }
                jsoncircles.push(cirobj);
            }
            var circles = svg.selectAll("circle")
                .data(jsoncircles)
                .enter()
                .append("circle");

            var circleAttributes = circles
                .attr("cx", function (d) { return d.x_axis; })
                .attr("cy", function (d) { return height; })
                .attr("r", function (d) { return d.radius; })
                .style("fill", function (d) { return d.color; })
                .style("opacity", 0.0)
                .transition()
                .attr("cy", function (d) { return d.y_axis; })
                .style("opacity",0.9)
                .ease("elastic")
                .duration(1500)
                .delay(750);

            var jsonlines = [];
            var alllines = chartSetupJson.metaData[0].items.filter(function (val) { return val.type == "line"; })
            for(var l = 0; l<alllines.length;l++)
            {
                var lineob = {
                    "x1": startx,
                    "x2": startx+x.rangeBand(),
                    "y1": y(alllines[l].value),
                    "y2": y(alllines[l].value),
                    "stroke": alllines[l].color,
                    "stroke_width": 2
                }
                jsonlines.push(lineob);
            }
            var lines = svg.selectAll("lines")
                .data(jsonlines)
                .enter()
                .append("line");

            var lineAttr = lines
                .attr("x1", function (d) { return d.x1 - margin.right; })
                .attr("x2", function (d) { 0; })
                .attr("y1", function (d) { return d.y1; })
                .attr("y2", function (d) { return d.y2; })
                .attr("stroke", function (d) { return d.stroke; })
                .attr("stroke-width", function (d) { return d.stroke_width*1.15; })
                .attr("opacity", 0)
                .transition()
                .attr("x2", function (d) { return d.x2 - margin.right; })
                .style("opacity", 0.9)
                .ease("linear")
                .duration(1500)
                .delay(1000);
        }
    },
    loadFancyDonutNew:function(csvfinal, divname) {
    var total = 0;
    for (var i = 0; i < csvfinal.length; i++) {
        total += (csvfinal[i][1]);
    }
    var title = total.toFixed(2) + "<br/>HOURS";
    
    $(divname).highcharts({
        chart: {
            spacingBottom: 0,
            spacingTop: 0,
            spacingLeft: 0,
            spacingRight: 0,
            marginBottom: 0,
            type: 'pie',
            events: {
                load: function (e) {
                    if (this.title) { this.title.destroy(); }
                    var r = this.renderer, x = this.series[0].center[0] + this.plotLeft, y = this.series[0].center[1] + this.plotTop;
                    this.title = r.text(title, 0, 0).css({ color: '#000', fontSize: '30px' }).hide().add();
                    var bbox = this.title.getBBox();
                    this.title.attr({ x: x - (bbox.width / 2), y: y }).show();
                },
                redraw: function (e) {
                    if (this.title) { this.title.destroy(); }
                    var r = this.renderer, x = this.series[0].center[0] + this.plotLeft, y = this.series[0].center[1] + this.plotTop;
                    this.title = r.text(title, 0, 0).css({ color: '#000', fontSize: '30px' }).hide().add();
                    var bbox = this.title.getBBox();
                    this.title.attr({ x: x - (bbox.width / 2), y: y }).show();
                }
            }
        },
        title: {
            text: null,
            //align: 'center',
            verticalAlign: 'middle',
            floating: true,
            style: {fontSize: "30px"}
        },
           
        plotOptions: {
            pie: {
                shadow: false,
                dataLabels: { enabled: false },
                borderWidth: 0
            }
        },
        tooltip: {
            backgroundColor: "black",
            borderColor: "black",
            shadow: false,
            borderRadius: "0",
            style: {
                "color": "white",
                "fontSize": "14px"
            },
            formatter: function() { return '<b>'+ this.point.name +'</b>: '+ this.y; }
        },
        colors: ["#02738B", "#0092B1", "#00A4C7", "#4CBFD7", "#7CE1F6", "#D4FDD2", "#AAEFA6", "#8AE385", "#69D163", "#36B62F", "#1F9918"],
        series: [{ data: csvfinal, size: '90%', innerSize: '70%' }],
        exporting: {enabled: false},
        credits: {enabled: false}
    });
    },
    loadGenericDonut: function(divname){
        var width = parseInt(d3.select(divname).style("width"), 10),
            height = parseInt(d3.select(divname).style("height"), 10),
            radius = Math.min(width, height) / 2;

        var color = d3.scale.ordinal()
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        var arc = d3.svg.arc()
            .outerRadius(radius - 10)
            .innerRadius(radius - 70);

        var pie = d3.layout.pie()
            .sort(null)
            .value(function (d) { return d.population; });

        var svg = d3.select(divname).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        d3.csv("donut-data.csv", type, function (error, data) {
            if (error) throw error;

            var g = svg.selectAll(".arc")
                .data(pie(data))
                .enter().append("g")
                .attr("class", "arc");

            g.append("path")
                .attr("d", arc)
                .style("fill", function (d) { return color(d.data.age); });

            g.append("text")
                .attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
                .attr("dy", ".35em")
                .text(function (d) { return d.data.age; });
        });

        function type(d) {
            d.population = +d.population;
            return d;
        }
    },
    add:function(a,b)
    {
        return a + b;
    },
    processOrdinalColorRange: function (colorArray,domainLength) {
        if(colorArray.length === 2)
        {
            var lincol = d3.scale.linear()
            .domain([0, 1])
            .range(colorArray);
            console.log(lincol(0.5));
            var range = []; //this is the color range
            for (var i = 0; i < domainLength; i++) {
                range.push(lincol(i / domainLength)); //this selects evenly spaced items in between
            }
            return range;
        }
        else
        {
            return colorArray;
        }
    }
}