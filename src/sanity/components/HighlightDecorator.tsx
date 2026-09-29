import React from 'react'

export const HighlightIcon = () => (
    <span
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            backgroundColor: '#FFE600',
            color: '#000000',
            fontWeight: 800,
            fontSize: '11px',
            borderRadius: '2px',
            lineHeight: 1,
            userSelect: 'none',
        }}
        title="Highlight (Yellow)"
    >
        H
    </span>
)

export const HighlightDecorator = (props: { children: React.ReactNode }) => {
    return (
        <span
            style={{
                backgroundColor: '#FFE600',
                color: '#000000',
                padding: '2px 4px',
                borderRadius: '3px',
                fontWeight: 500,
            }}
        >
            {props.children}
        </span>
    )
}
