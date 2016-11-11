function BSch(importedModel) {
	this.model = importedModel;
	this.thermostatSettingsDict = {
		"#slider-range-mon": { index: 1, texteq: "temp-range-mon" },
		"#slider-range-tues": { index: 2, texteq: "temp-range-tues" },
		"#slider-range-wed": { index: 3, texteq: "temp-range-wed" },
		"#slider-range-thurs": { index: 4, texteq: "temp-range-thurs" },
		"#slider-range-fri": { index: 5, texteq: "temp-range-fri" },
		"#slider-range-sat": { index: 6, texteq: "temp-range-sat" },
		"#slider-range-sun": { index: 0, texteq: "temp-range-sun" },
	};
	this.PossibleUnits = [
		{ "degree Celsius": { "59cff3c8-152f-41e4-8cc7-27b7ef96bd36": "degree Celsius", "60211ebc-d411-47b2-9f7f-656187539732": "Temperature" } },
		{ "degree Fahrenheit": { "1dee251b-eea9-4372-9173-67ae975d7d9e": "degree Fahrenheit", "60211ebc-d411-47b2-9f7f-656187539732": "Temperature" } }
	]; //stores all UomJson
	this.UnitsType = "Temperature";
	this.sliderbasehtml = "";
	this.temperaturetexthtml = "";
	this.previousUnits = ""; //warning!  This is slightly dangerous and could cause a bug.
	this.currentUnits = importedModel[0].UomJson;
	this.startingUnits = "";
}

