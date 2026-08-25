// Scroll-reveal wiring for [data-reveal] elements, ported from the design handoff.
// Three triggers are required (an IntersectionObserver alone loses sections on a
// fast flick): the observer, an above-viewport check in its callback, and a
// rAF-throttled scroll sweep. Elements already within 92% of the viewport on
// mount are never hidden, so above-the-fold content paints immediately.

export function wireReveal(root: ParentNode): () => void {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return () => {}

    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"))
    const show = (el: HTMLElement) => {
        el.style.opacity = "1"
        el.style.transform = "none"
        el.dataset.revealDone = "1"
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        els.forEach(show)
        return () => {}
    }

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((en) => {
                const above = en.boundingClientRect.top < (en.rootBounds ? en.rootBounds.top : 0)
                if (en.isIntersecting || above) {
                    show(en.target as HTMLElement)
                    io.unobserve(en.target)
                }
            })
        },
        { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    )

    let raf = 0
    const sweep = () => {
        raf = 0
        let pending = 0
        els.forEach((el) => {
            if (el.dataset.revealDone) return
            if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
                show(el)
                io.unobserve(el)
            } else pending++
        })
        if (!pending) window.removeEventListener("scroll", onScroll)
    }
    const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(sweep)
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    els.forEach((el) => {
        // Hide-and-style only once per element, but always (re)observe — the
        // effect can run twice in React dev StrictMode, and the first observer
        // is disconnected in cleanup.
        if (el.dataset.revealDone) return
        if (!el.dataset.revealed) {
            el.dataset.revealed = "1"
            const delay = parseFloat(el.dataset.revealDelay || "0")
            const line = el.getAttribute("data-reveal") === "line"
            el.style.transition = `opacity .8s ease ${delay}s, transform ${line ? "1.1s" : ".9s"} cubic-bezier(.2,.7,.2,1) ${delay}s`
            if (line) el.style.transformOrigin = "left center"
            if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
                el.style.opacity = line ? "1" : "0"
                el.style.transform = line ? "scaleX(0)" : "translateY(22px)"
            }
        }
        io.observe(el)
    })

    return () => {
        io.disconnect()
        window.removeEventListener("scroll", onScroll)
        if (raf) cancelAnimationFrame(raf)
    }
}
