# Screenshot → UI Workflow

Turn any app screenshot into production-ready UI code with pixel-perfect accuracy.

## Quick Start

### Using the Claude Code Skill

Run the slash command in Claude Code:

```
/screenshot-to-ui
```

Then paste or reference your screenshot. Claude will analyze it and generate the matching component code.

### Manual Prompt

Copy and paste this into any AI assistant along with your screenshot:

```
Act as a world-class mobile UI engineer and designer.
I am going to give you a screenshot of an app screen.
Your job is to recreate this design with pixel-perfect accuracy.

DESIGN REPLICATION RULES:
→ Match every color exactly — extract hex codes from the image
→ Match font sizes, font weights, and spacing as closely as possible
→ Match border radius on every button, card, and container
→ Match padding and margin on every element
→ Match the layout structure exactly — if it's a column, build a column
→ Match shadows, gradients, and background colors
→ Match icon sizes and placements
→ If there is a navigation bar, replicate it exactly
→ If there are images or avatars, use placeholder images the same size

TYPOGRAPHY RULES:
→ Identify if the font is Sans-serif, Serif, or Monospace and match it
→ Match heading size, body size, and caption size as seen in the screenshot
→ Match letter spacing and line height visually
→ Match bold, medium, and regular weights exactly as shown

COLOR RULES:
→ Extract the primary background color
→ Extract the primary accent color
→ Extract the text color for headings and body separately
→ Extract any gradient start and end colors
→ Replicate the exact color hierarchy shown

COMPONENT RULES:
→ Every button must match — size, color, radius, label, and shadow
→ Every card must match — padding, background, border, and shadow
→ Every input field must match — border, placeholder style, and height
→ Every list item must match — spacing, icon placement, and divider style
→ Every modal or bottom sheet must match — handle, background, and padding

INTERACTION RULES:
→ Add pressed state styling to all buttons
→ Add scroll behavior where content clearly overflows
→ Make the layout responsive to different screen heights

OUTPUT RULES:
→ Build this as a complete, self-contained screen
→ Use no placeholder text unless it appears in the screenshot
→ Do not add any elements that are not in the screenshot
→ Do not remove any elements that are in the screenshot
→ The final output must look identical to the screenshot when rendered

Here is the screenshot. Replicate it exactly.
```

### Framework Suffixes

Append one of these to the prompt for framework-specific output:

| Framework | Suffix |
|-----------|--------|
| React Native | `Generate the output as a React Native component using StyleSheet.` |
| Flutter | `Generate the output as a Flutter widget using Material Design.` |
| SwiftUI | `Generate the output as a SwiftUI View.` |
| HTML/Tailwind | `Generate the output as HTML with Tailwind CSS classes.` |

## Rules Breakdown

### Design Replication (9 rules)
Covers colors, fonts, spacing, border radius, padding, margins, layout structure, shadows, gradients, icons, navigation bars, and image placeholders.

### Typography (4 rules)
Font family detection, heading/body/caption sizing, letter spacing, line height, and font weight matching.

### Color (5 rules)
Background extraction, accent colors, text colors for headings vs body, gradient start/end colors, and color hierarchy.

### Components (5 rules)
Buttons, cards, inputs, list items, and modals/bottom sheets — each matched for size, color, padding, borders, and shadows.

### Interaction (3 rules)
Pressed states on buttons, scroll behavior for overflow content, and responsive layout for different screen heights.

### Output (5 rules)
Self-contained screen, no extra placeholder text, no added elements, no removed elements, and pixel-identical final output.

## Pro Tips

- Use high-resolution screenshots (2x or 3x) for better color and detail extraction
- Crop to a single screen — multi-screen inputs reduce accuracy
- For complex screens, break into sections and generate each separately
- Specify your target framework for framework-specific output

## Workflow

```
Design / Dribbble / Figma  →  Screenshot  →  AI + Prompt  →  Working UI Code
```
