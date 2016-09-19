/* global $, _, utils */

function LoaderView() {
    
    var view = this;
    
    this.el = "#loader-img";
    
    this.start = function () {
        utils.getHTMLTemplate("loader-tpl")
        .then(function (template) {
            view.template = _.template(template);
            $('body').prepend(view.template);  
        });
    };
    
    this.stop = function () {
        $(this.el).remove();
    };
}