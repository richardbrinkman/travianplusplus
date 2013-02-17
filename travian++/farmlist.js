function delfarm(e) {
	chrome.storage.sync.get(null, function(db) {
		if (!db)
			db = {};
		if (!db.farms)
			db.farms = [];
		db.farms.splice(e.target.id,1);
		chrome.storage.sync.set(db, function() {
			window.location.href="http://ts4.travian.nl/dorf1.php";
		});
	});
}

function dorf1() {
	chrome.storage.sync.get(null, function(db) {
		var mapdetails = document.getElementById("map_details");
		var clearDiv = document.evaluate(
			"./div[@class=\"clear\"]",
			mapdetails,
			null,
			XPathResult.ANY_TYPE,
			null
		).iterateNext();
		var farms = document.createElement("div");
		farms.className = "boxes villageList units";
		var html =
			"<div class=\"boxes-tl\"></div>"+
			"<div class=\"boxes-tr\"></div>"+
			"<div class=\"boxes-tc\"></div>"+
			"<div class=\"boxes-ml\"></div>"+
			"<div class=\"boxes-mr\"></div>"+
			"<div class=\"boxes-mc\"></div>"+
			"<div class=\"boxes-bl\"></div>"+
			"<div class=\"boxes-br\"></div>"+
			"<div class=\"boxes-bc\"></div>"+
			"<div class=\"boxes-contents cf\">"+
				"<table id=\"farmlist\" cellpadding=\"1\" cellspacing=\"1\">"+
					"<thead>"+
						"<tr style=\"display: table-row; \">"+
							"<th colspan=\"3\">Farmlist:</th>"+
						"</tr>"+
					"</thead>"+
					"<tbody>";
		if (db.farms)
			for (i=0; i<db.farms.length; i++)
				html +=
					"<tr>"+
						"<td colspan=\"2\">"+
							"<a href=\"http://ts4.travian.nl/position_details.php?x=" + db.farms[i].x + "&y=" + db.farms[i].y + "\">" + db.farms[i].villageName + "</a>"+
						"</td>"+
						"<td>"+
							"<a>"+
								"<img id=\"" + i + "\" src=\"img/x.gif\" class=\"del\">"+
							"</a>"+
						"</td>"+
					"</tr>";
		html +=
					"</tbody>"+
				"</table>"+
			"</div>";
		farms.innerHTML = html;
		mapdetails.insertBefore(farms, clearDiv);
		for (i=0; i<db.farms.length; i++) {
			var link = document.getElementById(i);
			link.onclick = delfarm;
		}
	});
}

function addToFarmList() {
	var coordinates = document.evaluate(
		"//div[@id=\"content\"]/h1/span[1]",
		document,
		null,
		XPathResult.ANY_TYPE,
		null
	).iterateNext();
	var farm = {
		villageName: document.evaluate(
			"./span[@class=\"coordText\"]", 
			coordinates, null, XPathResult.ANY_TYPE, null
		).iterateNext().innerText,
		x: document.evaluate(
			"./span[@class=\"coordinatesWrapper\"]/span[@class=\"coordinateX\"]",
			coordinates, null, XPathResult.ANY_TYPE, null
		).iterateNext().innerText.slice(1),
		y: document.evaluate(
			"./span[@class=\"coordinatesWrapper\"]/span[@class=\"coordinateY\"]",
			coordinates, null, XPathResult.ANY_TYPE, null
		).iterateNext().innerText.replace(")", "")
	}
	chrome.storage.sync.get(null, function(db) {
		if (!db)
			db = {};
		if (!db.farms)
			db.farms = [];
		db.farms.push(farm); //TODO: check if farm already exists
		chrome.storage.sync.set(db, function() {
			alert("Toegevoegd: "+ farm.villageName + " op " + farm.x + "," + farm.y);
		});
	});
}

function positionDetails() {
	var tileDetails = document.getElementById("tileDetails");
	if (tileDetails) {
		var detailImage = tileDetails.getElementsByTagName("div");
		if (detailImage.length>0) {
			var options = detailImage[0].getElementsByTagName("div");
			if (options.length>0) {
				options[0].innerHTML += 
					"<div class=\"option\">"+
						"<a id=\"addToFarmListLink\" class=\"a arrow\" title=\"Voeg aan farmlijst toe\">Voeg aan farmlijst toe</a>"+
					"</div>";
				document.getElementById("addToFarmListLink").onclick = addToFarmList;
			}
		}
	} else
	window.alert("Geen tileDetails gevonden");
}

