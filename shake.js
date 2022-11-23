window.afterParse = window.afterParse || [];

window.afterParse.push(function () {

    let splitUTF8 = function (s) {
        let a = []
        for (let i = 0; i < s.length;) {
            let c = s.codePointAt(i)
            let ch = String.fromCodePoint(c)
            a.push(ch)
            i += ch.length
        }
        return a
    }
    let toSpan = function (t) {
        let s = document.createElement('span')
        s.textContent = t
        s.style.display = "block"
        s.style.float = "left"
        s.style.textIndent = "0"
        return s
    }

    let allShake = document.querySelectorAll('.shake')
    var shakeFuncs = []
    for (let e of allShake) {
        // e.style.animation = "shake 800ms ease-in-out infinite"
        // e.style.textIndent = "2em"
        let t = e.textContent
        let a = splitUTF8(t)
        e.innerHTML = ""
        let spans = a.map(toSpan)
        for (let ee of spans) {
            e.append(ee)
            let eee = ee
            shakeFuncs.push(function () {
                if (Math.random() < 0.3) {
                    let distMax = 2
                    let dx = Math.random() * distMax * 2 - distMax
                    let dy = Math.random() * distMax * 2 - distMax
                    eee.style.transform = "translate3d(" + dx + "px, " + dy + "px, 0)"
                    let opacityFrom = 70;
                    eee.style.opacity = Math.round(50 + Math.random() * (100 - opacityFrom)) + "%"
                }
            })
        }
    }

    var step = function () {
        for (let f of shakeFuncs) {
            f()
        }
        window.requestAnimationFrame(step)
    }
    window.requestAnimationFrame(step)
})