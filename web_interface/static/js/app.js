(function () {

	var dataLayer = new DataLayer(),
		utils = new Utils();

	var text_tpl = _.template($("#text-template").html()),
		lang_tpl = _.template($("#lang-template").html()),
		src, trg;

	dataLayer.restGet("/static/mocks/task1.json")
		.then(function (data) {
			var lastClickedElement = null,
				lastHoveredElement = null,
				wrapperClickedClass = "",
				wrapperHoveredClass = "";
				
			src = utils.getTextSegments(data.source_segments),
			trg = utils.getTextSegments(data.target_segments);

			// Filling the lanugage template
			$("#source-lang").html(lang_tpl({ language: data.source_language }));
			$("#target-lang").html(lang_tpl({ language: data.target_language }));


			// Filling the text template
			$("#source-text .text-container").html(text_tpl({ segments: src }));
			$("#target-text .text-container").html(text_tpl({ segments: trg }));

			utils.removeHTMLWhiteSpace($("#source-text .text-container"));
			utils.removeHTMLWhiteSpace($("#target-text .text-container"));

			$(".text-wrapper", "#target-text").on('click', function () {
				if (lastClickedElement && lastClickedElement != this) 
				{
					$("." + wrapperClickedClass).removeClass("clicked");
				}
				
				lastClickedElement = this;
				wrapperClickedClass = $(this).attr('class').replace(" ", ".");
				
				$("." + wrapperHoveredClass).eq(0).removeClass("hovered");
				$("." + wrapperClickedClass).addClass("clicked");
			})
			.hover(function () {
				if (lastHoveredElement && lastHoveredElement != this) 
				{
					$("." + wrapperHoveredClass).eq(0).removeClass("hovered");
				}
				
				lastHoveredElement = this;
				wrapperHoveredClass = $(this).attr('class').replace(" ", ".");
				
				if (!$("." + wrapperHoveredClass).eq(0).hasClass("clicked"))
				{
					$("." + wrapperHoveredClass).eq(0).addClass("hovered");
				}
			})
			.mouseleave(function () {
				if (wrapperHoveredClass)
				{
					$("." + wrapperHoveredClass).removeClass("hovered");
					$("." + wrapperClickedClass).eq(1).removeClass("clicked");
				}
			});


			/*$("#container").on('click', function () {
				if (wrapperClickedClass)
				{
					$("." + wrapperClickedClass).removeClass("clicked");
				}
			});*/

			return data;

		})
		.then(function (getData) {
			dataLayer.restPost("https://jobcheck.unbabel.com/analyze_job_segments", true, {
				src_segments: _.map(src, function (obj) {
					return obj.segment
				}),
				trg_segments: _.map(trg, function (obj) {
					return obj.segment
				}),
				src_lang: getData.source_language.shortname,
				trg_lang: getData.target_language.shortname,
				fast_analysis: true
			})
			.then(function (data) {
				console.log("POST obtained results");
				console.log(data);
			})
			.fail(function () {
				throw new Error("Error on SmartCheck first POST");
			})
		})
		.fail(function () {
			throw new Error("Error on annotations GET");
		}); 

})()