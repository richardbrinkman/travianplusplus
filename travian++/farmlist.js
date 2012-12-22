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

function dorf3() {
	var overview = document.getElementById("overview");
	if (overview) { //Correct tab
		if (overview.getElementsByClassName("none").length > 0) { //Not using Plus
			var rows = overview.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
			var requests = [];
			for (var i=0; i<rows.length; i++) {
				var cols = rows[i].getElementsByTagName("td");
				requests[i] = new XMLHttpRequest();
				requests[i].responseType = "document";
				requests[i].row = rows[i];
				requests[i].onreadystatechange = function() {
					if (this.readyState == 4) { //finished loading dorf1.php
						var buildingContract = this.response.getElementById("building_contract");
						if (buildingContract) {
							var cell = this.row.getElementsByClassName("bui")[0];
							cell.innerHTML =
								"<img class=\"bau\" src=\"img/x.gif\" alt=\"" +
								buildingContract.getElementsByTagName("tbody")[0].getElementsByTagName("tr")[0].getElementsByTagName("td")[1].innerText +
								"\">";
							var time = this.response.getElementById("timer1").innerText.split(":");
							window.setTimeout(function(mycell) {
								return function() {
									mycell.innerHTML = "<span class=\"none\">-</span>";
								};
							}(cell), time[0]*3600000 + time[1]*60000 + time[2]*1000);
						}
					}
				};
				requests[i].open("GET", cols[0].getElementsByTagName("a")[0].getAttribute("href"), true);
				requests[i].send();
			}
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
		var graphs = [];
		for (i=0; i<villages.length; i++) {
			//Add village name as header
			var villageHeader = document.createElement("h5");
			var villageLink = villages[i].getElementsByTagName("a")[0];
			villageHeader.innerText=villageLink.innerText;
			content.insertBefore(villageHeader, cleardiv);

			//Add the resources graph
			graphs[i] = {};
			graphs[i].svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
			graphs[i].svg.setAttribute("version", "1.1");
			graphs[i].svg.setAttribute("width", width+bordermargin);
			graphs[i].svg.setAttribute("height", height+bordermargin);
			graphs[i].svg.setAttribute("id", i);

			//Load dorf1.php
			graphs[i].dorf1 = new XMLHttpRequest();
			graphs[i].dorf1.responseType = "document";
			graphs[i].dorf1.graph=graphs[i];
			graphs[i].dorf1.onreadystatechange = function() {
				if (this.readyState == 4) { //finished loading dorf1.php
					var newdid = getURLAttribute("newdid", this.response.URL);

					//Get resources
					var wood = this.response.getElementById("l1").innerText.split("/");
					var clay = this.response.getElementById("l2").innerText.split("/");
					var iron = this.response.getElementById("l3").innerText.split("/");
					var crop = this.response.getElementById("l4").innerText.split("/");

					//Get capacities
					var resourceCapacity = parseInt(wood[1]);
					var cropCapacity = parseInt(crop[1]);
					var capacity = max(resourceCapacity, cropCapacity);

					//Get production
					var production = this.response.getElementById("production").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
					var woodProduction = production[0].getElementsByTagName("td")[2].innerText.replace(/\s/g, "");
					var clayProduction = production[1].getElementsByTagName("td")[2].innerText.replace(/\s/g, "");
					var ironProduction = production[2].getElementsByTagName("td")[2].innerText.replace(/\s/g, "");
					var cropProduction = production[3].getElementsByTagName("td")[2].innerText.replace(/\s/g, "");

					//Define translate object
					var translate = {
						dx: function(rx) {
							return width*rx/hours
						},
						x: function(rx) {
							return bordermargin + this.dx(rx); //TODO parse time, etc.
						},
						dy: function(ry) {
							return -height*ry/capacity;
						},
						y: function(ry) {
							return height + this.dy(ry);
						}
					};

					//Load dorf2.php
					var dorf2 = new XMLHttpRequest();
					dorf2.responseType = "document";
					dorf2.graph = this.graph;
					dorf2.newdid = newdid;
					dorf2.onreadystatechange = function() {
						if (this.readyState == 4) { //finished loading dorf2.php
							//Find URLs for the marketplace and the meetingplace
							var buildings = this.response.getElementById("clickareas").getElementsByTagName("area");
							var marketHref;
							var meetingplaceHref;
							for (var i=0; i<buildings.length; i++) {
								if (buildings[i].getAttribute("alt").match(/Marktplaats/))
									marketHref = buildings[i].getAttribute("href");
								if (buildings[i].getAttribute("alt").match(/Verzamelplaats/))
									meetingplaceHref = buildings[i].getAttribute("href");
							}

							//Load market place
							var market = new XMLHttpRequest();
							market.responseType = "document";
							market.graph = this.graph;
							market.newdid = this.newdid;
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

									//Load meetingplace
									var meetingplace = new XMLHttpRequest();
									meetingplace.responseType = "document";
									meetingplace.graph = this.graph;
									meetingplace.newdid = this.newdid;
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

											//Draw resource capacity line
											var resourceCapacityLine=document.createElementNS("http://www.w3.org/2000/svg","path");
											resourceCapacityLine.setAttribute("style", "stroke:brown; stroke-width:2; fill: none; stroke-dasharray: 0,10,10,0");
											resourceCapacityLine.setAttribute("d", "M" + bordermargin + " " + translate.y(resourceCapacity) + " l" + width + " 0");
											this.graph.svg.appendChild(resourceCapacityLine);
											
											//Draw crop capacity line
											var cropCapacityLine=document.createElementNS("http://www.w3.org/2000/svg","path");
											cropCapacityLine.setAttribute("style", "stroke:yellow; stroke-width:2; fill: none; stroke-dasharray: 10,10");
											cropCapacityLine.setAttribute("d", "M" + bordermargin + " " + translate.y(cropCapacity) + " l" + width + " 0");
											this.graph.svg.appendChild(cropCapacityLine);

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
												path += " l" + width + " " + translate.dy((hours-time)*resources[j].growth); //Endpoint
												line.setAttribute("d", path);
												this.graph.svg.appendChild(line);
											}

											//Draw axes
											var group=document.createElementNS("http://www.w3.org/2000/svg","g");
											group.setAttribute("id","axis");
											group.setAttribute("style", "fill:none; stroke:black; stroke-width:3");
											var axis=document.createElementNS("http://www.w3.org/2000/svg","path");
											var ticks="M" + bordermargin + " " + height;
											for (var j=0; j<hours; j++)
												ticks += " m" + translate.dx(1) + " 0 l 0 " + bordermargin + " m 0 -" + bordermargin;
											ticks += " M" + bordermargin + " " + height;
											for (var j=5000; j<capacity; j+=5000)
												ticks += " M " + bordermargin + " " + translate.y(j) + " l-" + bordermargin + " 0";
											axis.setAttribute("d", "M" + bordermargin + " 0 l0 " + height + " l" + width + " 0 " + ticks);
											group.appendChild(axis);
											this.graph.svg.appendChild(group);
										}
									};
									meetingplace.open("GET", meetingplaceHref + "&tt=1&newdid=" + this.newdid, true);
									meetingplace.send();
								}
							};
							market.open("GET", marketHref + "&t=5&newdid=" + this.newdid, true);
							market.send();
						}
					};
					dorf2.open("GET", "dorf2.php?newdid=" + newdid, true);
					dorf2.send();

				}	
			};
			graphs[i].dorf1.open("GET", "dorf1.php" + villageLink.getAttribute("href"), true);
			graphs[i].dorf1.send();
			content.insertBefore(graphs[i].svg, cleardiv);
		}
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