function parseTime(str) {
	var time = str.split(":");
	return time[0]*3600000 + time[1]*60000 + time[2]*1000;
}

function dorf3Row(row) {
	var buildingCell = row.getElementsByClassName("bui")[0];
	var href = row.getElementsByClassName("vil")[0].getElementsByTagName("a")[0].getAttribute("href");
	var marketPlaceHref = row.getElementsByClassName("tra")[0].getElementsByTagName("a")[0];
	marketPlaceHref.setAttribute(
		"href",
		marketPlaceHref.getAttribute("href") + "&newdid=" + getURLAttribute("newdid", href)
	);
	request = new XMLHttpRequest();
	request.responseType = "document";
	request.onreadystatechange = function() {
		if (this.readyState == 4) { //finished loading dorf1.php
			//Attack icons
			var movements = this.response.getElementById("movements");
			var attackCell = row.getElementsByClassName("att")[0];
			var timeout = 24*3600000; //A day in milliseconds
			var time;
			if (movements) {
				var attackIcons = "";
				["settlersOnTheWay", "hero_on_adventure", "att1", "att2", "att3", "def1", "def2","def3"].forEach(function(attackType) {
					if (movements.getElementsByClassName(attackType).length > 0)
						attackIcons +=
							"<img class=\"" + attackType + "\" src=\"img/x.gif\">";
				});
				attackCell.innerHTML = attackIcons;
				var timers = movements.getElementsByClassName("dur_r");
				for (var i=0; i<timers.length; i++) {
					time = parseTime(timers[i].getElementsByTagName("span")[0].innerText);
					if (time < timeout)
						timeout = time;
				}
			} else
				attackCell.innerHTML = "<span class=\"none\">-</span>";

			//Building icon
			var buildingContract = this.response.getElementById("building_contract");
			if (buildingContract) {
				var buildingIcons = "";
				var buildingRows = buildingContract.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
				for (var i=0; i<buildingRows.length; i++)
					buildingIcons +=
						"<a href=\"" + href + "\">" +
							"<img class=\"bau\" src=\"img/x.gif\" alt=\"" +
							buildingRows[i].getElementsByTagName("td")[1].innerText +
							"\">" +
						"</a>";
				buildingCell.innerHTML = buildingIcons;
				time = parseTime(this.response.getElementById("timer1").innerText);
				if (time < timeout)
					timeout = time;
			} else
				buildingCell.innerHTML = "<span class=\"none\">-</span>";

			if (timeout < 24*3600000)
				window.setTimeout(function(myRow) {
					return function() {
						location.reload();
					};
				}(row), timeout+1000);
		}
	};
	request.open("GET", href, true);
	request.send();
}

function dorf3() {
	if (document.getElementsByClassName("content")[1].getElementsByTagName("a").length == 0) { //Not using Travian plus
		var overview = document.getElementById("overview");
		if (overview) { //Correct tab
			var rows = overview.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
			for (var i=0; i<rows.length; i++)
				dorf3Row(rows[i]);
		}
	}
}

function max(x,y) {
	if (x<y)
		return y;
	else
		return x;
}

function dToXY(d) {
	var coord;
	coord.y = Math.round((320801 - d)/801);
	coord.x = d - 320801 + 801*coord.y;
	if (coord.x < -400 || coord.x > 400 || coord.y < -400 || coord.y > 400) //For debugging purposes only
		console.log("Calculated wrong coordinate (" + coord.x + "," + coord.y + ")");
	return coord;
}

function getURLAttribute(name, url) {
	var attributes = url.substr(url.indexOf("?")+1).split("&");
	var result;
	for (var i=0; i<attributes.length; i++) {
		var pair = attributes[i].split("=");
		if (pair[0] == name)
			result = pair[1];
	}
	return result;
}

function GraphCollection(hours, width, height, bordermargin) {
	this.graphs = [];
	this.hours = hours;
	this.width = width;
	this.height = height;
	this.bordermargin = bordermargin;
	this.states = [];
}

