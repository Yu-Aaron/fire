(function ($) {
    // global options
    var gopt = {};
    var methods = {
        'init': function (selected_index) {
            // These are the default options
            var opt = {
                'minfactor': 45, // how much is the next item smaller than previous in pixels
                'distribution': 1.5, // how apart are the items (items become separated when this value is below 1)
                'scalethreshold': 0, // after how many items to start scaling
                'staticbelowthreshold': false, // if true when number of items is below "scalethreshold" - don't animate
                'titleclass': 'itemTitle', // class name of the element containing the item title
                'selectedclass': 'selected-coverflow-item', // class name of the selected item
                'scrollactive': true, // scroll functionality switch
                'step': { // compressed items on the side are steps
                    'limit': 4, // how many steps should be shown on each side
                    'width': 8, // how wide is the visible section of the step in pixels
                    'scale': true // scale down steps
                },
                'size': 1,  // how wide is the coverscroll. 1 is 100% to the browser.
                'bendamount': 2, // amount of "bending" of the CoverScroll (values 0.1 to 1 bend down, -0.1 to -1 bend up, 2 is straight no bending, 1.5 sligtly bends down)
                'movecallback': function (item) {}, // callback function triggered after click on an item - parameter is the item's jQuery object
                'distributionbelowscale': 0.95, // how apart are the items when number of items are below "scalethreshold"
                'msie': ($('html').is('.ie6, .ie7, .ie8'))
            };
            gopt = opt;
            //console.log("in coverscroll");
            var isScrolling = false;
            var animationCss = {
                '-webkit-transition': 'all 0.5s ease-in-out',
                '-moz-transition': 'all 0.5s ease-in-out',
                '-o-transition': 'all 0.5s ease-in-out',
                '-ms-transition': 'all 0.5s ease-in-out',
                'transition': 'all 0.5s ease-in-out'
            };
            // main loop for selected elements
            return this.each(function () {
                var el = $(this);
                //Setup the width to prevent ng-hide error
                el.width((window.innerWidth || document.body.clientWidth)*opt.size);
                var imgs = el.find('img');

                // if below scale threshold - don't scale
                if (imgs.length <= opt.scalethreshold) {
                    opt.minfactor = 0;
                    opt.distribution = opt.distributionbelowscale;
                }

                // default styles
                el.css({
                    'position': 'relative'
                });
                imgs.css({
                    'position': 'absolute',
                    // '-webkit-transition': 'all 0.5s ease-in-out',
                    // '-moz-transition': 'all 0.5s ease-in-out',
                    // '-o-transition': 'all 0.5s ease-in-out',
                    // '-ms-transition': 'all 0.5s ease-in-out',
                    // 'transition': 'all 0.5s ease-in-out'
                });
                // getting the index of middle item
                //console.log("coverflow: # of image = " + imgs.length);
                var mindex = Math.ceil(imgs.length / 2 - 1);

                if (!(typeof selected_index === "undefined") && selected_index < imgs.length) {
                    mindex = selected_index;
                }

                // draww all items on their appropriate places
                showItems(el, imgs, mindex);

                // add click events
                if (imgs.length <= opt.scalethreshold && opt.staticbelowthreshold) {
                    imgs.each(function (index) {
                        $(this).unbind('click.coverscroll');
                        $(this).bind('click.coverscroll', function () {
                            if ($(this).hasClass(opt.selectedclass)) {
                                return true;
                            }
                            selectItem(el, this);
                        });
                    });
                } else {
                    imgs.each(function (index) {
                        $(this).unbind('click.coverscroll');
                        $(this).bind('click.coverscroll', function () {
                            if ($(this).hasClass(opt.selectedclass)) {
                              console.log();
                                document.location.href = "/topology/singleTopo/" + this.id;
                                return true;
                            }
                            showItems(el, imgs, index);
                        });
                    });
                }

                // add scroll event
                if (!opt.scrollactive) {
                    return true;
                }

                el.unbind('wheel');
                el.on('wheel', function (evt) {
                    if (!isScrolling) {
                        var orgEvent = evt.originalEvent,
                            delta, deltaY, deltaY;

                        // Old school scrollwheel delta
                        if (orgEvent['detail']) {
                            deltaY = orgEvent.detail * -1;
                        }
                        if (orgEvent['wheelDelta']) {
                            deltaY = orgEvent.wheelDelta;
                        }
                        if (orgEvent['wheelDeltaY']) {
                            deltaY = orgEvent.wheelDeltaY;
                        }
                        if (orgEvent['wheelDeltaX']) {
                            deltaX = orgEvent.wheelDeltaX * -1;
                        }

                        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
                        if (orgEvent['axis'] && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
                            deltaX = deltaY * -1;
                            deltaY = 0;
                        }

                        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
                        delta = deltaY === 0 ? deltaX : deltaY;

                        // New school wheel delta (wheel event)
                        if (orgEvent['deltaY']) {
                            deltaY = orgEvent.deltaY * -1;
                            delta = deltaY;
                        }
                        if (orgEvent['deltaX']) {
                            deltaX = orgEvent.deltaX;
                            if (deltaY === 0) {
                                delta = deltaX * -1;
                            }
                        }
                        // is it up or down
                        if (delta > 0) {
                            el.find('.' + opt.selectedclass + ':eq(0)').next().trigger('click');
                        } else {
                            el.find('.' + opt.selectedclass + ':eq(0)').prev().trigger('click');
                        }
                    }
                    evt.preventDefault();
                    evt.stopPropagation();
                    return false;
                });

            });


            function showItems(el, imgs, mindex) {
                var middle = $(imgs.get(mindex));
                // take care of the middle item
                var h = (el.height() > 250) ? 250 : el.height();
                var w = (el.width() > 375) ? 375 : el.width();
                var css = {
                    'width': w,
                    'height': h,
                    'top': 0,
                    'left': Math.round(el.width() / 2 - w / 2)
                };
                if (opt.msie) {
                    isScrolling = true;
                    middle.animate(css, 500, function () {
                        isScrolling = false
                    });
                } else {
                    middle.css(css);
                }
                middle.fadeIn(80);
                // getting the params
                var minfactor = (opt.minfactor === 0 || opt.minfactor > 0) ? opt.minfactor : 15;
                var distrib = opt.distribution ? opt.distribution : 2;

                var titleclass = opt.titleclass ? opt.titleclass : 'coverflow-title';
                if (!opt.bendamount) {
                    opt.bendamount = 2;
                }

                // handling the title and highlight
                selectItem(el, middle, true);

                // left to middle items
                var cd = w,
                    sc = 0;
                sf = false;
                var showing = true;
                var cleft = Math.round(el.width() / 2 - w / 2);
                for (i = mindex - 1; i >= 0; i--) {
                    var citem = $(imgs.get(i));
                    cd = cd - minfactor;
                    if (!sf) {
                        cleft = Math.round(cleft - cd / distrib + minfactor); // diff
                    } else {
                        cd = opt.step.scale ? cd : cd + minfactor;
                        cleft = Math.round(cleft - opt.step.width);
                        sc++;
                    }
                    if (cleft >= 0 && showing && sc <= opt.step.limit) {
                        citem.show();
                    } else if (!sf) {
                        cleft = Math.round(cleft + (cd / distrib) - minfactor - opt.step.width);
                        sf = true;
                        sc++;
                        citem.show();
                    } else {
                        citem.hide();
                        showing = false;
                    }
                    animationCss.width = cd;
                    animationCss.height = cd * 2 / 3;
                    animationCss.top = Math.round(el.height() / opt.bendamount - cd * 2 / 3 / opt.bendamount);
                    animationCss.left = cleft;
                    if (opt.msie) {
                        isScrolling = true;
                        citem.animate(animationCss, 500, function () {
                            isScrolling = false
                        });
                    } else {
                        citem.css(animationCss);
                    }

                }

                //middle to right items
                var cd = w,
                    sc = 0;
                sf = false;
                var cleft = Math.round(el.width() / 2 - w / 2);
                var showing = true;
                for (i = mindex + 1; i < imgs.length; i++) {
                    var citem = $(imgs.get(i));
                    cd = cd - minfactor;
                    if (!sf) {
                        cleft = Math.round(cleft + cd / distrib); // diff
                    } else {
                        cd = opt.step.scale ? cd : cd + minfactor;
                        cleft = Math.round(cleft + opt.step.width + (opt.step.scale ? minfactor : 0));
                        sc++;
                    }
                    if ((cleft + cd) < el.width() && showing && sc <= opt.step.limit) { // diff
                        citem.show();
                    } else if (!sf) {
                        sf = true;
                        sc++;
                        cleft = Math.round((cleft - cd / distrib) + opt.step.width + minfactor);
                        citem.show();
                    } else {
                        citem.hide();
                        showing = false;
                    }
                    animationCss.width = cd;
                    animationCss.height = cd * 2 / 3;
                    animationCss.top = Math.round(el.height() / opt.bendamount - cd * 2 / 3 / opt.bendamount);
                    animationCss.left = cleft;
                    if (opt.msie) {
                        isScrolling = true;
                        citem.animate(animationCss, 500, function () {
                            isScrolling = false
                        });
                    } else {
                        citem.css(animationCss);
                    }
                }

                // take care of z-index
                setTimeout(function () {
                    var zi = 100;
                    imgs.each(function (ind) {
                        if (ind <= mindex) {
                            zi = zi + ind;
                        } else {
                            zi = zi - ind;
                        }
                        $(this).css('z-index', zi);
                    });
                }, 100);
                // end of showItems()
            };

            function selectItem(el, elem) {
                elem = $(elem);
                $(".coverflow-title").text(elem.attr('title'));
                setTimeout(function () {
                    opt.movecallback.call(this, elem)
                }, 600);

                // selecting the item
                setTimeout(function () {
                    el.find('img').removeClass(opt.selectedclass);
                    elem.addClass(opt.selectedclass);
                }, 100);

            };
        },
        // select next
        'next': function (callback) {
            //var opt = {};
            //if (options){$.extend(opt, options);}
            return this.each(function () {
                var el = $(this);
                el.find('.' + gopt.selectedclass + ':eq(0)').next().trigger('click');
            });
        },
        // select previous
        'prev': function () {
            return this.each(function () {
                var el = $(this);
                el.find('.' + gopt.selectedclass + ':eq(0)').prev().trigger('click');
            });
        }
    };
    // generic jQuery plugin skeleton
    $.fn.coverscroll = function (method) {
        if (method === 'goto') {
            return methods.init.apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plugin');
        }
    };
})(jQuery);
