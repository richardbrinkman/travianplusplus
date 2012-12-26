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
				buildingCell.innerHTML =
					"<a href=\"" + href + "\">" +
						"<img class=\"bau\" src=\"img/x.gif\" alt=\"" +
						buildingContract.getElementsByTagName("tbody")[0].getElementsByTagName("tr")[0].getElementsByTagName("td")[1].innerText +
						"\">" +
					"</a>";
				time = parseTime(this.response.getElementById("timer1").innerText);
				if (time < timeout)
					timeout = time;
			} else
				cell.innerHTML = "<span class=\"none\">-</span>";
			if (timeout < 24*3600000)
				window.setTimeout(function(myRow) {
					return function() {
						dorf3Row(myRow);
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
}

GraphCollection.prototype.add = function(graph) {
	this.graphs.push(graph);
};

function Graph(graphs) {
	this.graphs = graphs;
	this.svg = null;
	this.newdid = null;
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
					return self.graphs.bordermargin + this.dx(rx); //TODO parse time, etc.
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
	}
	request.open("GET", "dorf1.php?newdid=" + this.newdid, true);
	request.send();
};

Graph.prototype.loadDorf2 = function() {
	var request = new XMLHttpRequest();
	request.responseType = "document";
	request.graph = this.graph;
	request.onreadystatechange = function() {
		if (this.readyState == 4) { //finished loading dorf2.php
			//Find URLs for the marketplace and the meetingplace
			var buildings = this.response.getElementById("clickareas").getElementsByTagName("area");
			for (var i=0; i<buildings.length; i++) {
				if (buildings[i].getAttribute("alt").match(/Marktplaats/))
					self.marketHref = buildings[i].getAttribute("href");
				if (buildings[i].getAttribute("alt").match(/Verzamelplaats/))
					self.meetingplaceHref = buildings[i].getAttribute("href");
			}
		}
	};
	request.open("GET", "dorf2.php?newdid=" + this.newdid, true);
	request.send();
};

Graph.prototype.loadMarketplace = function() {
	var market = new XMLHttpRequest();
	market.responseType = "document";
	market.graph = this.graph;
	market.onreadystatechange = function () {
		if (this.readyState == 4) { //finished loading the market place
			var modifications = []; //Will contain objects with all the resource modifications (incoming merchants/troops)

			//Parse market place
			var merchantsOnTheWay = this.response.getElementById("merchantsOnTheWay").getElementsByTagName("table");
			for (var j=0; j<merchantsOnTheWay.length; j++) {
				if (merchantsOnTheWay[j].getElementsByTagName("thead")[0].getElementsByTagName("tr")[0].getElementsByTagName("td")[1].innerText.match(/Transport van/)) {
					var rows = merchantsOnTheWay[j].getElementsByTagName("tbody")[0].getElementsByTagName("tr");
					var arrivalTime = rows[0].getElementsByTagName("td")[0].getElementsByTagName("div")[0].getElementsByTagName("span")[0].innerText.split(":");
					var modification = {
						time: parseInt(arrivalTime[0]) + parseInt(arrivalTime[1])/60 + parseInt(arrivalTime[2])/3600,
						resources: []
					};
					var resourceImages = rows[1].getElementsByTagName("td")[0].getElementsByTagName("span")[0].getElementsByTagName("img");
					for (var k=0; k<resourceImages.length; k++)
						modification.resources[k] = parseInt(resourceImages[k].nextSibling.nodeValue);
					modifications.push(modification);
				}
			}
		}
	};
	market.open("GET", marketHref + "&t=5&newdid=" + this.newdid, true);
	market.send();
};

Graph.prototype.loadMeetingplace = function() {
	var meetingplace = new XMLHttpRequest();
	meetingplace.responseType = "document";
	meetingplace.graph = this.graph;
	meetingplace.modifications = modifications;
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
						modifications.push(modification);
					};
				}
		}
	};
	meetingplace.open("GET", meetingplaceHref + "&tt=1&newdid=" + this.newdid, true);
	meetingplace.send();
};

Graph.prototype.drawResourceLevels = function() {
	//Draw projected resource levels
	var resources = [
		{resource: "wood", level: parseInt(wood[0]), growth: parseInt(woodProduction), color: "green"},
		{resource: "clay", level: parseInt(clay[0]), growth: parseInt(clayProduction), color: "red"},
		{resource: "iron", level: parseInt(iron[0]), growth: parseInt(ironProduction), color: "gray"},
		{resource: "crop", level: parseInt(crop[0]), growth: parseInt(cropProduction), color: "yellow"}
	];
	this.modifications.sort(function(a,b) {return a.time-b.time});
	for (var j=0; j<resources.length; j++) {
		var line=document.createElementNS("http://www.w3.org/2000/svg","path");
		line.setAttribute("style", "stroke-width:2; fill: none; stroke: " + resources[j].color);
		var path = "M" + bordermargin + " " + translate.y(resources[j].level); //Startpoint
		var time = 0;
		for(var k=0; k<modifications.length; k++) 
			if (this.modifications[k].time < hours && this.modifications[k].resources[j] != 0) {
				path += " l" + translate.dx(this.modifications[k].time-time) + " " + translate.dy((this.modifications[k].time-time)*resources[j].growth);
				path += " l0 " + translate.dy(this.modifications[k].resources[j]);
				time = this.modifications[k].time;
			}
		path += " l" + translate.dx(hours-time) + " " + translate.dy((hours-time)*resources[j].growth); //Endpoint
		line.setAttribute("d", path);
		this.graph.svg.appendChild(line);
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
		
		var villageList=document.getElementById("villageListLinks");
		var villages=villageList.getElementsByTagName("li");

		//Define dimensions
		var height = 300;
		var width = 520;
		var bordermargin = 5;
		var hours = 24;

		//Iterate over all the villages
		var graphs = new GraphCollection(hours, width, height, bordermargin);
		for (i=0; i < villages.length; i++) (function(village, graph) {
			//Add village name as header
			var villageHeader = document.createElement("h5");
			var villageLink = village.getElementsByTagName("a")[0];
			graph.newdid = getURLAttribute("newdid", villageLink.getAttribute("href"));
			villageHeader.innerText=villageLink.innerText;
			content.insertBefore(villageHeader, cleardiv);
			
			//Place empty svg
			graph.setSVG();
			graph.loadDorf1();
			graph.loadDorf2();
			content.insertBefore(graph.svg, cleardiv);
		})(villages[i], new Graph(graphs));
	}
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