GraphCollection.prototype.add = function(graph) {
	this.graphs.push(graph);
	this.states.push({
		sender: graph,
		dorf1: false,
		marketplace: false,
		meetingplace: false
	});
};

GraphCollection.prototype.ready = function(graph, pageType) {
	var everythingReady = true;
	this.states.forEach(function(state) {
		if (state.sender == graph)
			state[pageType] = true;
		everythingReady = everythingReady && state.dorf1 && state.marketplace && state.meetingplace;
	});
	if (everythingReady)
		this.graphs.forEach(function(graph) {
			graph.drawResourceLevels();
		});
};

function Graph(graphs) {
	this.graphs = graphs;
	this.svg = null;
	this.newdid = null;
	this.name = null;
	this.x = 0;
	this.y = 0;
	this.wood = null;
	this.clay = null;
	this.iron = null;
	this.crop = null;
	this.resourceCapacity = 0;
	this.cropCapacity = 0;
	this.capacity = 0;
	this.woodProduction = 0;
	this.clayProduction = 0;
	this.ironProduction = 0;
	this.cropProduction = 0;
	this.translate = {};
	this.marketHref = null;
	this.meetingplaceHref = null;
	this.modifications = [];
	graphs.add(this);
}

Graph.prototype.setSVG = function() {
	this.svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
	this.svg.setAttribute("version", "1.1");
	this.svg.setAttribute("width", this.graphs.width + this.graphs.bordermargin);
	this.svg.setAttribute("height", this.graphs.height + this.graphs.bordermargin);
}

Graph.prototype.loadDorf1 = function() {
	var request = new XMLHttpRequest();
	request.responseType = "document";
	var self = this;
	request.onreadystatechange = function() {
		if (this.readyState == 4) { //finished loading dorf1.php
			//Get resources
			self.wood = this.response.getElementById("l1").innerText.split("/");
			self.clay = this.response.getElementById("l2").innerText.split("/");
			self.iron = this.response.getElementById("l3").innerText.split("/");
			self.crop = this.response.getElementById("l4").innerText.split("/");

			//Get capacities
			self.resourceCapacity = parseInt(self.wood[1]);
			self.cropCapacity = parseInt(self.crop[1]);
			self.capacity = max(self.resourceCapacity, self.cropCapacity);

			//Get production
			var production = this.response.getElementById("production").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
			self.woodProduction = production[0].getElementsByTagName("td")[2].innerText.replace(/\s/g, "");
			self.clayProduction = production[1].getElementsByTagName("td")[2].innerText.replace(/\s/g, "");
			self.ironProduction = production[2].getElementsByTagName("td")[2].innerText.replace(/\s/g, "");
			self.cropProduction = production[3].getElementsByTagName("td")[2].innerText.replace(/\s/g, "");

			//Define translate object
			self.translate = {
				dx: function(rx) {
					return self.graphs.width*rx/self.graphs.hours
				},
				x: function(rx) {
					return self.graphs.bordermargin + this.dx(rx);
				},
				dy: function(ry) {
					return -self.graphs.height*ry/self.capacity;
				},
				y: function(ry) {
					return self.graphs.height + this.dy(ry);
				}
			};
											
			//Draw resource capacity line
			var resourceCapacityLine=document.createElementNS("http://www.w3.org/2000/svg","path");
			resourceCapacityLine.setAttribute("style", "stroke:brown; stroke-width:2; fill: none; stroke-dasharray: 0,10,10,0");
			resourceCapacityLine.setAttribute("d", "M" + self.graphs.bordermargin + " " + self.translate.y(self.resourceCapacity) + " l" + self.graphs.width + " 0");
			self.svg.appendChild(resourceCapacityLine);
			
			//Draw crop capacity line
			var cropCapacityLine=document.createElementNS("http://www.w3.org/2000/svg","path");
			cropCapacityLine.setAttribute("style", "stroke:yellow; stroke-width:2; fill: none; stroke-dasharray: 10,10");
			cropCapacityLine.setAttribute("d", "M" + self.graphs.bordermargin + " " + self.translate.y(self.cropCapacity) + " l" + self.graphs.width + " 0");
			self.svg.appendChild(cropCapacityLine);

			//Draw axes
			var group=document.createElementNS("http://www.w3.org/2000/svg","g");
			group.setAttribute("id","axis");
			group.setAttribute("style", "fill:none; stroke:black; stroke-width:3");
			var axis=document.createElementNS("http://www.w3.org/2000/svg","path");
			var ticks="M" + self.graphs.bordermargin + " " + self.graphs.height;
			for (var j=0; j<self.graphs.hours; j++)
				ticks += " m" + self.translate.dx(1) + " 0 l 0 " + self.graphs.bordermargin + " m 0 -" + self.graphs.bordermargin;
			ticks += " M" + self.graphs.bordermargin + " " + self.graphs.height;
			for (var j=5000; j<self.capacity; j+=5000)
				ticks += " M " + self.graphs.bordermargin + " " + self.translate.y(j) + " l-" + self.graphs.bordermargin + " 0";
			axis.setAttribute("d", "M" + self.graphs.bordermargin + " 0 l0 " + self.graphs.height + " l" + self.graphs.width + " 0 " + ticks);
			group.appendChild(axis);
			self.svg.appendChild(group);
		}
		self.graphs.ready(self, "dorf1");
	}
	request.open("GET", "dorf1.php?newdid=" + this.newdid, true);
	request.send();
};

