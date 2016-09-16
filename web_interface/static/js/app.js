(function () {

	var utils = new Utils();

	var text_tpl = _.template($("#text-template").html()),
		lang_tpl = _.template($("#lang-template").html()),
		src, trg;

	utils.getData()
		.then(function (data) {
			var lastClickedElement = null,
				lastHoveredElement = null,
				wrapperClickedClass = "",
				wrapperHoveredClass = "";
				
			src = utils.getNuggets(data.source_segments),
			trg = utils.getNuggets(data.target_segments);

			if (src.length != trg.length) 
			{
				throw new Error("Different number of source and target segments");
			}

			// Filling the lanugage template
			$("#source-lang").html(lang_tpl({ language: data.source_language }));
			$("#target-lang").html(lang_tpl({ language: data.target_language }));


			// Filling the text template
			$("#source-text .text-container").html(text_tpl({ nuggets: src }));
			$("#target-text .text-container").html(text_tpl({ nuggets: trg }));

			utils.removeHTMLWhiteSpace($("#source-text .text-container"));
			utils.removeHTMLWhiteSpace($("#target-text .text-container"));
			utils.setGlossaryTerms($("#target-text .text-container"), trg);

			$(".text-wrapper", "#target-text").on('click', function (e) {
				if (lastClickedElement && lastClickedElement != this) 
				{
					wrapperClickedClass = wrapperClickedClass.replace(" ", ".");
					$("." + wrapperClickedClass).removeClass("clicked");
				}
				
				lastClickedElement = this;
				wrapperClickedClass = $(this).attr('class').replace(" ", ".");
				
				$("." + wrapperHoveredClass).eq(0).removeClass("hovered");
				$("." + wrapperClickedClass).addClass("clicked");

				e.stopPropagation();
			})
			.hover(function (e) {
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

				e.stopPropagation();
			})
			.mouseleave(function (e) {
				if (wrapperHoveredClass)
				{
					$("." + wrapperHoveredClass).removeClass("hovered");
					if (wrapperClickedClass) 
					{
						wrapperClickedClass = wrapperClickedClass.replace(" ", ".");
						$("." + wrapperClickedClass).eq(1).removeClass("clicked");
					}
				}

				e.stopPropagation();
			});

			$("p.text-wrapper").on('keypress', function () {
				var self = this,
					innerHTML = $(this).html();
				utils.delayInput(
					function () {

						var segment = $(self).html(),
							glossaries = _.map($(".glossary-term-wrapper", self), function (el) { return $(el).html(); });

						_.each(glossaries, function (glossary) {
							var innerText = segment.match(/<span.*>(.*?)<\/span>/g)[0];
							segment = segment.replace(innerText, glossary);
						});

						utils.smartCheckData({
							src_lang: data.source_language.shortname,
							trg_lang: data.target_language.shortname,
							simpleSource: [$("." + $(self).attr('class').replace(/\s/g, ".")).eq(0).html()],
							simpleTarget: [segment]
						})
						.then(function (data) {

							_.each(data.qa_description, function (issues) {
								if (!!issues.spelling) {
									_.each(issues.spelling, function (spellingIssues) {

										$(self).html(innerHTML.replace(spellingIssues.errors, "<span class='word-error-wrapper'>" + spellingIssues.errors + "</span>"))
										var issuesTpl = _.template($("#error-popup-template").html());


									})
								}

								// Continue if statements for more unknown types
							});
						})
						.fail();
					}, 
					1500
				);
			});

			$("#container").on('click', function () {
				if (wrapperClickedClass)
				{
					$("." + wrapperClickedClass).removeClass("clicked");
				}
			});

			return data;

		})
		.then(function (getData) {
			utils.smartCheckData({
				src_lang: getData.source_language.shortname,
				trg_lang: getData.target_language.shortname,
				source: src,
				target: trg
			})
			.then(function (data) {
				console.log("POST obtained results");
				console.log(data);
			})
			.fail(function () {
				throw new Error("Error on SmartCheck first POST");
			});
		})
		.fail(function () {
			throw new Error("Error on annotations GET");
		}); 

})()