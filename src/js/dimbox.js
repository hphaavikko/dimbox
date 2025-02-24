/**
 * DimBox - Lightweight, accessible and dependency free JavaScript library for displaying images, videos and other content on a web page.
 * https://github.com/hphaavikko/dimbox
 * 
 * @version 1.2.0
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
        fullscreen: false,
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
        onAfterEnterFullscreen: null,
        onAfterExitFullscreen: null,
        onAfterInit: null,
        onAfterOpen: null,
        onAfterUpdateContent: null,
        onBeforeClose: null,
        onBeforeEnterFullscreen: null,
        onBeforeExitFullscreen: null,
        onBeforeInit: null,
        onBeforeOpen: null,
        onBeforeUpdateContent: null,
        onContentLoaded: null,
        onDownload: null,
        onXhrComplete: null,
        selector: 'a[data-dimbox]',
        sequenceTemplate: '<span class="dimbox-sequence-current">{{current}}</span> / <span class="dimbox-sequence-total">{{total}}</span>',
        showDownloadButton: true,
        showFullscreenButton: true,
        svgCloseButton: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>',
        svgDownloadButton: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>',
        svgFullscreenButton: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5"/></svg>',
        svgFullscreenExitButton: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z"/></svg>',
        svgImageIcon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-image" viewBox="0 0 16 16"><path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/><path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/></svg>',
        svgPrevNextButton: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>',
        svgVideoIcon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/></svg>',
        theme: 'dark',
        thumbnails: false,
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
    let dimboxButtons;
    let dimboxThumbnails;
    let loader;
    let closeBtn;
    let downloadBtn;
    let fullscreenBtn;
    let thisGalleryLinks;
    let currentEl;
    let currentType;
    let jumpToIndex;
    let focusableEls;
    let prevFocusedElement;
    let currentFocus;
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
        
        // Add fullscreen change listener if fullscreen is enabled
        if (config.showFullscreenButton) {
            window.addEventListener('fullscreenchange', fullscreenChangeHandler);
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
     * 
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

        dimboxButtons = document.createElement('div');
        dimboxButtons.className = 'dimbox-buttons';

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
        window.addEventListener('keydown', handleEscPress);

        // Set up gallery stuff
        if (currentEl.dataset.dimbox !== '') {
            // Check if there are any other items in the same gallery
            let galleryLinks = document.querySelectorAll('[data-dimbox="' + currentEl.dataset.dimbox + '"]');
            // Set up prev/next buttons and sequence element if more than one item
            if (galleryLinks.length > 1) {
                createPrevNextButtons(currentEl.dataset.dimbox);
                createSequence();

                // Create thumbnails if needed
                if (config.thumbnails) {
                    dimboxContainer.classList.add('has-thumbnails');
                    dimboxThumbnails = document.createElement('div');
                    dimboxThumbnails.classList.add('dimbox-thumbnails');

                    for (let i = 0; i < galleryLinks.length; i++) {
                        let galleryLink = galleryLinks[i];
                        let tnA = document.createElement('a');
                        let tnImg;

                        tnA.dataset.dimboxIndex = i;
                        tnImg = document.createElement('img');
                        tnImg.dataset.dimboxIndex = i;

                        if (galleryLink.dataset.dimboxThumbnail) {
                            // Custom thumbnail image set via data attribute
                            tnImg.src = galleryLink.dataset.dimboxThumbnail;
                        } else {
                            // No custom thumbnail, get link img if there is one
                            for (let j = 0; j < galleryLink.children.length; j++) {
                                let child = galleryLink.children[j];
                                if (child.tagName === 'IMG') {
                                    tnImg.src = child.src;
                                    break;
                                }
                            }
                        }

                        tnA.href = galleryLinks[getCurrentIndex()].href;
                            
                        tnA.addEventListener('click', thumbnailClick);
                        tnA.addEventListener('focus', thumbnailFocus);

                        if (tnImg.src) {
                            tnA.appendChild(tnImg);
                        } else {
                            // No thumbnail img element found in link, create placeholder tn
                            switch (detectType(galleryLink)) {
                                case 'image':
                                    tnA.innerHTML = config.svgImageIcon;
                                    break;
                                case 'video':
                                    tnA.innerHTML = config.svgVideoIcon;
                                    break;
                                default: 
                                    tnA.textContent = '?';
                                    break;
                            }
                        }

                        dimboxThumbnails.appendChild(tnA);
                        dimboxContainer.appendChild(dimboxThumbnails);
                    }
                }

                window.addEventListener('keydown', handleArrowsPress);
                window.addEventListener('touchstart', onTouchStart);
                window.addEventListener('touchend', onTouchEnd);
                
                dimboxContainer.classList.add('dimbox-gallery');

                //updateActiveThumbnail();
            }
        }

        dimboxContainer.appendChild(loader);

        // Create fullscreen button if needed
        if (config.showFullscreenButton) {
            fullscreenBtn = document.createElement('button');
            fullscreenBtn.className = 'dimbox-btn-fullscreen';
            fullscreenBtn.innerHTML = config.svgFullscreenButton;
            fullscreenBtn.addEventListener('click', toggleFullscreen);
            dimboxButtons.appendChild(fullscreenBtn);
        }

        dimboxButtons.appendChild(closeBtn);

        dimboxContainer.appendChild(dimboxButtons);
        dimboxContainer.appendChild(dimboxContent);
        
        closeBtn.addEventListener('click', close);
        dimboxContainer.addEventListener('click', onOverlayClick);

        document.body.appendChild(dimboxContainer);

        // Get focusable elements in DimBox container
        focusableEls = Array.from(
            dimboxContainer.querySelectorAll(
              'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
            )
        );

        // Get the currently focused element
        prevFocusedElement = document.activeElement;
        
        // Add elements with tabIndex 0 to start and end of the trap
        let focusTrapDivStart = document.createElement('div');
        let focusTrapDivEnd = document.createElement('div');
        focusTrapDivStart.tabIndex = '0';
        focusTrapDivEnd.tabIndex = '0';
        dimboxContainer.prepend(focusTrapDivStart);
        dimboxContainer.append(focusTrapDivEnd);
        
        // Trap focus inside dimboxContainer on focus change
        document.addEventListener('focus', trapFocus, true);

        setTimeout(function() {
            dimboxContainer.classList.add('show');
            // Go fullscreen if set
            if (config.fullscreen && ! document.fullscreenElement) {
                executeCallback('onBeforeEnterFullscreen');
                document.documentElement.requestFullscreen();
            }
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
     * Traps focus inside dimboxContainer when DimBox is open.
     * 
     * @param   {FocusEvent}    e
     */
    function trapFocus(e) {
        e.preventDefault();
        
        let firstFocusableEl = focusableEls[0];
        let lastFocusableEl = focusableEls[focusableEls.length - 1];

        // Focus element if it is inside dimboxContainer
        if (focusableEls.indexOf(e.target) !== -1) {
            currentFocus = e.target;
        } else {
            // We're out of dimboxContainer
            // If previously focused element was the first element then focus the last 
            if (currentFocus === firstFocusableEl) {
                lastFocusableEl.focus();
            } else {
                // If previously focused element was the last focus the first one
                firstFocusableEl.focus();
            }
            currentFocus = document.activeElement;
        }
    }

    /**
     * 
     */
    function updateContent() {
        executeCallback('onBeforeUpdateContent', currentEl);
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
        executeCallback('onAfterUpdateContent', currentEl);
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
    function resetThumbnails() {
        if (config.thumbnails) {
            // Remove current classes from all thumbnails
            for (let i = 0; i < dimboxThumbnails.children.length; i++) {
                dimboxThumbnails.children[i].classList.remove('current');
            }
        }
    }

    /**
     * 
     */
    function updateActiveThumbnail() {
        if (config.thumbnails) {
            // Add current class to the current thumbnail
            const currentTn = dimboxThumbnails.children[getCurrentIndex()];
            currentTn.classList.add('current');
            // Move thumbnails so that current thumbnail is always in the center
            const currentTnOffsetLeft = currentTn.offsetLeft;
            dimboxThumbnails.style.marginLeft = -((currentTn.offsetWidth / 2) + currentTnOffsetLeft) + 'px';
        }
    }

    /**
     * 
     */
    function thumbnailClick(e) {
        e.preventDefault();
        jumpToIndex = e.target.dataset.dimboxIndex;
        if (jumpToIndex > getCurrentIndex()) {
            prevNext(1);
        } else if (jumpToIndex < getCurrentIndex()) {
            prevNext(-1);
        }
    }

    /**
     * 
     */
    function thumbnailFocus(e) {
        // Check if thumbnail is out of viewport on focus
        // and move thumbnails so that the focused element
        // is fully visible in the viewport.
        const rect = e.target.getBoundingClientRect();
        const currentMargin = parseInt(dimboxThumbnails.style.marginLeft);
        const tnWidth = e.target.offsetWidth;

        if (rect.left <= 0) {
            // Thumbnail is out of the left side of the viewport, move thumbs right
            dimboxThumbnails.style.marginLeft = currentMargin + (tnWidth*2) + 'px';
        } else if (rect.right >= window.innerWidth) {
            // Thumbnail is out of the right side of the viewport, move thumbs left
            dimboxThumbnails.style.marginLeft = currentMargin - (tnWidth*2) + 'px';
        }
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
            /*if (currentType !== 'image' && currentType !== 'video') {
                // ...so remove download button from the DOM
                dimboxButtons.removeChild(downloadBtn);
                downloadBtn = null;
            }*/
        } else {
            // Download button does not exits yet, create it
            downloadBtn = document.createElement('a');
            downloadBtn.className = 'dimbox-btn-download';
            downloadBtn.innerHTML = config.svgDownloadButton;
            downloadBtn.href = currentEl.href;
            downloadBtn.target = '_blank';

            if (currentEl.dataset.dimboxDownloadFile) {
                downloadBtn.href = currentEl.dataset.dimboxDownloadFile;
            }

            downloadBtn.setAttribute('download', '');
            downloadBtn.addEventListener('click', function(e) {
                if (! currentEl.href.includes(window.location.hostname) && ! currentEl.dataset.dimboxDownloadFailed) {
                    // The image is in a different domain
                    e.preventDefault();
                    downloadRemoteFile();
                }
                executeCallback('onDownload');
            });

            dimboxButtons.appendChild(downloadBtn);
        }
    }

    /**
     * Starts remote file download if CORS policy allows.
     * If not, the file is opened in a new tab. 
     */
    function downloadRemoteFile() {
        let url = currentEl.href;

        if (currentEl.dataset.dimboxDownloadFile) {
            url = currentEl.dataset.dimboxDownloadFile;
        }

        let fileName = url.match(/([^\/]+)$/)[1];
        fetch(url)
            .then(function(response) {
                return response.blob();
            })
            .then(function(blob) {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            })
            .catch(function(error) {
                console.error('Downloading image failed probably due to CORS policy, opening the image in a new tab');
                console.error('Error', error);
                currentEl.dataset.dimboxDownloadFailed = 'true';
                downloadBtn.click();
            });
    }
    /**
     * 
     */
    function toggleFullscreen() {
		if (document.fullscreenElement) {
            executeCallback('onBeforeExitFullscreen');
			document.exitFullscreen();
		} else {
            executeCallback('onBeforeEnterFullscreen');
            document.documentElement.requestFullscreen();
		}
        fullscreenBtn.blur();
	}

    /**
     * 
     */
	function fullscreenChangeHandler() {
		if (document.fullscreenElement) {
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = config.svgFullscreenExitButton;
            }
            executeCallback('onAfterEnterFullscreen');
		} else {
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = config.svgFullscreenButton;
            }
            executeCallback('onAfterExitFullscreen');
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
        updateActiveThumbnail();
        executeCallback('onContentLoaded', currentEl);
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
        resetThumbnails();
    }

    /**
     * 
     */
    function transitionLeft() {
        let index = getCurrentIndex() + 1;
        
        if (jumpToIndex) {
            index = getStartOverIndex(jumpToIndex);
        } else {
            index = getStartOverIndex(index);
        }

        dimboxContent.classList.remove('dimbox-transition-left');
        dimboxContent.classList.remove('dimbox-transition-right');
        dimboxContent.removeEventListener('transitionend', transitionLeft)
        currentEl = thisGalleryLinks[index];
        currentType = getCurrentType(currentEl);
        dimboxContainer.classList.remove('dimbox-loaded');
        updateContent();
        updateActiveThumbnail();
        jumpToIndex = null;
    }

    /**
     * 
     */
    function transitionRight() {
        let index = getCurrentIndex() - 1;

         if (jumpToIndex) {
            index = getStartOverIndex(jumpToIndex);
        } else {
            index = getStartOverIndex(index);
        }

        dimboxContent.classList.remove('dimbox-transition-left');
        dimboxContent.classList.remove('dimbox-transition-right');
        dimboxContent.removeEventListener('transitionend', transitionRight)
        currentEl = thisGalleryLinks[index];
        currentType = getCurrentType(currentEl);
        dimboxContainer.classList.remove('dimbox-loaded');
        updateContent();
        updateActiveThumbnail();
        jumpToIndex = null;
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
    function handleArrowsPress(e) {
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
     * @param   {KeyboardEvent}    e 
     */
    function handleEscPress(e) {
        switch (e.key) {
            case "Escape":
                if (! document.fullscreenElement) {
                    close();
                }
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
        let errorDiv = document.createElement('div');
        errorDiv.className = 'dimbox-error';
        errorDiv.textContent = 'Remote content could not be loaded.'
        dimboxContent.innerHTML = '';
        dimboxContent.append(errorDiv);
        dimboxContainer.classList.add('dimbox-loaded');
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
     * Closes DimBox by removing the container element from the DOM.
     */
    function close() {
        executeCallback('onBeforeClose');
        window.removeEventListener('keydown', handleEscPress);
        window.removeEventListener('keydown', handleArrowsPress);
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchend', onTouchEnd);
        dimboxContainer.classList.remove('show');
        // Exit fullscreen if needed
        if (document.fullscreenElement) {
            executeCallback('onBeforeExitFullscreen');
            document.exitFullscreen();
        }
        // Wait for the fade out transition to end
        setTimeout(function() {
            document.body.removeChild(dimboxContainer);
            // Make page scrollable again
            document.documentElement.classList.remove('dimbox-noscroll');
            // Remove documentElement extra padding
            document.documentElement.style.paddingRight = '';
            // Remove focus trap and focus the previously active element
            document.removeEventListener('focus', trapFocus, true);
            prevFocusedElement.focus({ preventScroll: true });
            executeCallback('onAfterClose');
        }, 500);
    }

    /**
     * @param   {string}    cbName 
     */
    function executeCallback(cbName, params) {
        if (typeof config[cbName] === "function") {
            if (params) {
                return config[cbName](params);
            }
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
        init: init,
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
