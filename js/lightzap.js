/*
	███   	▄                   ▄▄▄  ▄▄  ▄▄▄
	██    	█    ▀  ▄▄  ▄ ▄ ▄▄▄   █ █  █ █  █
	█████ 	█    █ █  ▀ █ █  █   █  █▄▄█ █▄▄▀
	  ██  	█    █ █ ▀█ █▀█  █  █   █  █ █
	  █   	▀▀▀▀ ▀  ▀▀  ▀ ▀  ▀  ▀▀▀ ▀  ▀ ▀  v2.54b (2014.06.12)
			by Dragonzap - Szalai Mihaly
*/
var lz = new function() {
//----- Options --------
	this.options = {
		imagetext	: "",	//"Image "
		oftext		: " / ",//" of "
		bytext		: "by",	//"by"
		notfoundtext	: "Image not found",
		print		: false,
		download	: false,
		like		: false,
		circling	: false,
		attr		: "data-lightzap"
		};
//----------------------
	this.album = [];
	this.pfx = ["webkit", "moz", "ms", "o", ""];
	this.albumN = "";
	this.imgID = 0;
	this.isfull = false;
	this.mrgW = -1;
	this.mrgH = -1;
	this.hq = "hq";

	this.getStyle = function(e, s) {
		if (window.getComputedStyle)
			return window.getComputedStyle(e,s);
		else if (e.currentStyle) //IE
			return element.currentStyle[s];
		else if (document.defaultView && document.defaultView.getComputedStyle) //Firefox
			return document.defaultView.getComputedStyle(e, "")[s];
		else //try and get inline style
			return e.style[s];
	};
	this.init = function() {
		//var startTime = new Date().getTime(); //DEBUG
		lz.updateLinks();

		//FullScreen
		var pfx0 = ["IsFullScreen", "FullScreen"], pfx1 = ["CancelFullScreen", "RequestFullScreen"];
		var k, m, t = "undefined", p = 0;
		while (p < lz.pfx.length && !document[m])
		{
			k = 0;
			while (k < pfx0.length)
			{
				m = pfx0[k];
				if (lz.pfx[p] === "")
				{
					m = m.substr(0, 1).toLowerCase() + m.substr(1);
					pfx1[0] = pfx1[0].substr(0, 1).toLowerCase() + pfx1[0].substr(1);
					pfx1[1] = pfx1[1].substr(0, 1).toLowerCase() + pfx1[1].substr(1);
				}
				m = lz.pfx[p] + m;
				t = typeof document[m];
				if (t != "undefined")
				{
					lz.pfx = [lz.pfx[p] + pfx1[0], lz.pfx[p] + pfx1[1], m];
					p = 2;
					break;
				}
				k++;
			}
			p++;
		}

		//Build lightzap
		lz.main = document.createElement("div");
		lz.main.id = "lightzap";
		lz.main.style.display = 'none';
		document.body.appendChild(lz.main);

		lz.bg = document.createElement("div");
		lz.bg.id = "lz-bg";
		lz.bg.style = "filter:url(#blur);";
		lz.bg.addEventListener("click", lz.end, false);
		lz.bg.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><defs><filter id="blur" x="0" y="0"><feGaussianBlur in="SourceGraphic" stdDeviation="30"/></filter></defs></svg>';
		lz.main.appendChild(lz.bg);

		lz.cont = document.createElement("div");
		lz.cont.id = "lz-container";
		lz.main.appendChild(lz.cont);

		var tmp = document.createElement("div");
		tmp.id = "lz-loader";
		lz.cont.appendChild(tmp);

		lz.img = document.createElement("img");
		lz.img.id = "lz-image";
		lz.cont.appendChild(lz.img);

		var grp = document.createElement("div");
		grp.id = "lz-nav";
		lz.cont.appendChild(grp);

		tmp = document.createElement("a");
		tmp.title = "Previous";
		tmp.id = "lz-prev";
		tmp.addEventListener("click", function() {lz.changeImg(lz.imgID + 1)}, false);
		grp.appendChild(tmp);

		tmp = document.createElement("a");
		tmp.title = "Next";
		tmp.id = "lz-next";
		tmp.addEventListener("click", function() {lz.changeImg(lz.imgID - 1)}, false);
		grp.appendChild(tmp);

		grp = document.createElement("div");
		grp.id = "lz-buttonContainer";
		lz.cont.appendChild(grp);

		tmp = document.createElement("a");
		tmp.title = "More";
		tmp.id = "lz-more";
		tmp.className = "lz-button";
		tmp.addEventListener("click", function()
		{
			var d = document.getElementById("lz-desc");
			if (d.style.display === 'none')
				d.style.display = '';
			else
				d.style.display = 'none';
		}, false);
		grp.appendChild(tmp);

		tmp = document.createElement("a");
		tmp.title = "Print";
		tmp.id = "lz-print";
		tmp.className = "lz-button";
		tmp.addEventListener("click", lz.print, false);
		grp.appendChild(tmp);

		tmp = document.createElement("a");
		tmp.title = "Download";
		tmp.id = "lz-download";
		tmp.className = "lz-button";
		tmp.target = "_blank";
		grp.appendChild(tmp);

		tmp = document.createElement("a");
		tmp.title = "Share";
		tmp.id = "lz-like";
		tmp.className = "lz-button";
		tmp.addEventListener("click", lz.like, false);
		grp.appendChild(tmp);

		//Buttons
		if (p != 3) lz.pfx = false;
		else
		{
			tmp = document.createElement("div");
			tmp.title = "Fullscreen";
			tmp.id = "lz-fullScreen";
			tmp.className = "lz-button";
			tmp.addEventListener("click", function()
			{
				if (lz.isfull) document[lz.pfx[0]]();
				else lz.main[lz.pfx[1]]();
			}, false);
			grp.appendChild(tmp);
		}

		tmp = document.createElement("a");
		tmp.title = "Close";
		tmp.id = "lz-close";
		tmp.className = "lz-button";
		tmp.addEventListener("click", lz.end, false);
		grp.appendChild(tmp);

		lz.lbCont = document.createElement("div");
		lz.lbCont.id = "lz-labelContainer";
		lz.cont.appendChild(lz.lbCont);

		tmp = document.createElement("div");
		tmp.id = "lz-caption";
		tmp.className = "lz-float";
		lz.lbCont.appendChild(tmp);

		tmp = document.createElement("div");
		tmp.id = "lz-desc";
		tmp.className = "lz-float";
		tmp.style.display = 'none';
		lz.lbCont.appendChild(tmp);

		tmp = document.createElement("div");
		tmp.id = "lz-resolution";
		tmp.className = "lz-float";
		lz.lbCont.appendChild(tmp);

		tmp = document.createElement("a");
		tmp.title = "by";
		tmp.id = "lz-by";
		tmp.className = "lz-float";
		tmp.target = "_blank";
		lz.lbCont.appendChild(tmp);

		tmp = document.createElement("div");
		tmp.id = "lz-number";
		tmp.className = "lz-float";
		lz.lbCont.appendChild(tmp);
		//console.log('LightZAP time: '+(((new Date().getTime())-startTime)/1000)+' seconds.'); // DEBUG
	};
	this.updateLinks = function() { //Set or update links
		//var startTime = new Date().getTime(); //DEBUG
		var _ref = document.links, i = _ref.length;
		while (i--)
		{
			var a = _ref[i];
			if (a.getAttribute(this.options.attr) != null)
				a.addEventListener("click", lz.start, false);
		}
		//console.log('Update page time: '+(((new Date().getTime())-startTime)/1000)+' seconds.'); // DEBUG
	};
	this.start = function(event) {
		event.preventDefault();

		//Show overlay
		lz.showOthers(false);
		lz.sizeOverlay();
		//var startTime = new Date().getTime(); //DEBUG

		lz.main.style.display = '';
		window.addEventListener("resize", lz.sizeOverlay, false);

		//Get original margin
		if (lz.mrgW === -1)
		{
			lz.imgNotFound = lz.getStyle(lz.img, "").getPropertyValue("background-image").replace("url(", "").replace(")", "").replace('"', '').replace('"', '');
			lz.img.style.backgroundImage = "none";
			var tmp = lz.getStyle(lz.cont, "");
			lz.mrgH = parseInt(tmp.getPropertyValue("margin-top")) + parseInt(tmp.getPropertyValue("margin-bottom")) + parseInt(tmp.getPropertyValue("padding-top")) + parseInt(tmp.getPropertyValue("padding-bottom")) + parseInt(tmp.getPropertyValue("border-top-width")) + parseInt(tmp.getPropertyValue("border-bottom-width"));
			lz.mrgW = parseInt(tmp.getPropertyValue("margin-left")) + parseInt(tmp.getPropertyValue("margin-right")) + parseInt(tmp.getPropertyValue("padding-left")) + parseInt(tmp.getPropertyValue("padding-right")) + parseInt(tmp.getPropertyValue("border-left-width")) + parseInt(tmp.getPropertyValue("border-right-width"));		
		}

		//Create album
		var a, i, _len, _ref, imgNumber = 0, _attr = this.getAttribute(lz.options.attr);
	
		if (lz.albumN === _attr || _attr === "")
		{
			if (_attr === "")
			{
				lz.album = [];
				lz.readAlbum(this);
			}
			else
			{
				imgNumber = lz.album.length;
				while (imgNumber-- && lz.album[imgNumber].link != this.getAttribute("href"));
			}
		}
		else
		{
			lz.album = [];
			var _ref = document.links, _href = this.href, i = _ref.length, j = 0;
			while (i--)
			{
				var a = _ref[i];
				if (a.getAttribute(lz.options.attr) != null && a.getAttribute(lz.options.attr) === _attr)
				{
					lz.readAlbum(a);
					if (a.href === this.href) imgNumber = j;
					j++;
				}
			}
		}
		lz.albumN = _attr;
		//console.log('Start up time: '+(((new Date().getTime())-startTime)/1000)+' seconds.'); // DEBUG
		lz.changeImg(imgNumber);
	};
	this.showOthers = function(show) {
		var _ref, i, tagNames = ["select", "object", "embeds"], tagNum = 3;
		show = (show) ? "visible" : "hidden";
		while(tagNum--)
		{
			_ref = document.getElementsByTagName(tagNames[tagNum]);
			i = _ref.length;
			while (i--)
				_ref[i].style.visibility = show;
		}
	};
	this.sizeOverlay = function() {
		//var startTime = new Date().getTime(); //DEBUG
		var _winW, _winH;
		if(typeof(window.innerWidth) === 'number') //Non-IE
		{
			_winW = Math.min(window.innerWidth, document.body.clientWidth);
			_winH = window.innerHeight;
		}
		else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) //IE 6+ in 'standards compliant mode'
		{
			_winW = document.documentElement.clientWidth;
			_winH = document.documentElement.clientHeight;
		}
		else if (document.body && (document.body.clientWidth || document.body.clientHeight)) //IE 4 compatible
		{
			_winW = document.body.clientWidth;
			_winH = document.body.clientHeight;
		}

		//If chanced size
		if (lz.winW != _winW || lz.winH != _winH)
		{
			//Set size
			lz.winW = _winW;
			lz.winH = _winH;
			lz.main.style.width = _winW;
			lz.main.style.height = _winH;

			//Is fullscreen?
			lz.isfull = (lz.pfx != false) ? (typeof document[lz.pfx[2]] === "function" ? document[lz.pfx[2]]() : document[lz.pfx[2]]) : false;

			//Set style
			if (lz.isfull)
			{
				lz.main.className = "full-screen " + lz.hq;
				lz.main.style.width = "";
				lz.main.style.height = "";
				lz.cont.style.height = "100%";
				document.getElementById("lz-bg").addEventListener("click", null, false);
			}
			else
			{
				document.getElementById("lz-bg").addEventListener("click", lz.end, false);
				lz.main.className = lz.hq;
				lz.cont.style.width = "";
				lz.cont.style.height = "";
			}

			//Update image size
			if (lz.album.length > 0)
				lz.getImgSize();
		}
		//console.log('SizeOverlay time: '+(((new Date().getTime())-startTime)/1000)+' seconds.'); // DEBUG
	};
	this.readAlbum = function(lnk) {
		var _download = false, _like = false, _print = false, options = lnk.getAttribute("data-options");
		if (options != null && options.length > 3)
		{
			_download = options.indexOf("download") != -1;
			_like = options.indexOf("like") != -1;
			_print = options.indexOf("print") != -1;
		}
		lz.album.push({
			link: lnk.getAttribute("href"),
			title: lnk.getAttribute("title"),
			desc: lnk.getAttribute("data-desc"),
			by: lnk.getAttribute("data-by"),
			by_link: lnk.getAttribute("data-link"),
			download: _download,
			print: _print,
			like: _like
		});
	};
	this.changeImg = function(imgNum) {
		//var startTime = new Date().getTime(); //DEBUG
		if (imgNum < 0) imgNum = lz.album.length - 1;
		else if (imgNum > lz.album.length - 1) imgNum = 0;

		//Hide other
		document.addEventListener("keyup", lz.keyAction, false);
		lz.main.className =(lz.isfull?"full-screen ":"")+lz.hq+" lz-hide";
		
		if (lz.album[imgNum].link[lz.album[imgNum].link.length-4] == ".")
		{
			if (lz.img.tagName != "IMG")
			{
				lz.img.remove();
				lz.img = document.createElement("img");
				lz.img.id = "lz-image";
				lz.cont.className = "image";
				lz.cont.insertBefore(lz.img, document.getElementById("lz-loader"));
			}

			//New image
			var preloader = new Image;
			preloader.addEventListener("load", function ()
			{
				lz.img.src = lz.album[imgNum].link;
				lz.bg.style.backgroundImage="url('"+ lz.album[imgNum].link + "')";
				lz.orgW = preloader.width;
				lz.orgH = preloader.height;
				lz.imgID = imgNum;
				lz.getImgSize();
			}, false);
			preloader.addEventListener("error", function ()
			{
				lz.album[imgNum].title = lz.options.notfoundtext;
				lz.img.src = lz.imgNotFound;
				lz.bg.style.backgroundImage="none";
				lz.orgW = 256;
				lz.orgH = 256;
				lz.imgID = imgNum;
				lz.getImgSize();
			}, false);
			preloader.src = lz.album[imgNum].link;
		}
		else
		{
			if (lz.img.tagName != "IFRAME")
			{
				lz.img.remove();
				lz.img = document.createElement("iframe");
				lz.img.id = "lz-image";
				lz.cont.className = "embed";
				lz.cont.insertBefore(lz.img, document.getElementById("lz-loader"));
				lz.bg.style.backgroundImage="none";
			}
			lz.img.src =  lz.album[imgNum].link;
			lz.orgW = screen.width;
			lz.orgH = screen.height;
			lz.imgID = imgNum;
			lz.getImgSize();
		}
		//console.log('Change image time: '+(((new Date().getTime())-startTime)/1000)+' seconds.'); // DEBUG
	};
	this.getImgSize = function() {
		var startTime = new Date().getTime();
		//Sizes
		var placeWidth = lz.winW, placeHeight = lz.winH, imageWidth = lz.orgW, imageHeight = lz.orgH;
		var master = lz.cont.style, slave = lz.img.style;
		if (!lz.isfull)
		{
			placeWidth -= lz.mrgW;
			placeHeight -= lz.mrgH;
		}
		else
		{
			slave = master;
			master = lz.img.style;
			if (lz.pfx)
			{
				placeWidth = screen.width;
				placeHeight = screen.height;
			}
		}

		//Calculate optional size
		if (imageWidth > placeWidth)
		{
			imageHeight = (placeWidth * imageHeight) / imageWidth;
			imageWidth = placeWidth;
		}
		if (imageHeight > placeHeight)
		{
			imageWidth = (placeHeight * imageWidth) / imageHeight;
			imageHeight = placeHeight;
		}

		//Set box style
		slave.top = "0";
		slave.left = "0";
		slave.width = "";
		slave.height = "";
		master.top = (placeHeight - imageHeight) * 0.5 + "px";
		master.left = (placeWidth - imageWidth) * 0.5 + "px";
		master.width = imageWidth + "px";
		master.height = imageHeight + "px";
		//console.log('GetImage size time: ' + (((new Date().getTime())-startTime)/1000) + ' seconds.'); // DEBUG
		lz.showImg();

		if ((new Date().getTime()) - startTime > 20) 
			lz.hq = "";
	};
	this.showImg = function() {
		lz.updateNav();
		lz.updateDetails();
		//var startTime = new Date().getTime(); //DEBUG

		//Preload
		var preloadNext, preloadPrev;
		if (lz.album.length > lz.imgID + 1)
		{
			preloadNext = new Image;
			preloadNext.src = lz.album[lz.imgID + 1].link;
		}
		if (lz.imgID > 0)
		{
			preloadPrev = new Image;
			preloadPrev.src = lz.album[lz.imgID - 1].link;
		}
		setTimeout(function(){
			lz.main.className =(lz.isfull?"full-screen ":" ")+lz.hq+ " lz-show";
		},380);
		//console.log('ShowImage time: '+(((new Date().getTime())-startTime)/1000)+' seconds.'); // DEBUG
	};
	this.updateDetails = function() {
		//var startTime = new Date().getTime(); //DEBUG
		//Counter
		var element = document.getElementById("lz-number");
		if (lz.album.length > 1)
		{
			element.textContent = lz.options.imagetext + (lz.album.length - lz.imgID) + lz.options.oftext + lz.album.length;
			element.style.display = "";
		}
		else element.style.display = "none";

		//Caption
		element = document.getElementById("lz-caption");
		if (lz.album[lz.imgID].title != null && lz.album[lz.imgID].title != "")
		{
			element.textContent = lz.album[lz.imgID].title;
			element.style.display = "";
		}
		else element.style.display = "none";

		//Description
		element = document.getElementById("lz-more");
		if (lz.album[lz.imgID].desc != null && lz.album[lz.imgID].desc != "")
		{
			element.style.display = "";
			element = document.getElementById("lz-desc");
			element.innerHTML = lz.album[lz.imgID].desc;
			element.style.display = "none";
		}
		else
		{
			element.style.display = "none";
			document.getElementById("lz-desc").style.display = "none";
		}

		//Author
		element = document.getElementById("lz-by");
		if (lz.album[lz.imgID].by != null && lz.album[lz.imgID].by != "")
		{
			element.innerHTML = lz.options.bytext + " <span>" + lz.album[lz.imgID].by + "</span>";
			element.style.display = "";
			if (lz.album[lz.imgID].by_link != null && lz.album[lz.imgID].by_link != "")
				element.href = lz.album[lz.imgID].by_link;
		}
		else
		{
			element.innerHTML = "";
			element.style.display = "none";
			if (lz.album[lz.imgID].by_link != null && lz.album[lz.imgID].by_link != "")
				document.getElementById("lz-caption").innerHTML = "<a href='" + lz.album[lz.imgID].by_link + "' target='_new'> " + document.getElementById("lz-caption").innerHTML + '</a>';
		}
		element = document.getElementById("lz-download");
		element.href = "lz.php?p=" + lz.img.src;

		//Others
		document.getElementById("lz-print").style.display = (lz.album[lz.imgID].print != lz.options.print && lz.img.src != lz.imgNotFound) ? "" : "none";
		document.getElementById("lz-like").style.display = (lz.img.tagName=="IMG" && lz.album[lz.imgID].like != lz.options.like && lz.img.src != lz.imgNotFound) ? "" : "none";
		document.getElementById("lz-download").style.display = (lz.img.tagName=="IMG" && lz.album[lz.imgID].download != lz.options.download && lz.img.src != lz.imgNotFound) ? "" : "none";
		document.getElementById("lz-resolution").textContent = lz.orgW + " x " + lz.orgH;
		//console.log('UpdateDetails time: '+(((new Date().getTime())-startTime)/1000)+' seconds.'); // DEBUG
	};
	this.updateNav = function() {
		//var startTime = new Date().getTime(); //DEBUG
		document.getElementById("lz-prev").style.display = "none";
		document.getElementById("lz-next").style.display = "none";
		if (lz.album.length == 1) return;
		if (lz.imgID > 0 || lz.options.circling ) document.getElementById("lz-next").style.display = "";
		if (lz.imgID < lz.album.length - 1 || lz.options.circling) document.getElementById("lz-prev").style.display = "";
		//console.log('UpdateNav time: '+(((new Date().getTime())-startTime)/1000)+' seconds.'); // DEBUG
	};
	this.keyAction = function(e) {
		if (e.keyCode === 27 || e.keyCode === 88) lz.end();
		else if (e.keyCode === 78 || e.keyCode === 39)
		{
			if (lz.imgID != 0 || lz.options.circling) lz.changeImg(lz.imgID - 1);
		}
		else if ((e.keyCode === 80 || e.keyCode === 37))
		{
			if (lz.imgID != lz.album.length - 1 || lz.options.circling) lz.changeImg(lz.imgID + 1);
		}
	};

	this.print = function() {
		win = window.open();
		self.focus();
		win.document.open();
		win.document.write("<html><body stlye='margin:0 auto;padding:0;'><h1 style='margin:0 0 0.48em;'>" + document.getElementById("lz-caption").textContent + "</h1><div style='text-align:center;'><" + lz.img.tagName + " src='" + lz.img.src + "' " + ( lz.img.tagName == "IMG" ? "style='max-height:23.2cm;max-width:100%;'/>" : ("width='" + lz.winW * 0.95 + "' height='" + lz.winW * 1.17 + "' frameborder='0'></iframe>")) + "</div><div style='text-align:right;'><i>" + document.getElementById("lz-by").textContent + "</i></div></body></html>");
		win.document.close();
		win.print();
		win.close();
	};
	this.like = function() {
		if (!window.focus) return true;
			window.open("http://www.facebook.com/sharer/sharer.php?u=" + lz.img.src, "", 'width=400,height=200,scrollbars=yes');
	};
	this.end = function() {
		if (lz.isfull && lz.pfx != false) document[lz.pfx[0]]();
		document.addEventListener("keyup", null, false);
		window.addEventListener("resize", null, false);
		lz.main.style.display = 'none';
		lz.showOthers(true);
	};
};
window.addEventListener("load", lz.init, false);
