/**
 * DimBox - Lightweight and dependency free JavaScript library for displaying images, videos and other content on a web page.
 * https://github.com/hphaavikko/dimbox
 * 
 * @version 1.0.0
 * @author  Hape Haavikko <hape.haavikko@fakiirimedia.com>
 * @licence ISC
 */
const dimbox = (function() {
    
    'use strict';

    let config = {
        ajaxTemplate: `
            <div class="dimbox-ajax-container">
                <div class="dimbox-ajax-content">{{content}}</div>
                <div class="dimbox-caption">{{caption}}</div>
            </div>
        `,
        closeOnOverlayClick: true,
        imageTemplate: `
        <figure class="dimbox-figure">
            <img src="{{src}}" class="dimbox-image" alt="{{alt}}" />
            <figcaption class="dimbox-caption">{{caption}}</figcaption>
        </figure>`,
        iframeRatio: '16x9',
        iframeTemplate: `
        <div class="dimbox-iframe-container">
            <iframe src="{{src}}" class="dimbox-iframe"></iframe>
            <div class="dimbox-caption">{{caption}}</div>
        </div>
        `,
        inlineTemplate: `
        <div class="dimbox-inline-container">
            <div class="dimbox-inline-content">{{content}}</div>
            <div class="dimbox-caption">{{caption}}</div>
        </div>
        `,
        onAfterClose: null,
        onAfterInit: null,
        onAfterOpen: null,
        onAfterUpdateContent: null,
        onBeforeClose: null,
        onBeforeInit: null,
        onBeforeOpen: null,
        onBeforeUpdateContent: null,
        onContentLoaded: null,
        onDownload: null,
        onXhrComplete: null,
        selector: 'a[data-dimbox]',
        sequenceTemplate: '<span class="dimbox-sequence-current">{{current}}</span> / <span class="dimbox-sequence-total">{{total}}</span>',
        showDownloadButton: true,
        svgCloseButton: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>',
        svgDownloadButton: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>',
        svgPrevNextButton: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>',
        theme: 'dark',
        videoAutoplay: true,
        videoControls: true,
        videoLoop: false,
        videoTemplate: `
        <div class="dimbox-video-container">
            <video src="{{src}}" class="dimbox-video"></video>
            <div class="dimbox-caption">{{caption}}</div>
        </div>
        `,
        videoVolume: null,
        xhrResponseType: 'json'
    };

    /**
     * Valid values for attribute data-dimbox-type.
     * @type {Array.<string>}
     */
    let types = ['image', 'video', 'iframe', 'inline', 'ajax'];

    let dimboxElements;
    let dimboxContainer;
    let dimboxContent;
    let loader;
    let closeBtn;
    let downloadBtn;
    let thisGalleryLinks;
    let currentEl;
    let currentType;
    let touchStartX;
    let touchStartY;
    let touchEndX;
    let touchEndY;
    let xhr;

    /**
     * 
     */
    function init() {
        executeCallback('onBeforeInit');

        dimboxElements = document.querySelectorAll(config.selector);

        // Add click event listeners for all dimbox links
        for (let i = 0; i < dimboxElements.length; i++) {
            dimboxElements[i].addEventListener('click', onLinkClick);
        }
    
        executeCallback('onAfterInit');
    }

    /**
     * @param   {MouseEvent}    e 
     */
    function onLinkClick(e) {
        e.preventDefault();
        open(this);
    }

    /**
     * Opens the box.
     * @param   {HTMLElement}    el 
     */
    function open(el) {
        thisGalleryLinks = null;
        currentEl = null;
        currentType = null;
        touchStartX = 0;
        touchEndX = 0;

        executeCallback('onBeforeOpen');

        currentEl = el;
        currentType = getCurrentType(currentEl);

        dimboxContainer = document.createElement('div');
        dimboxContent = document.createElement('div');
        loader = document.createElement('div');
        closeBtn = document.createElement('button');

        dimboxContainer.className = 'dimbox-container';

        if (config.theme === 'light') {
            dimboxContainer.classList.add('dimbox-light');
        }

        if (config.closeOnOverlayClick) {
            dimboxContainer.classList.add('close-on-overlay-click');
        }

        loader.className = 'dimbox-loader';
        dimboxContent.className = 'dimbox-content';
        
        closeBtn.className = 'dimbox-btn-close';
        closeBtn.innerHTML = config.svgCloseButton;

        updateContent();

        // Set up gallery stuff
        if (currentEl.dataset.dimbox !== '') {
            // Check if there are any other items in the same gallery
            let galleryLinks = document.querySelectorAll('[data-dimbox="' + currentEl.dataset.dimbox + '"]');
            // Set up prev/next buttons and sequence element if more than one item
            if (galleryLinks.length > 1) {
                createPrevNextButtons(currentEl.dataset.dimbox);
                createSequence();
                window.addEventListener('keydown', onKeyPress);
                window.addEventListener('touchstart', onTouchStart);
                window.addEventListener('touchend', onTouchEnd);
                dimboxContainer.classList.add('dimbox-gallery');
            }
        }

        dimboxContainer.appendChild(loader);
        dimboxContainer.appendChild(closeBtn);
        dimboxContainer.appendChild(dimboxContent);
        
        closeBtn.addEventListener('click', close);
        dimboxContainer.addEventListener('click', onOverlayClick);
        document.body.appendChild(dimboxContainer);

        setTimeout(function() {
            dimboxContainer.classList.add('show');
            // Check if there is a vertical scrollbar and prevent page scrolling under DimBox if needed
            if (document.documentElement.scrollHeight > document.documentElement.clientHeight) {
                let scrollW = window.innerWidth - document.body.clientWidth;
                // Get documentElement current padding right
                let docElPaddingR = window.getComputedStyle(document.documentElement, null).getPropertyValue('padding-right');
                // Prevent page scrolling
                document.documentElement.classList.add('dimbox-noscroll');
                // Add scrollbar width to documentElement current padding
                document.documentElement.style.paddingRight = parseInt(docElPaddingR) + scrollW + 'px';
            }
            executeCallback('onAfterOpen');
        }, 50);
    }

    /**
     * 
     */
    function updateContent() {
        executeCallback('onBeforeUpdateContent');
        if (currentType == 'image') {
            updateImageContent();
        } else if (currentType == 'video') {
            updateVideoContent();
        } else if (currentType == 'iframe') {
            updateIframeContent();
        } else if (currentType == 'inline') {
            updateInlineContent();
        } else if (currentType == 'ajax') {
            updateAjaxContent();
        }
        updateSequence();
        updateDownloadButton();
        executeCallback('onAfterUpdateContent');
    }

    /**
     * 
     */
    function updateImageContent() {
        let contentHtml = config.imageTemplate;
        contentHtml = contentHtml.replace('{{src}}', currentEl.href);
        // Get alt text from link image if defined
        if (currentEl.querySelector('img')) {
            let imgAlt = currentEl.querySelector('img').alt;
            if (imgAlt) {
                contentHtml = contentHtml.replace('{{alt}}', imgAlt);
            } else {
                contentHtml = contentHtml.replace('{{alt}}', "");
            }
        } else {
            // Not an image link, strip alt placeholder
            contentHtml = contentHtml.replace('{{alt}}', "");
        }
        contentHtml = insertCaption(contentHtml);
        dimboxContent.innerHTML = contentHtml;
        dimboxContent.querySelector('img').addEventListener('load', onContentLoaded);
    }

    /**
     * 
     */
    function updateVideoContent() {
        let contentHtml = config.videoTemplate;
        contentHtml = contentHtml.replace('{{src}}', currentEl.href);
        contentHtml = insertCaption(contentHtml);
        dimboxContent.innerHTML = contentHtml;
        let videoEl = dimboxContent.querySelector('video');
        videoEl.addEventListener('canplay', onContentLoaded);
        if (config.videoControls) {
            videoEl.setAttribute('controls', '');
        }
        if (config.videoVolume !== null) {
            videoEl.volume = config.videoVolume;
        }
        if (config.videoAutoplay) {
            videoEl.setAttribute('autoplay', '');
        }
        if (config.videoLoop) {
            videoEl.setAttribute('loop', '');
        }
        videoEl.setAttribute('playsinline', '');
    }

    /**
     * 
     */
    function updateIframeContent() {
        let contentHtml = config.iframeTemplate;
        contentHtml = contentHtml.replace('{{src}}', currentEl.href);
        contentHtml = insertCaption(contentHtml);
        dimboxContent.innerHTML = contentHtml;
        let ratio = config.iframeRatio;
        if (currentEl.dataset.dimboxRatio) {
            ratio = currentEl.dataset.dimboxRatio;
        }
        dimboxContent.querySelector('iframe').classList.add('ratio-' + ratio);
        dimboxContent.querySelector('iframe').addEventListener('load', onContentLoaded);
    }

    /**
     * 
     */
    function updateInlineContent() {
        let contentHtml = config.inlineTemplate;
        contentHtml = contentHtml.replace('{{content}}', document.querySelector(currentEl.getAttribute('href')).innerHTML);
        contentHtml = insertCaption(contentHtml);
        dimboxContent.innerHTML = contentHtml;
        dimboxContainer.classList.add('dimbox-loaded');
    }

    /**
     * 
     */
    function updateAjaxContent() {
        xhr = new XMLHttpRequest();
        xhr.responseType = config.xhrResponseType;
        xhr.addEventListener('load', xhrComplete);
        xhr.addEventListener('error', xhrError);
        xhr.addEventListener('abort', xhrAbort);
        xhr.open('GET', currentEl.getAttribute('href'));
        xhr.send();
    }

    /**
     * 
     */
    function updateDownloadButton() {
        if (! config.showDownloadButton) {
            return;
        }
        // Check if download button exists in DOM already
        if (dimboxContainer.querySelector('.dimbox-btn-download')) {
            // Update href right away
            downloadBtn.href = currentEl.href;
            // Current type is not image or video...
            if (currentType !== 'image' && currentType !== 'video') {
                // ...so remove download button from the DOM
                dimboxContainer.removeChild(downloadBtn);
                downloadBtn = null;
            }
        } else if (currentType === 'image' || currentType === 'video') {
            // Download button does not exits yet, create it
            downloadBtn = document.createElement('a');
            downloadBtn.className = 'dimbox-btn-download';
            downloadBtn.innerHTML = config.svgDownloadButton;
            downloadBtn.href = currentEl.href;
            downloadBtn.target = '_blank';
            downloadBtn.setAttribute('download', '');
            downloadBtn.addEventListener('click', function() {
                executeCallback('onDownload');
            });
            dimboxContainer.appendChild(downloadBtn);
        }
    }

    /**
     * @param   {string}    contentHtml 
     * @returns {string}
     */
    function insertCaption(contentHtml) {
        if (currentEl.dataset.dimboxCaption) {
            contentHtml = contentHtml.replace('{{caption}}', currentEl.dataset.dimboxCaption);
        } else {
            contentHtml = contentHtml.replace('{{caption}}', "");
        }
        return contentHtml;
    }

    /**
     * 
     */
    function onContentLoaded() {
        dimboxContainer.classList.add('dimbox-loaded');
        executeCallback('onContentLoaded');
    }

    /**
     * @param   {string}    galleryName 
     */
    function createPrevNextButtons(galleryName) {
        let prevBtn = document.createElement('button');
        let nextBtn = document.createElement('button');
        // Convert dimboxElements NodeList to an array
        let dimboxElementsArr = Array.prototype.slice.call(dimboxElements);
        // Get links with the same data-dimbox value
        thisGalleryLinks = dimboxElementsArr.filter(item => item.dataset.dimbox == galleryName);
        // Set classes
        prevBtn.className = 'dimbox-btn-prev';
        nextBtn.className = 'dimbox-btn-next';
        // Set content from config
        prevBtn.innerHTML = config.svgPrevNextButton;
        nextBtn.innerHTML = config.svgPrevNextButton;
        // Set click event listeners
        prevBtn.addEventListener('click', previous);
        nextBtn.addEventListener('click', next);
        // Append to container
        dimboxContainer.appendChild(prevBtn);
        dimboxContainer.appendChild(nextBtn);
    }

    /**
     * @param   {number}    direction 
     */
    function prevNext(direction) {
        if (! thisGalleryLinks) {
            return;
        }
        if (direction === 1) {
            dimboxContent.addEventListener('transitionend', transitionLeft);
            dimboxContent.classList.add('dimbox-transition-left');
        } else {
            dimboxContent.addEventListener('transitionend', transitionRight);
            dimboxContent.classList.add('dimbox-transition-right');
        } 
    }

    /**
     * 
     */
    function transitionLeft() {
        let index = getCurrentIndex() + 1;
        index = getStartOverIndex(index);
        dimboxContent.classList.remove('dimbox-transition-left');
        dimboxContent.classList.remove('dimbox-transition-right');
        dimboxContent.removeEventListener('transitionend', transitionLeft)
        currentEl = thisGalleryLinks[index];
        currentType = getCurrentType(currentEl);
        dimboxContainer.classList.remove('dimbox-loaded');
        updateContent();
    }

    /**
     * 
     */
    function transitionRight() {
        let index = getCurrentIndex() - 1;
        index = getStartOverIndex(index);
        dimboxContent.classList.remove('dimbox-transition-left');
        dimboxContent.classList.remove('dimbox-transition-right');
        dimboxContent.removeEventListener('transitionend', transitionRight)
        currentEl = thisGalleryLinks[index];
        currentType = getCurrentType(currentEl);
        dimboxContainer.classList.remove('dimbox-loaded');
        updateContent();
    }

    /**
     * 
     */
    function previous() {
        return prevNext(-1);
    }

    /**
     * 
     */
    function next() {
        return prevNext(1);
    }

    /**
     * 
     */
    function createSequence() {
        let sequenceEl = document.createElement('div');
        sequenceEl.className = 'dimbox-sequence';
        sequenceEl.innerHTML = config.sequenceTemplate;
        sequenceEl.querySelector('.dimbox-sequence-current').textContent = getCurrentIndex()+1;
        sequenceEl.querySelector('.dimbox-sequence-total').textContent = thisGalleryLinks.length;
        dimboxContainer.appendChild(sequenceEl);
    }

    /**
     * 
     */
    function updateSequence() {
        let sequenceEl = dimboxContainer.querySelector('.dimbox-sequence-current');
        if (sequenceEl) {
            sequenceEl.textContent = getCurrentIndex()+1;
        }
    }

    /**
     * @param   {KeyboardEvent}    e 
     */
    function onKeyPress(e) {
        switch (e.key) {
            case "ArrowLeft":
                previous();
                break;
            case "ArrowRight":
                next();
                break;
        }
    }

    /**
     * Call next if swiped left and previous when swiped right.
     */
    function checkSwipeDirection() {
        let diffX = Math.abs(touchStartX - touchEndX);
        let diffY = Math.abs(touchStartY - touchEndY);
        // Only horizontal swipes
        if (diffX > diffY) {
            if (touchEndX < touchStartX) { 
                next();
            };
            if (touchEndX > touchStartX) {
                previous();
            }
        }
    }
    
    /**
     * @param   {TouchEvent}    e 
     */
    function onTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }

    /**
     * @param   {TouchEvent}    e 
     */
    function onTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        checkSwipeDirection();
    }

    /**
     * Closes dimbox on overlay click if needed.
     * 
     * @param   {MouseEvent}    e 
     */
    function onOverlayClick(e) {
        let classes = ['dimbox-container', 'dimbox-figure', 'dimbox-video-container', 'dimbox-iframe-container', 'dimbox-ajax-container', 'dimbox-image'];
        let clickedOnBg = false;
        for (let i in classes) {
            if (e.target.classList.contains(classes[i])) {
                if (classes[i] === 'dimbox-image') {
                    // If clicked on image element close only if the image is not loaded yet
                    if (!dimboxContainer.classList.contains('dimbox-loaded')) {
                        clickedOnBg = true;
                        break;
                    }
                } else {
                    clickedOnBg = true;
                    break;
                }
            }
        }
        if (!clickedOnBg || !config.closeOnOverlayClick) {
            return;
        }
        close();
    }

    /**
     * @returns {Function}
     */
    function xhrComplete() {
        //console.log('Request complete, readyState ' + xhr.readyState + ' and status ' + xhr.status);
        if (xhr.readyState === 4 && xhr.status === 200) {
            //console.log(xhr.response);
            dimboxContent.innerHTML = insertCaption(config.ajaxTemplate);
            if (typeof config.onXhrComplete === "function") {
                return config.onXhrComplete(xhr.response);
            }
            dimboxContainer.classList.add('dimbox-loaded');
        } else {
            console.error('Error completing XHR request');
        }
    }

    /**
     * 
     */
    function xhrError() {
        console.error('Error completing XHR request');
    }

    /**
     * 
     */
    function xhrAbort() {
        console.error('XHR request aborted');
    }

    /**
     * @param   {HTMLElement}   el 
     * @returns {string}
     */
    function getCurrentType(el) {
        if (el.dataset.dimboxType) {
            if (types.indexOf(el.dataset.dimboxType) !== -1) {
                return el.dataset.dimboxType;
            } else {
                console.error('Invalid value for attribute data-dimbox-type');
                return detectType(el);
            }
        }
        return detectType(el);
    }

    /**
     * Detects content type and throws an error if unable to detect.
     * 
     * @param   {HTMLElement}   el
     * @throws  {Error}
     * @returns {string}
     */
    function detectType(el) {
        if (isImgUrl(el.href)) {
            return 'image';
        } else if (isVideoUrl(el.href)) {
            return 'video';
        } else if (isHash(el.getAttribute('href'))) {
            return 'inline';
        } else if (isUrl(el.href)) {
            return 'iframe';
        }
        throw new Error('Unable to autodetect type');
    }

    /**
     * Closes FigureBox by removing the container element from the DOM.
     */
    function close() {
        executeCallback('onBeforeClose');
        window.removeEventListener('keydown', onKeyPress);
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchend', onTouchEnd);
        dimboxContainer.classList.remove('show');
        // Wait for the fade out transition to end
        setTimeout(function() {
            document.body.removeChild(dimboxContainer);
            // Make page scrollable again
            document.documentElement.classList.remove('dimbox-noscroll');
            // Remove documentElement extra padding
            document.documentElement.style.paddingRight = '';
            executeCallback('onAfterClose');
        }, 500);
    }

    /**
     * @param   {string}    cbName 
     */
    function executeCallback(cbName) {
        if (typeof config[cbName] === "function") {
            return config[cbName]();
        }
    }

    /**
     * @returns {number}
     */
    function getCurrentIndex() {
        if (Array.isArray(thisGalleryLinks)) {
            for (let i in thisGalleryLinks) {
                if (thisGalleryLinks[i] == currentEl) {
                    return parseInt(i);
                }
            }
        }
        return null;
    }

    /**
     * @param   {number}    index 
     * @returns {number}
     */
    function getStartOverIndex(index) {
        if (index == -1) {
            // This is the first one, start over
            return thisGalleryLinks.length-1;
        } else if (index == thisGalleryLinks.length) {
            // This is the last one, start over
            return 0;
        }
        return index;
    }

    /**
     * Overrides default config with given option.
     * 
     * @param   {object}    options 
     */
    function setConfig(options) {
        Object.assign(config, options);
    }

    /**
     * @param   {string}    str 
     * @returns {boolean}
     */
    function isUrl(str) {
        try {
            new URL(str);
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * @param   {string}    str 
     * @returns {boolean}
     */
    function isHash(str) {
        return str.substring(0, 1) == '#';
    }

    /**
     * @param   {string}    str 
     * @returns {boolean}
     */
    function isImgUrl(str) {
        const urlObj = new URL(str);
        // Remove parameters
        urlObj.search = '';
        return /\.(jpg|jpeg|jfif|pjpeg|pjp|png|apng|webp|avif|gif|svg)$/.test(urlObj.toString());
    }

    /**
     * @param   {string}    str 
     * @returns {boolean}
     */
    function isVideoUrl(str) {
        const urlObj = new URL(str);
        // Remove parameters
        urlObj.search = '';
        return /\.(mp4|ogg|ogv|webm)$/.test(urlObj.toString());
    }

    window.addEventListener('DOMContentLoaded', init);
    
    // Reveal public pointers to private functions and properties
    return {
        close: close,
        next: next,
        open: open,
        previous: previous,
        setConfig: setConfig       
    };

})();

// Module support
if (typeof module === 'object' && typeof module.exports === 'object') {
    // Node.js or CommonJS
    module.exports = exports = dimbox;
} else if (typeof define === 'function' && define.amd) {
    // AMD
    define(function () {
        return dimbox;
    });
}