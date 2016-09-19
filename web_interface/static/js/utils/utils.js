/* global _, DataLayer, CONFIGS */

function Utils() {
	
	var dataLayer = new DataLayer();

	// Get configurations file
	this.getConfig = function (location) {
		return dataLayer.restGet(location);
	};

	
	// Get task data
	this.getData = function () {
		return dataLayer.restGet(CONFIGS["mock-data-endpoint"]);
	};


	// Get HTML template from html files
	this.getHTMLTemplate = function (id) {
		return dataLayer.localGet("/static/html/" + id + ".html");
	};


	// Create nuggets array based on server information
	// TODO: models could/should be created for the 'nugget' and 'segment' entities
	this.getNuggets = function (data) {
		var nuggets = [];

		_.each(data, function (el) {

			var i = 0,
				markupTemp = el.annotations.markup,
				textProperty = !!el.template ? "template" : "text",
				complexSeg = {};

			complexSeg.isTarget = !!el.template;
			complexSeg.id = el.id;
			complexSeg.text = el.template || el.text;
			complexSeg.glossary = el.annotations.glossary;
			complexSeg.segments = [];

			while (i < markupTemp.length) {
				var segment = {};
				segment.id = el.id + '-' + i;
				segment.text = el[textProperty].slice(markupTemp[i++].position, markupTemp[i++].position);
				complexSeg.segments.push(segment);
			}

			nuggets.push(complexSeg);

		});

		return nuggets;
	};


	// Get text segments
	this.getTextSegments = function (nuggets) {
		var segments = [];

		_.each(nuggets, function (nug) {
			_.each(nug.segments, function (seg) {
				segments.push(seg.text);
			});
		});

		return segments;
	};


	// Remove unnecessary whitespace between html elements
	this.removeHTMLWhiteSpace = function (element) {
		element.html(element.html().replace(/>\s+</g, "><").trim());
	};


	// Set the correct markup for the glossary items - uneditable content
	// TODO: put this on templateView (?)
	this.setGlossaryTerms = function (element, nuggets) {
		_.each(nuggets, function (seg) {
			_.each(seg.glossary, function (glossary) {
				var content = element.html(),
					term = seg.text.slice(glossary.start, glossary.start + glossary.length);

				element.html(content.replace(term, "<span class='glossary-term-wrapper' contenteditable='false'>" + term + "</span>"));
			});
		});
	};


	// Get initial text annotations by sendind a POST request
	this.smartCheckData = function (data) {
		return dataLayer.restPost(CONFIGS['smartCheck-endpoint'], true, {
			src_segments: data.simpleSource || this.getTextSegments(data.source),
			trg_segments: data.simpleTarget || this.getTextSegments(data.target),
			src_lang: data.src_lang,
			trg_lang: data.trg_lang,
			fast_analysis: true
		});
	};

	
	// Function delayer
	this.delayInput = (function () {
		var timer = 0;
		return function (callback, ms) {
			clearTimeout(timer);
			timer = setTimeout(callback, ms);
		};
	})();

}