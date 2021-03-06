/* global utils, $, _, CONFIGS */

function TemplateView(serverData) {
	
	var view = this;

	this.lastClickedElement = null;
	this.lastHoveredElement = null;
	this.wrapperClickedClass = null;
	this.wrapperHoveredClass = null;
	this.spellingErrors = [];
	this.word = null;


	this.build = function () {
		this.src = utils.getNuggets(serverData.source_segments),
		this.trg = utils.getNuggets(serverData.target_segments);

		var text_tpl = "text-tpl",
			lang_tpl = "lang-tpl";

		if (this.src.length != this.trg.length) 
		{
			throw new Error("Different number of source and target segments");
		}

		$.when.apply(
			$, 
			[this.fillTemplate(lang_tpl, $("#source-lang"), { language: serverData.source_language, category: 'Original' }),
			this.fillTemplate(lang_tpl, $("#target-lang"), { language: serverData.target_language, category: 'Translation' }),
			this.fillTemplate(text_tpl, $("#source-text .text-container"), { nuggets: this.src }),
			this.fillTemplate(
				text_tpl, 
				$("#target-text .text-container"), 
				{ 
					nuggets: this.trg 
				},
				{
					fn: utils.setGlossaryTerms,
					args: [this.trg]
				}
			)]
		)
		.done(function () {
			view.setEvents();
		})
		.fail();
		
		return {
			src: this.src,
			trg: this.trg,
			src_lang: serverData.source_language,
			trg_lang: serverData.target_language
		};
	};

	
	this.fillTemplate = function (id, target, data, obj) {
		return utils.getHTMLTemplate(id)
		.then(function (template) {
			var tpl = _.template(template);
			$(target).html(tpl(data));
			
			utils.removeHTMLWhiteSpace(target);
			if (obj)
			{
				var args = [target, _.flatten(obj.args)];
				obj.fn.apply(this, args);
			}
		})
		.fail(function () {
			throw new Error("Unable to load static HTML template.");
		});
	};

	
	this.setEvents = function () {
		this.setOnClickEvents();
		this.setOnHoverEvents();
		this.setMouseLeaveEvents();
		this.setOnKeyUpEvents();
	};

	
	this.setOnClickEvents = function () {
		$(".text-wrapper", "#target-text").on('click', function (e) {
			if (view.lastClickedElement && view.lastClickedElement != this) 
			{
				view.wrapperClickedClass = view.wrapperClickedClass.replace(" ", ".");
				$("." + view.wrapperClickedClass).removeClass("clicked");
			}
			
			view.lastClickedElement = this;
			view.wrapperClickedClass = $(this).attr('class').replace(" ", ".");
			
			$("." + view.wrapperHoveredClass).eq(0).removeClass("hovered");
			$("." + view.wrapperClickedClass).addClass("clicked");

			view.cleanPopup();
			e.stopPropagation();
		});

		$(".text-wrapper").on('click', ".word-error-wrapper", function (e) {
			view.word = this;
			view.setUpErrorPopup(e, _.find(view.spellingErrors, { error: $(this).html() }));
			e.stopPropagation();
		});

		$("#popup-wrapper").on('click', "li", function () {
			if ($(this).text() !== 'Ignore')
			{
				$(view.word).html($(this).html());
			}
			$(view.word).replaceWith($(view.word).text());
			
			$("." + view.wrapperClickedClass).removeClass("clicked");
			view.cleanPopup();
		});

		$("#container").on('click', function () {
			if (view.wrapperClickedClass)
			{
				$("." + view.wrapperClickedClass).removeClass("clicked");
			}
			
			view.cleanPopup();
		});
		
		$("body").on('click', function () {
			view.cleanPopup();
		});
	};

	
	this.setOnHoverEvents = function () {
		$(".text-wrapper", "#target-text").hover(function (e) {
			if (view.lastHoveredElement && view.lastHoveredElement != this) 
			{
				$("." + view.wrapperHoveredClass).eq(0).removeClass("hovered");
			}
			
			view.lastHoveredElement = this;
			view.wrapperHoveredClass = $(this).attr('class').replace(/\s/g, ".");
			
			if (!$("." + view.wrapperHoveredClass).eq(0).hasClass("clicked"))
			{
				$("." + view.wrapperHoveredClass).eq(0).addClass("hovered");
			}

			e.stopPropagation();
		});
	};

	
	this.setMouseLeaveEvents = function () {
		$(".text-wrapper", "#target-text").mouseleave(function (e) {
			if (view.wrapperHoveredClass)
			{
				$("." + view.wrapperHoveredClass).removeClass("hovered");
				if (view.wrapperClickedClass) 
				{
					view.wrapperClickedClass = view.wrapperClickedClass.replace(/\s/g, ".");
					$("." + view.wrapperClickedClass).eq(1).removeClass("clicked");
				}
			}

			e.stopPropagation();
		});
	};

	
	this.setOnKeyUpEvents = function () {
		$("p.text-wrapper").on('keyup', function () {
			utils.delayInput(
				(function () {
					view.smartCheckRequest(this);
				}).bind(this), CONFIGS["keyup-delay"]);
		});
	};


	this.smartCheckRequest = function (element) {
		// Remove every error
		$(element).find(".word-error-wrapper").each(function () {
			$(this).replaceWith($(this).text());
		});

		utils.smartCheckData({
			src_lang: serverData.source_language.shortname,
			trg_lang: serverData.target_language.shortname,
			simpleSource: [$("." + $(element).attr('class').replace(/\s/g, ".")).eq(0).html()],
			simpleTarget: [$(element).text()]
		})
		.then(function (data) {
			view.showErrorUnderline(element, data);
		})
		.fail();
	};

	
	this.showErrorUnderline = function (element, annotations) {
		var issues = annotations.qa_description;

		if (issues.sentence_issues['spelling']) 
		{
			_.each(issues.sentence_issues['spelling'], function (spellingIssues) {
				var innerHTML = $(element).html();
				$(element).html(innerHTML.replace(spellingIssues.errors, "<span class='word-error-wrapper'>" + spellingIssues.errors + "</span>"));
				view.spellingErrors.push({
					category: {
						name: "Spelling",
						description: spellingIssues.description
					},
					error: spellingIssues.errors,
					suggestions: spellingIssues.suggestions
				});
			});
		}
		
		// TODO: Continue if statements for more unknown types
	};


	this.setUpErrorPopup = function (e, data) {
		this.fillTemplate("popup-tpl", $("#popup-wrapper"), data);
		$("#popup-wrapper").css("left", (e.clientX - $("#popup-wrapper").width() / 2) + "px");
		$("#popup-wrapper").css("top", (e.clientY + 25) + "px"); // the offset should be based on the element's line-height
	};


	this.cleanPopup = function () {
		if ($("#popup-wrapper").html() != "") 
		{
			$("#popup-wrapper").empty();
		}
	};
}

/* 
	TemplateView can extend a BaseView, for example 
	fillTemplate would be a BaseView function
*/