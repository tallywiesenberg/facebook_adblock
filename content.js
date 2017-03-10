(function() {
    "use strict";
    function hide_if_sponsored(e) {
        // if e contains ._m8c or .uiStreamSponsoredLink, then hide
        ["_m8c", "uiStreamSponsoredLink"].forEach(function(className) {
            if (e.getElementsByClassName(className).length !== 0) {
                e.style.display = "none";
                console.info("AD Blocked", e);
            }
        });
    }

    function remove_sponsored_posts(c) {
        // new version has ".fbUserContent" instead of .userContentWrapper
        ["fbUserContent", "userContentWrapper"].forEach(function(className) {
            Array.prototype.forEach.call(c.getElementsByClassName(className), hide_if_sponsored);
        });
    }

    function onPageChange() {
        var contentArea = document.getElementById("contentArea");
        // if the user change page to homepage
        if (contentArea !== null) {
            remove_sponsored_posts(contentArea);
            stream_observer.observe(contentArea, {childList: true, subtree: true});
        } else {
            // removing old observers
            stream_observer.disconnect();
        }
    }

    var fb_content = document.getElementsByClassName("fb_content")[0],
        stream_observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target.dataset.hasOwnProperty("cursor")) {
                    remove_sponsored_posts(mutation.target);
                }
            });
        }),
        fb_observer = new MutationObserver(onPageChange);

    // if we can't find ".fb_content", then it must be a mobile website.
    // in that case, we don't need javascript to block ads
    if (fb_content !== undefined) {
        // remove on first load
        onPageChange();

        // Facebook uses ajax to load new content so
        // we need this to watch for page change
        fb_observer.observe(fb_content, {childList: true});
    }

    // cleanup
    window.addEventListener("beforeunload", function() {
        fb_observer.disconnect();
        stream_observer.disconnect();
        fb_content = null;
    });
}());
