# sketches

Remote life brought with it a lot of changes. One big change for me was the loss of a shared whiteboard around which to brainstorm and sketch out ideas in real-time.

I've been using various tools to fill that gap, but none more than [Excalidraw](https://excalidraw.com/). It's simple yet powerful and instantaneously usable tool that I've been using to sketch out ideas, workflows, and diagrams.

Another change happened in recent years: large language models, and multi-modal models that can interpret images and sketches. This repository is a playground for me to explore how I can use these models to interpret and examine sketches.

## Design decisions

Use of SVGs for sketches: I've chosen to export sketches as SVGs because:

1. they are text (XML) documents that are easy to manipulate, and can be easily converted to other formats. They are supported by most modern browsers, and can be easily embedded in web pages.
2. they are scalable and can be rendered at any resolution. This makes them suitable for framing a large canvas, with the ability to zoom into details.
3. SVG nodes can be examined and manipulated using JavaScript, which makes them suitable for links and interactions like tooltips. They can also be animated using CSS or JavaScript.

