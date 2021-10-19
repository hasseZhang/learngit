(function(factory) {
    !window.us_cue && (window.us_cue = factory());
})(function() {
    var $cue = null;
    var imgTxt = "";
    var textTxt = "";
    var timer = null;
    function initDom() {
        if (!$cue) {
            $cue = $('<div id="us_cue">' + imgTxt + textTxt + "</div>");
            $cue.appendTo("body");
        }
    }
    function removeDom() {
        if ($cue) {
            $cue.remove();
            $cue = null;
        }
    }
    return {
        show: function(opt) {
            removeDom();
            clearTimeout(timer);
            if (opt.type == 1) {
                imgTxt = '<img src="/pub/galaxy/plugin/cues/images/right.png">';
            } else if (opt.type == 2) {
                imgTxt = '<img src="/pub/galaxy/plugin/cues/images/error.png">';
            } else {
                imgTxt = "";
            }
            textTxt = opt.text;
            initDom();
            timer = setTimeout(function() {
                removeDom();
            }, 3e3);
        }
    };
});