Graph.prototype.loadDorf2 = function() {
	var self = this;
	var request = new XMLHttpRequest();
	request.responseType = "document";
	request.onreadystatechange = function() {
		if (this.readyState == 4) { //finished loading dorf2.php
			//Find URLs for the marketplace and the meetingplace
			var buildings = this.response.getElementById("clickareas").getElementsByTagName("area");
			for (var i=0; i<buildings.length; i++) {
				if (buildings[i].getAttribute("alt").match(/Marktplaats/)) 
					self.marketHref = buildings[i].getAttribute("href");
				else if (buildings[i].getAttribute("alt").match(/Verzamelplaats/))
					self.meetingplaceHref = buildings[i].getAttribute("href");
			}
			if (self.marketHref)
				self.loadMarketplace();
			else
				self.graphs.ready(self, "marketplace");
			if (self.meetingplaceHref)
				self.loadMeetingplace(1);
			else
				self.graphs.ready(self, "meetingplace");
		}
	};
	request.open("GET", "dorf2.php?newdid=" + this.newdid, true);
	request.send();
};

Graph.prototype.loadMarketplace = function() {
	var self = this;
	var market = new XMLHttpRequest();
	market.responseType = "document";
	market.onreadystatechange = function () {
		if (this.readyState == 4) { //finished loading the market place
			//Parse market place
			var merchantsOnTheWay = this.response.getElementById("merchantsOnTheWay").getElementsByTagName("table");
			for (var j=0; j<merchantsOnTheWay.length; j++) {
				var description = merchantsOnTheWay[j].getElementsByTagName("thead")[0].getElementsByTagName("tr")[0].getElementsByTagName("td")[1].innerText;
				var rows = merchantsOnTheWay[j].getElementsByTagName("tbody")[0].getElementsByTagName("tr");
				var arrivalTime = rows[0].getElementsByTagName("td")[0].getElementsByTagName("div")[0].getElementsByTagName("span")[0].innerText.split(":");
				var modification = {
					time: parseInt(arrivalTime[0]) + parseInt(arrivalTime[1])/60 + parseInt(arrivalTime[2])/3600,
					resources: []
				};
				var resourceImages = rows[1].getElementsByTagName("td")[0].getElementsByTagName("span")[0].getElementsByTagName("img");
				for (var k=0; k<resourceImages.length; k++)
					modification.resources[k] = parseInt(resourceImages[k].nextSibling.nodeValue);
				if (description.match(/Transport van/)) {
					self.modifications.push(modification);
				} else if (description.match(/Transport naar/)) {
				} else if (description.match(/Terugkeer van/)) {
					var repeatElements = rows[1].getElementsByClassName("repeat");
					if (repeatElements.length > 0) {
						var repeatCount = parseInt(repeatElements[0].innerText.replace("x", ""));
						var negativeModification = modification;
						for (var k=0; k<resourceImages.length; k++)
							negativeModification.resources[k] = -modification.resources[k];
						self.modifications.push(negativeModification);
						//Add modification to other party at a later time
						//if (repeatCount > 2) {
						//Add negativeModification to self at a later time
						//Add modification to other party at a later time
					}
				}
			}
			self.graphs.ready(self, "marketplace");
		}
	};
	market.open("GET", this.marketHref + "&t=5&newdid=" + this.newdid, true);
	market.send();
};

