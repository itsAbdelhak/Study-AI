
import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        mermaid: any;
    }
}

interface MermaidDiagramProps {
  chart: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRendered = useRef(false);

  useEffect(() => {
    if (containerRef.current && !hasRendered.current && chart) {
        hasRendered.current = true;
        
        const renderDiagram = async () => {
            try {
                // Mermaid renders the SVG inside the provided div
                const { svg } = await window.mermaid.render(
                    `mermaid-svg-${Date.now()}`,
                    chart
                );
                if (containerRef.current) {
                    containerRef.current.innerHTML = svg;
                }
            } catch (error) {
                console.error('Mermaid rendering failed:', error);
                if (containerRef.current) {
                    containerRef.current.innerText = 'Error: Could not render diagram.';
                }
            }
        };

        // Ensure mermaid is loaded
        if (window.mermaid) {
            renderDiagram();
        } else {
            console.error('Mermaid library not found.');
        }
    }
  }, [chart]);

  return (
    <div 
        ref={containerRef} 
        className="mermaid-container p-4 my-4 bg-white rounded-lg border border-slate-200 flex justify-center items-center overflow-auto"
    />
  );
};