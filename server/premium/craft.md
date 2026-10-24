Craft rules for every scene (learned from reviewing finished videos):
- Define the palette, the type scale and the spacing as CSS variables first, then use only those. Three or four colours with a clear accent; never default browser colours.
- One hero element, one supporting layer, one quiet ambient layer. The ambient layer stays under about 20% opacity so the hero reads at once.
- Every entrance is eased (ease-out for arrivals, in-out for travel). Nothing moves linearly. Stagger related elements by 80 to 150 ms, and start the next beat before the last one has finished so the motion flows.
- Text must fit: give every label a container with at least 20% padding at the size you set, keep text 80 px inside the frame edges, and never let a label sit on or cross an outline or a ring. Test long values, not just short ones.
- A caret, cursor or progress mark appears only while it is in use: not before the text starts, not after it ends.
- Use believable content (real-looking names, numbers, labels). Never lorem ipsum, never the words "placeholder", "example" or "text here".
- Backgrounds have depth: a gradient or vignette plus a subtle light source, not a flat fill.
- The last 0.6 seconds settle: motion eases to rest, the key message is readable for at least a full second, and the final frame is clean enough to use as a poster.
- In a vertical 9:16 frame keep everything important between 160 px and 1760 px from the top.
