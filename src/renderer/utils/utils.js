export function getUrlQuery(name, url) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=([^&;]+?)(&|#|;|$)').exec(url) || ['', ''])[1].replace(/\+/g, '%20')) || null
}


export function getUserDevices(typesArr) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.error("enumerateDevices() not supported.");
        return null;
    } else {
        return navigator.mediaDevices.getUserMedia({
            video: /video/.test(typesArr.join(':')),
            audio: /audio/.test(typesArr.join(':'))
        }).then(async stream => {
            await stream.getTracks().forEach(async function(track) {
                await track.stop();
            });
            // List cameras and microphones.
            return navigator.mediaDevices.enumerateDevices()
        });
    }   
}

export function addFileExtInfo(file) {
    const lastDot = file.name.lastIndexOf('.');
    file._name = file.name.substring(0, lastDot);
    file._ext = file.name.substring(lastDot + 1);
    return file;
}


export function getMinutesSeconds(ts1, ts2) {

    var seconds = Math.floor(ts2 - ts1);
    var minutes = Math.floor(seconds/60);
    // var hours = Math.floor(minutes/60);
    // var days = Math.floor(hours/24);

    // hours = hours-(days*24);
    // minutes = minutes-(days*24*60)-(hours*60);
    // seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
    seconds = seconds-(minutes*60);

    return ((minutes > 9 ? "" + minutes: "0" + minutes) + ':' + ("0" + seconds).slice(-2))
}

export function getUserAgentDetails() {

    //rendering engines
    var engine = {
        ie: 0,
        gecko: 0,
        webkit: 0,
        khtml: 0,
        opera: 0,

        //complete version
        ver: null
    };

    //browsers
    var browser = {

        //browsers
        ie: 0,
        edge: 0,
        firefox: 0,
        safari: 0,
        konq: 0,
        opera: 0,
        chrome: 0,
        wechat: 0,

        //specific version
        ver: null
    };


    //platform/device/OS
    var system = {
        win: false,
        mac: false,
        x11: false,

        //mobile devices
        iphone: false,
        ipod: false,
        ipad: false,
        ios: false,
        android: false,
        nokiaN: false,
        winMobile: false,

        //game systems
        wii: false,
        ps: false
    };

    //detect rendering engines/browsers
    var ua = navigator.userAgent;

    

    // console.log(ua);

    if (window.opera) {
        engine.ver = browser.ver = window.opera.version();
        engine.opera = browser.opera = parseFloat(engine.ver);
    } else if (/AppleWebKit\/(\S+)/.test(ua)) {
        engine.ver = RegExp["$1"];
        engine.webkit = parseFloat(engine.ver);

        //figure out if it's Chrome or Safari
        if (/Chrome\/(\S+)/.test(ua)) {
            browser.ver = RegExp["$1"];
            browser.chrome = parseFloat(browser.ver);
        } else if (/MicroMessenger\/(\S+)/.test(ua)) {
            browser.ver = RegExp["$1"];
            browser.wechat = parseFloat(browser.ver);
        } else if (/Version\/(\S+)/.test(ua)) {
            browser.ver = RegExp["$1"];
            browser.safari = parseFloat(browser.ver);
        } else {
            //approximate version
            var safariVersion = 1;
            if (engine.webkit < 100) {
                safariVersion = 1;
            } else if (engine.webkit < 312) {
                safariVersion = 1.2;
            } else if (engine.webkit < 412) {
                safariVersion = 1.3;
            } else {
                safariVersion = 2;
            }

            browser.safari = browser.ver = safariVersion;
        }
    } else if (/KHTML\/(\S+)/.test(ua) || /Konqueror\/([^;]+)/.test(ua)) {
        engine.ver = browser.ver = RegExp["$1"];
        engine.khtml = browser.konq = parseFloat(engine.ver);
    } else if (/rv:([^)]+)\) Gecko\/\d{8}/.test(ua)) {
        engine.ver = RegExp["$1"];
        engine.gecko = parseFloat(engine.ver);

        //determine if it's Firefox
        if (/Firefox\/(\S+)/.test(ua)) {
            browser.ver = RegExp["$1"];
            browser.firefox = parseFloat(browser.ver);
        }
    } else if (/MSIE ([^;]+)/.test(ua)) {
        engine.ver = browser.ver = RegExp["$1"];
        engine.ie = browser.ie = parseFloat(engine.ver);
    } 

    //detect browsers
    browser.ie = engine.ie;
    browser.opera = engine.opera;


    //detect platform
    var p = navigator.platform;
    system.win = p.indexOf("Win") == 0;
    system.mac = p.indexOf("Mac") == 0;
    system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);

    //detect windows operating systems
    if (system.win) {
        if (/Win(?:dows )?([^do]{2})\s?(\d+\.\d+)?/.test(ua)) {
            if (RegExp["$1"] == "NT") {
                switch (RegExp["$2"]) {
                    case "5.0":
                        system.win = "2000";
                        break;
                    case "5.1":
                        system.win = "XP";
                        break;
                    case "6.0":
                        system.win = "Vista";
                        break;
                    case "6.1":
                        system.win = "7";
                        break;
                    default:
                        system.win = "NT";
                        break;
                }
            } else if (RegExp["$1"] == "9x") {
                system.win = "ME";
            } else {
                system.win = RegExp["$1"];
            }
        }
    }

    //mobile devices
    system.iphone = ua.indexOf("iPhone") > -1;
    system.ipod = ua.indexOf("iPod") > -1;
    system.ipad = ua.indexOf("iPad") > -1;
    system.nokiaN = ua.indexOf("NokiaN") > -1;

    //windows mobile
    if (system.win == "CE") {
        system.winMobile = system.win;
    } else if (system.win == "Ph") {
        if (/Windows Phone OS (\d+.\d+)/.test(ua)) {
            system.win = "Phone";
            system.winMobile = parseFloat(RegExp["$1"]);
        }
    }


    //determine iOS version
    if (system.mac && ua.indexOf("Mobile") > -1) {
        if (/CPU (?:iPhone )?OS (\d+_\d+)/.test(ua)) {
            system.ios = parseFloat(RegExp.$1.replace("_", "."));
        } else {
            system.ios = 2; //can't really detect - so guess
        }
    }

    //determine Android version
    // if (/Android (\d+\.\d+)/.test(ua))
    if (/Android ?([^do]{2})\s?(\d+\.\d+)?/.test(ua)) {
        system.android = parseFloat(RegExp.$1);
    }

    //gaming systems
    system.wii = ua.indexOf("Wii") > -1;
    system.ps = /playstation/i.test(ua);

    //account for ipad safari desktop mode
    if (system.mac && browser.safari && !!('ontouchstart' in window || navigator.maxTouchPoints)) {
        system.mac = false;
        system.ipad = true;
    }

    //return it
    return {
        engine: engine,
        browser: browser,
        system: system,
        desktop: system.win || system.mac,
        pip_available: document.pictureInPictureEnabled
    };

}