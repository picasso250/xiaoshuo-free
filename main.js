// polyfill
if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        value: function (search, pos) {
            pos = !pos || pos < 0 ? 0 : +pos;
            return this.substring(pos, pos + search.length) === search;
        }
    });
}

var latest = 0; // 最新的章节 <latest>.html
var currentPage = "";
var nextPage = "";

var index;
var page;

function onGoto(event) {
    goToPage(getIndexData(event.target));
}
var indexList = document.getElementById("indexList");
var authorSay = document.getElementById("authorSay");
function loaded() {
    authorSay.style.display = 'none'
    index = document.getElementById("index");
    page = document.getElementById("page");
    var i = getWantIndex();

    // 如果 #1 则去第一章
    if (i >= 0) {
        goToPage(i);
    }

    // var idx = getIndexFromLocal(); // ok
    // showIndex(idx, 0); // ok
    loadIndexFromNet(); // ok
    var prevBtn = document.getElementById("prevBtn").addEventListener("click", onGoto);
    var nextBtn = document.getElementById("nextBtn").addEventListener("click", onGoto);
    var indexBtn = document.getElementById("indexBtn").addEventListener("click", function () {
        // var idx = getIndexFromLocal(); // ok
        showIndex(); // ok
        // getLatestIndex();  // ok
        // loadIndexFromNet(idx.length); // ok
    });
    indexList.children[0].children[0].addEventListener("click", onGoto);
}
function goToPage(i) {
    if (!loadPageFromCache(i)) { // ok
        loadPageFromNet(i, function (data) { // ok
            showPage(i, data); // ok
            currentPage = pageCache(i, data);
        });
    }
    loadPageFromNet(i + 1, function (data) {
        nextPage = pageCache(i + 1, data);
        if (latest < i + 1 + 1) {
            latest = i + 1 + 1;
        }
        setPrev(i - 1);
        setNext(i + 1);
    });
}
function getIndexFromLocal() {
    var r = localStorage.getItem("index");
    if (r) {
        return JSON.parse(r);
    }
    return [];
}
function showIndex() {
    page.style.display = 'none';
    index.style.display = '';
}

function loadIndexFromNet(i) {
    var fname = "toc.html";
    loadFile(fname, function (data) {
        indexList.innerHTML = data
        for (let i = 0; i < indexList.children.length; i++) {
            let a = indexList.children[i]
            let index = i
            a.addEventListener("click", function () {
                goToPage(index)
            })
        }
    }, function () {
    });
}
function loadPageFromCache(i) {
    var raw;
    if (raw = pageIndexMatch(i, currentPage)) {
        showPage(i, raw);
        return true;
    }
    if (raw = pageIndexMatch(i, nextPage)) {
        showPage(i, raw);
        return true;
    }
    return false;
}
function loadPageFromNet(i, cacheFunc) {
    var fname = (i + 1) + ".html";
    loadFile(fname, function (data) {
        var title = getTitle(data);
        indexCacheSet(i, title); // ok
        cacheFunc(data);
    }, function () {
        console.log(i, "no page found")
    })
}
function pageCache(i, data) {
    return i + "::" + data;
}
function loadFile(path, ok, fail) {
    if (!fail) fail = function () { };

    var request = new XMLHttpRequest();
    request.open('GET', path, true);

    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            // Success!
            ok(this.response);
        } else {
            // We reached our target server, but it returned an error
            fail(request);
        }
    };

    request.onerror = function () {
        // There was a connection error of some sort
        fail(request);
    };

    request.send();
}
function indexCacheSet(i, title) {
    var idx = getIndexFromLocal();
    if (idx[i]) {
        idx[i] = title;
    } else {
        idx.push(title);
    }
    localStorage.setItem("index", JSON.stringify(idx));
}
function indexTitleSet(i, title) {
    var indexList = document.getElementById("indexList");
    if (indexList.children[i]) {
        var a = indexList.children[i].children[0];
        a.textContent = title;
        a.setAttribute("data-index", i);
        a.setAttribute("href", "#" + (i + 1));
    } else {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.textContent = title;
        a.setAttribute("data-index", i);
        a.setAttribute("href", "#" + (i + 1));
        a.addEventListener("click", onGoto);
        li.appendChild(a);
        indexList.appendChild(li);
    }
}
function pageIndexMatch(i, cache) {
    var s = i + "::";
    if (cache.startsWith(s)) {
        return cache.substring(s.length);
    }
    return "";
}
function showPage(i, raw) {
    var ch = parseText(raw);
    setPrev(i - 1);
    setNext(i + 1);
}
function getTitle(raw) {
    var lines = raw.match(/[^\r\n]+/g);
    return lines.shift()
}
function parseText(raw) {
    var lines = raw.match(/[^\r\n]+/g);
    var t = lines.shift()
    var title = document.getElementById("title");
    var text = document.getElementById("text");
    authorSay.style.display = "none";

    title.innerHTML = "";
    text.innerHTML = "";
    authorSay.innerHTML = "";

    title.innerText = t;
    var a = lines[lines.length - 1];
    if (a.startsWith("=")) {
        lines.pop();
        authorSay.innerText = a.substring(1);
        authorSay.style.display = "";
    }
    for (var i = 0; i < lines.length; i++) {
        var ln = lines[i];
        var p = document.createElement("p");
        if (ln.startsWith("~")) {
            ln = ln.substring(1)
            p.classList.add("shake")
        }
        p.innerText = ln;
        text.appendChild(p);
    }
    index.style.display = 'none';
    page.style.display = '';

    if (window.afterParse){
        for (let f of window.afterParse){
            f()
        }
    }
}
function setPrev(i) {
    var prev = document.getElementById("prevBtn");
    prev.setAttribute("data-index", i);
    setTimeout(function () {
        prev.setAttribute("href", "#" + (i + 1));
    }, 1)
    if (i < 0) {
        prev.style.visibility = "hidden";
    } else {
        prev.style.visibility = "visible";
    }
}
function setNext(i) {
    var next = document.getElementById("nextBtn");
    next.setAttribute("data-index", i);
    setTimeout(function () {
        next.setAttribute("href", "#" + (i + 1));
    }, 1)
    if (i >= latest) { // include latest==0
        next.style.visibility = "hidden";
    } else {
        next.style.visibility = "visible";
    }
}
function getIndexData(elem) {
    var i = elem.getAttribute("data-index");
    return parseInt(i, 10);
}
function getWantIndex() {
    var hash = location.hash;
    if (hash.length > 1) {
        return parseInt(hash.substring(1), 10) - 1;
    }
    return -1;
}
function ready(fn) {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}
ready(loaded);