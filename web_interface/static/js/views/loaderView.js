/* global $, _ */

function LoaderView() {
    
    this.el = "#loader-img";
    
    this.template = _.template($("#loader-template").html());
    
    this.start = function () {
        $('body').prepend(this.template);
    };
    
    this.stop = function () {
        $(this.el).remove();
    };
}