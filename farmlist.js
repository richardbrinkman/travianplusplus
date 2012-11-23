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

		//Iterate over all the villages
		for (i=0; i<villages.length; i++) {
			//Add village name as header
			var villageHeader = document.createElement("h5");
			villageHeader.innerText=villages[i].getElementsByTagName("a")[0].innerText;
			content.insertBefore(villageHeader, cleardiv);

			//Add the resources graph
			var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
			svg.setAttribute("version", "1.1");

			//Draw axes
			var group=document.createElementNS("http://www.w3.org/2000/svg","g");
			group.setAttribute("fill", "none");
			group.setAttribute("stroke", "black");
			group.setAttribute("stroke-width", "3");
			var axis=document.createElementNS("http://www.w3.org/2000/svg","path");
			axis.setAttribute("d", "M0 0 l0 300 l550 0");
			group.appendChild(axis);

			svg.appendChild(group);
			content.insertBefore(svg, cleardiv);
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