Graph.prototype.loadMeetingplace = function(page) {
	var self = this;
	var meetingplace = new XMLHttpRequest();
	meetingplace.responseType = "document";
	meetingplace.onreadystatechange = function() {
		if (this.readyState == 4) { //finished loading the meeting place
			//Parse the meeting place
			var returningTroops = this.response.getElementById("build").getElementsByClassName("data")[0].getElementsByTagName("table");
			for (var j=0; j<returningTroops.length; j++) 
				if (returningTroops[j].getAttribute("class").match(/inReturn/)) {
					var infos = returningTroops[j].getElementsByClassName("infos");
					if (infos.length == 2) {
						var arrivalTime = infos[1].getElementsByTagName("tr")[0].getElementsByTagName("td")[0].getElementsByTagName("div")[0].getElementsByTagName("span")[0].innerText.split(":");
						var carriedResources = infos[0].getElementsByTagName("tr")[0].getElementsByTagName("td")[0].getElementsByTagName("div")[0].getElementsByTagName("span");
						var modification = {
							time: parseInt(arrivalTime[0]) + parseInt(arrivalTime[1])/60 + parseInt(arrivalTime[2])/3600,
							resources: []
						}
						for (var k=0; k<carriedResources.length; k++)
							modification.resources[k] = parseInt(carriedResources[k].getElementsByTagName("img")[0].nextSibling.nodeValue);
						self.modifications.push(modification);
					};
				}
			var next = this.response.getElementsByClassName("next")[0];
			if (next && next.tagName == "A") 
				self.loadMeetingplace(getURLAttribute("page", next.getAttribute("href")));
			else
				self.graphs.ready(self, "meetingplace");
		}
	};
	meetingplace.open("GET", this.meetingplaceHref + "&filter=1&tt=1&newdid=" + this.newdid + "&page=" + page, true);
	meetingplace.send();
};

Graph.prototype.drawResourceLevels = function() {
	//Draw projected resource levels
	var resources = [
		{resource: "wood", level: parseInt(this.wood[0]), growth: parseInt(this.woodProduction), color: "green", capacity: this.resourceCapacity},
		{resource: "clay", level: parseInt(this.clay[0]), growth: parseInt(this.clayProduction), color: "red", capacity: this.resourceCapacity},
		{resource: "iron", level: parseInt(this.iron[0]), growth: parseInt(this.ironProduction), color: "gray", capacity: this.resourceCapacity},
		{resource: "crop", level: parseInt(this.crop[0]), growth: parseInt(this.cropProduction), color: "yellow", capacity: this.cropCapacity}
	];
	this.modifications.push({
		time: this.graphs.hours,
		resources: [0,0,0,0]
	});
	this.modifications.sort(function(a,b) {return a.time-b.time});
	for (var j=0; j<resources.length; j++) {
		var line=document.createElementNS("http://www.w3.org/2000/svg","path");
		line.setAttribute("style", "stroke-width:2; fill: none; stroke: " + resources[j].color);
		var level = resources[j].level;
		var time = 0;
		var path = "M" + this.translate.x(time) + " " + this.translate.y(level); //Startpoint
		for(var k=0; k<this.modifications.length; k++)
			if (this.modifications[k].time <= this.graphs.hours) {
				var newLevel = level + resources[j].growth * (this.modifications[k].time-time);
				if (newLevel < 0 || newLevel > resources[j].capacity) {
					var y = (newLevel < 0) ? 0 : resources[j].capacity;
					time = (y - level + time*resources[j].growth) / resources[j].growth;
					level = y;
					newLevel = level;
					path += " L" + this.translate.x(time) + " " + this.translate.y(level);
				}
				level = newLevel;
				time = this.modifications[k].time;
				path += " L" + this.translate.x(time) + " " + this.translate.y(level);
				if (this.modifications[k].resources[j] != 0) {
					level += this.modifications[k].resources[j];
					if (level < 0) 
						level = 0;
					if (level > resources[j].capacity) 
						level = resources[j].capacity;
					path += " L" + this.translate.x(time) + " " + this.translate.y(level);
				}
			}
		//path += " l" + this.translate.dx(this.graphs.hours-time) + " " + this.translate.dy((this.graphs.hours-time)*resources[j].growth); //Endpoint
		line.setAttribute("d", path);
		this.svg.appendChild(line);
	}
};

