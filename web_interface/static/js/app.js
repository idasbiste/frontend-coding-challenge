(function () {

	dataLayer = new DataLayer();

	var text_tpl = _.template($("#text-template").html()),
		lang_tpl = _.template($("#lang-template").html());

	dataLayer.restGet("/api/v1/task")
		.then(function (data) {
			var lastClickedElement = null,
				lastHoveredElement = null,
				wrapperClickedClass = "",
				wrapperHoveredClass = "";

			// Filling the lanugage template
			$("#source-lang").html(lang_tpl({ language: data.source_language }));
			$("#target-lang").html(lang_tpl({ language: data.target_language }));

			// Filling the text template
			$("#source-text .text-container").html(text_tpl({ segments: data.source_segments }));
			$("#target-text .text-container").html(text_tpl({ segments: data.target_segments }));

			$(".text-wrapper", "#target-text").on('click', function () {
				if (lastClickedElement && lastClickedElement != this) {
					$("." + wrapperClass).eq(0).removeClass("clicked");
				}
				
				lastClickedElement = this;

				wrapperClass = $(this).attr('class').replace(" ", ".");
				$("." + wrapperHoveredClass).eq(0).removeClass("hovered");
				$("." + wrapperClass).addClass("clicked");
			});

			$(".text-wrapper", "#target-text").hover(function () {
				if (lastHoveredElement && lastHoveredElement != this) {
					$("." + wrapperHoveredClass).eq(0).removeClass("hovered");
				}
				
				lastHoveredElement = this;

				wrapperHoveredClass = $(this).attr('class').replace(" ", ".");
				if (!$("." + wrapperHoveredClass).eq(0).hasClass("clicked"))
				{
					$("." + wrapperHoveredClass).eq(0).addClass("hovered");
				}
			});
		})
		.fail(function () {
			console.log("ERRO");
		}); 

})()