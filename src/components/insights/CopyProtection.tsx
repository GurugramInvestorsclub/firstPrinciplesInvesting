"use client"

import { useEffect } from "react"

export function CopyProtection() {
    useEffect(() => {
        // Prevent context menu (right-click)
        const preventContextMenu = (e: MouseEvent) => {
            e.preventDefault()
        }

        // Prevent copying, cutting, and pasting
        const preventCopy = (e: ClipboardEvent) => {
            e.preventDefault()
        }
        const preventCut = (e: ClipboardEvent) => {
            e.preventDefault()
        }
        const preventPaste = (e: ClipboardEvent) => {
            e.preventDefault()
        }

        // Prevent drag and drop of text or images
        const preventDrag = (e: DragEvent) => {
            e.preventDefault()
        }

        // Prevent selection start
        const preventSelection = (e: Event) => {
            e.preventDefault()
        }

        // Prevent specific keyboard shortcuts
        const preventShortcuts = (e: KeyboardEvent) => {
            const isCtrlOrCmd = e.ctrlKey || e.metaKey

            // Block Ctrl+C (Copy), Ctrl+X (Cut), Ctrl+A (Select All), Ctrl+U (Source), Ctrl+S (Save)
            if (isCtrlOrCmd && ['c', 'x', 'a', 'u', 's'].includes(e.key.toLowerCase())) {
                e.preventDefault()
            }

            // Block DevTools shortcuts: F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J
            if (
                e.key === 'F12' ||
                (isCtrlOrCmd && e.shiftKey && ['i', 'c', 'j'].includes(e.key.toLowerCase()))
            ) {
                e.preventDefault()
            }
        }

        // Add event listeners to document
        document.addEventListener("contextmenu", preventContextMenu)
        document.addEventListener("copy", preventCopy)
        document.addEventListener("cut", preventCut)
        document.addEventListener("paste", preventPaste)
        document.addEventListener("dragstart", preventDrag)
        document.addEventListener("selectstart", preventSelection)
        document.addEventListener("keydown", preventShortcuts)

        // Inject CSS to disable text selection globally on the page body
        const style = document.createElement("style")
        style.id = "copy-protection-styles"
        style.innerHTML = `
            body {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
            }
            /* Re-enable input selection for comment form and other interactive elements */
            input, textarea {
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                user-select: text !important;
            }
        `
        document.head.appendChild(style)

        // Clean up listeners and styles on unmount
        return () => {
            document.removeEventListener("contextmenu", preventContextMenu)
            document.removeEventListener("copy", preventCopy)
            document.removeEventListener("cut", preventCut)
            document.removeEventListener("paste", preventPaste)
            document.removeEventListener("dragstart", preventDrag)
            document.removeEventListener("selectstart", preventSelection)
            document.removeEventListener("keydown", preventShortcuts)

            const existingStyle = document.getElementById("copy-protection-styles")
            if (existingStyle) {
                existingStyle.remove()
            }
        }
    }, [])

    return null
}
