function Utils() {
	
	this.getTextSegments = function (data) {

		var segments = [];

		_.each(data, function (el) {

			var i = 0,
				markupTemp = el.annotations.markup
				textProperty = !!el.template ? "template" : "text";

			while (i < markupTemp.length) {
				complexSeg = {};
				complexSeg.text = el.template || el.text;
				complexSeg.glossary = el.annotations.glossary;
				complexSeg.id = el.id + '-' + i;
				complexSeg.segment = el[textProperty].slice(markupTemp[i++].position, markupTemp[i++].position);
				segments.push(complexSeg);
			}

		});

		return segments;

	};

	this.removeHTMLWhiteSpace = function (element) {

		element.html(element.html().replace(/>\s+</g, "><").trim());

	};

}