BSch.prototype = {
	constructor: BSch,
	setUnitButton: function() //sets the unit button initially
	{
		if(this.currentUnits == "degree Fahrenheit") {
			$("#btnF").addClass("active");
		} else {
			$("#btnC").addClass("active");
		}
	},

	setUpThermostatSch: function(divId) {
		this.sliderbasehtml = "";
		this.temperaturetexthtml = "<h4 style='margin-left: -16px;'>Temperature Setpoints</h4>";;
		var temprow, headername, rangename;
		for(var i = 0; i < 7; i++) {
			switch(i) {
			case 0:
				temprow = "mon-temp-row";
				headername = "MON";
				rangename = "slider-range-mon";
				this.sliderbasehtml += this.writeTempSliderHtml(temprow, headername, rangename);

				break;
			case 1:
				temprow = "tues-temp-row";
				headername = "TUE";
				rangename = "slider-range-tues";
				this.sliderbasehtml += this.writeTempSliderHtml(temprow, headername, rangename);
				break;
			case 2:
				temprow = "wed-temp-row";
				headername = "WED";
				rangename = "slider-range-wed";
				this.sliderbasehtml += this.writeTempSliderHtml(temprow, headername, rangename);
				break;
			case 3:
				temprow = "thurs-temp-row";
				headername = "THU";
				rangename = "slider-range-thurs";
				this.sliderbasehtml += this.writeTempSliderHtml(temprow, headername, rangename);
				break;
			case 4:
				temprow = "fri-temp-row";
				headername = "FRI";
				rangename = "slider-range-fri";
				this.sliderbasehtml += this.writeTempSliderHtml(temprow, headername, rangename);
				break;
			case 5:
				temprow = "sat-temp-row";
				headername = "SAT";
				rangename = "slider-range-sat";
				this.sliderbasehtml += this.writeTempSliderHtml(temprow, headername, rangename);
				break;
			case 6:
				temprow = "sun-temp-row";
				headername = "SUN";
				rangename = "slider-range-sun";
				this.sliderbasehtml += this.writeTempSliderHtml(temprow, headername, rangename);
				break;
			}
		}
		$(divId).html(this.sliderbasehtml);
	},
	setUpLoop: function() {
		for(var day in this.thermostatSettingsDict) {
			this.setUpTempSlider(day, this.model[this.thermostatSettingsDict[day].index], this.currentUnits);
		}
	},
	writeTempSliderHtml: function(temprow, headername, rangename) {
		var html = "";
		html += '<div class="temp-schedule-row" id=' + '"' + temprow + '">';
		html += '<div class="temp-schedule-day">';
		html += '<h5>' + headername + ':</h5>';
		html += '</div>';
		html += '<div id="slider-range">';
		//html += '<span class="field-tip">';
		html += '<div id="' + rangename + '">';
		//html += '<span class="tip-content"></span>';
		html += '</div>';
		//html += '</span>';
		html += '</div>';
		html += '</div>';
		return html;
	},
	setUpTempSlider: function(dayOfWeekId, dbValues, currentUnits) {
		$mySlider = $(dayOfWeekId);
		var min = 0;
		var max = 0;
		var thermosettings = this.thermostatSettingsDict;
		var model = this.model;

		//debugger;
		if(currentUnits == "degree Fahrenheit") {
			min = 50;
			max = 100;
		} else {
			min = 10;
			max = 40;
		}
		$mySlider.slider({
				//      range: true,//don't set range
				//set up mins and maxes based on a pre-defined template that can be changed
				min: min, //in the future, this may not want to be hardcoded
				max: max, //in the future, this may not want to be hardcoded
				step: 1,
				ticks: true,
				values: [this.convertUnits(this.previousUnits, this.currentUnits, dbValues.NighttimeHeating), this.convertUnits(this.previousUnits, this.currentUnits, dbValues.DaytimeHeating), this.convertUnits(this.previousUnits, this.currentUnits, dbValues.DaytimeCooling), this.convertUnits(this.previousUnits, this.currentUnits, dbValues.NighttimeCooling)], //place real values here from the model
				slide: function(evt, ui) {
					for(var i = 0, l = ui.values.length; i < l; i++) {
						if(i !== l - 1 && ui.values[i] > ui.values[i + 1]) {
							return false;
						} else if(i === 0 && ui.values[i] < ui.values[i - 1]) {
							return false;
						}
					}
					//console.log(ui)
					//console.log("Current slider:", $(this).attr("id"))
					var dayAssoc = thermosettings[dayOfWeekId];
					UpdateDisplayTemperature(dayAssoc, ui.values); //also updates the model temperatures at the same time
					console.log("Model to be updated", model[thermosettings[dayOfWeekId].index]);
					model[thermosettings[dayOfWeekId].index].NighttimeHeating = ui.values[0];
					model[thermosettings[dayOfWeekId].index].DaytimeHeating = ui.values[1];
					model[thermosettings[dayOfWeekId].index].DaytimeCooling = ui.values[2];
					model[thermosettings[dayOfWeekId].index].NighttimeCooling = ui.values[3];
					//set the units of measure at the end, because setting Uom cannot be declared here.
				}
			})
			.each(function() {
				// Add labels to slider whose values
				// are specified by min, max
				// Get the options for this slider (specified above
				console.log($(this).data());
				for(var prop in $(this).data()) {
					if(prop == "appSlider") {
						var opt = $(this).data().appSlider.options;
						// Get the number of possible values
						var vals = opt.max - opt.min;
						var step = 5; //the labels are always in increments of 5, the min and max are always in multiples of 10
						// Position the labels
						for(var i = 0; i <= vals; i += step) {
							// Create a new element and position it with percentages
							var el = $('<label class="slider-label">' + (i + opt.min) + '</label>').css('left', (i / vals * 100) + '%');
							// Add the element inside #slider
							$(dayOfWeekId).append(el);
						}
						break;
					} else if(prop == "uiSlider") {
						var opt = $(this).data().uiSlider.options;
						// Get the number of possible values
						var vals = opt.max - opt.min;
						var step = 5; //the labels are always in increments of 5, the min and max are always in multiples of 10
						// Position the labels
						for(var i = 0; i <= vals; i += step) {
							// Create a new element and position it with percentages
							var el = $('<label class="slider-label">' + (i + opt.min) + '</label>').css('left', (i / vals * 100) + '%');
							// Add the element inside #slider
							$(dayOfWeekId).append(el);
						}
						break;
					}
				}
			});
		$("#amount").val(
			[
				"$" + $mySlider.slider("values", 0),
				"$" + $mySlider.slider("values", 1),
				"$" + $mySlider.slider("values", 2),
				"$" + $mySlider.slider("values", 3)
			].join(" - ")
		);
		var values = $mySlider.slider("values");
		//need a method to ensure the models is updated when converting from one unit to the next (drag already implemented above)
		this.model[thermosettings[dayOfWeekId].index].NighttimeHeating = values[0];
		this.model[thermosettings[dayOfWeekId].index].DaytimeHeating = values[1];
		this.model[thermosettings[dayOfWeekId].index].DaytimeCooling = values[2];
		this.model[thermosettings[dayOfWeekId].index].NighttimeCooling = values[3];
		this.makeDisplayTemperature(dayOfWeekId, "#tempValues", values);

	},
	makeDisplayTemperature: function(dayId, divId, values) {
		debugger;
		var teq = this.thermostatSettingsDict[dayId].texteq;
		this.temperaturetexthtml += '<div class="temp-text-row">';
		this.temperaturetexthtml += '<div id="' + teq + '">';
		this.temperaturetexthtml += 'Heat Nite: ' + values[0] + ", " + "Heat Day: " + values[1] + ", " + "Cool Day: " + values[2] + ", " + "Cool Nite: " + values[3];
		this.temperaturetexthtml += '</div>';
		this.temperaturetexthtml += '</div>';
	},

	convertUnits: function(from, to, valToBeConverted) {
		if(from == to) {
			return valToBeConverted;
		} //needed for initialization
		else {
			if(from == "degree Fahrenheit") {
				return (valToBeConverted - 32) / 1.8;
			} else {
				return (valToBeConverted * 1.8) + 32;
			}
		}
	},
	setstartingUnits: function() {
		debugger;
		try {
			for(var i = 0; i < this.PossibleUnits.length; i++) {
				for(var p in this.PossibleUnits[i]) {
					var possibleKeys = Object.keys(this.PossibleUnits[i][p]);
					var actualKeys = Object.keys(this.model[0].UomJson);
					var keysMatch = true;
					for(var key in possibleKeys) {
						if(actualKeys.indexOf(possibleKeys[key]) > -1) {

						} else {
							keysMatch = false;
							break;
						}
					}
					if(keysMatch) {
						this.startingUnits = p;
						this.currentUnits = p;
						this.previousUnits = p;
					}
				}
			}
		} catch(error) {
			console.log(error);
		}
	},
	setCurrentUnits: function(units) {
		this.currentUnits = units;
	},
	setPreviousUnits: function() {
		debugger;
		//this will always take the current units, and apply the opposite
		if(this.currentUnits == "degree Celsius") this.previousUnits = "degree Fahrenheit";
		else this.previousUnits = "degree Celsius"; //update the HTML buttons
	},
	setUomJson: function(itemToUpdate) //at the point of saving back, this sets the UomJson prior to the save
	{
		itemToUpdate.UomJson = this.PossibleUnits[this.currentUnits];
	}
};