function addgraphtab() {
	var tabs = document.evaluate(
		"//div[@class=\"contentNavi tabNavi \"]",
		document,
		null,
		XPathResult.ANY_TYPE,
		null
	).iterateNext();
	var cleartab = document.evaluate(
		"./div[@class=\"clear\"]",
		tabs,
		null,
		XPathResult.ANY_TYPE,
		null
	).iterateNext();
	var graphtab = document.createElement("div");
	graphtab.setAttributeNode(document.createAttribute("title"));
	graphtab.className="container normal";
	graphtab.innerHTML=
		"<div class=\"background-start\">&nbsp;</div>" +
		"<div class=\"background-end\">&nbsp;</div>" +
		"<div class=\"content\">" +
			"<a href=\"statistiken.php?id=0&idSub=4\" class=\"tabItem\">Grafiek</a>"+
		"</div>";
	tabs.insertBefore(graphtab, cleartab);
	if (window.location.search == "?id=0&idSub=4") {
		//Unfocus other tabs
		var othertabs = tabs.getElementsByTagName("div");
		for (i=0; i<4; i++)
			if (othertabs[i].hasAttribute("title"))
				othertabs[i].className="container normal";

		//Give focus to Grafiek tab
		graphtab.className="container active";

		//Set the header
		var content=document.getElementById("content");
		content.getElementsByTagName("h4")[0].innerText="Grondstoffen grafiekjes";

		//Remove the content
		content.removeChild(document.getElementById("player"));
		content.removeChild(document.getElementById("search_navi"));

		var cleardiv = document.evaluate(
			"./div[@class=\"clear\"]",
			content,
			null,
			XPathResult.ANY_TYPE,
			null
		).iterateNext();
		
		//Define dimensions
		var height = 300;
		var width = 520;
		var bordermargin = 5;
		var hours = 24;

		//Load village coordinates
		var spieler = new XMLHttpRequest();
		spieler.responseType = "document";
		spieler.onreadystatechange = function() {
			if (this.readyState == 4) { //finished loading the spieler
				var graphs = new GraphCollection(hours, width, height, bordermargin);
				var villages = this.response.getElementById("villages").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
				var villageListLinks = document.getElementById("villageListLinks").getElementsByClassName("entry");

				//Iterate over all the villages
				for (i=0; i < villages.length; i++) (function(village, villageLink, graph) {
					//Add village name as header
					var villageHeader = document.createElement("h5");
					graph.name = villageLink.innerText;
					graph.x = parseInt(village.getElementsByClassName("coordinateX")[0].innerText.substr(1));
					var yStr = village.getElementsByClassName("coordinateY")[0].innerText;
					graph.y = parseInt(yStr.substr(0, yStr.length-1));
					graph.newdid = getURLAttribute("newdid", villageLink.getAttribute("href"));
					villageHeader.innerText=villageLink.innerText;
					content.insertBefore(villageHeader, cleardiv);
					
					//Place empty svg
					graph.setSVG();
					graph.loadDorf1();
					graph.loadDorf2();
					content.insertBefore(graph.svg, cleardiv);
				})(villages[i], villageListLinks[i].getElementsByTagName("a")[0], new Graph(graphs));
			}
			}
		};
		spieler.open("GET", document.getElementsByClassName("sideInfoPlayer")[0].getElementsByTagName("a")[0].getAttribute("href"), true);
		spieler.send();
}

var uri = document.documentURI;
var map = [
	{
		regexp: /http:\/\/ts4.travian.nl\/dorf1.php/,
		func: dorf1
	},
	{
		regexp: /http:\/\/ts4.travian.nl\/dorf3.php/,
		func: dorf3
	},
	{
		regexp: /http:\/\/ts4.travian.nl\/position_details.php/,
		func: positionDetails
	},
	{
		regexp: /http:\/\/ts4.travian.nl\/statistiken.php/,
		func: addgraphtab
	}
];
for (i=0; i<map.length; i++)
	if (map[i].regexp.test(uri))
		map[i].func();
