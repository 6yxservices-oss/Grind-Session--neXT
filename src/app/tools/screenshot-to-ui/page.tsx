"use client";

import { useState } from "react";

const promptSections = [
  {
    title: "DESIGN REPLICATION RULES",
    color: "haas-red",
    rules: [
      "Match every color exactly — extract hex codes from the image",
      "Match font sizes, font weights, and spacing as closely as possible",
      "Match border radius on every button, card, and container",
      "Match padding and margin on every element",
      "Match the layout structure exactly — if it's a column, build a column",
      "Match shadows, gradients, and background colors",
      "Match icon sizes and placements",
      "If there is a navigation bar, replicate it exactly",
      "If there are images or avatars, use placeholder images the same size",
    ],
  },
  {
    title: "TYPOGRAPHY RULES",
    color: "alpine-blue",
    rules: [
      "Identify if the font is Sans-serif, Serif, or Monospace and match it",
      "Match heading size, body size, and caption size as seen in the screenshot",
      "Match letter spacing and line height visually",
      "Match bold, medium, and regular weights exactly as shown",
    ],
  },
  {
    title: "COLOR RULES",
    color: "alpine-pink",
    rules: [
      "Extract the primary background color",
      "Extract the primary accent color",
      "Extract the text color for headings and body separately",
      "Extract any gradient start and end colors",
      "Replicate the exact color hierarchy shown",
    ],
  },
  {
    title: "COMPONENT RULES",
    color: "alpine-cyan",
    rules: [
      "Every button must match — size, color, radius, label, and shadow",
      "Every card must match — padding, background, border, and shadow",
      "Every input field must match — border, placeholder style, and height",
      "Every list item must match — spacing, icon placement, and divider style",
      "Every modal or bottom sheet must match — handle, background, and padding",
    ],
  },
  {
    title: "INTERACTION RULES",
    color: "haas-red",
    rules: [
      "Add pressed state styling to all buttons",
      "Add scroll behavior where content clearly overflows",
      "Make the layout responsive to different screen heights",
    ],
  },
  {
    title: "OUTPUT RULES",
    color: "alpine-blue",
    rules: [
      "Build this as a complete, self-contained screen",
      "Use no placeholder text unless it appears in the screenshot",
      "Do not add any elements that are not in the screenshot",
      "Do not remove any elements that are in the screenshot",
      "The final output must look identical to the screenshot when rendered",
    ],
  },
];

const fullPrompt = `Act as a world-class mobile UI engineer and designer.
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

Here is the screenshot. Replicate it exactly.`;

const colorMap: Record<string, string> = {
  "haas-red": "border-haas-red/30 bg-haas-red/5",
  "alpine-blue": "border-alpine-blue/30 bg-alpine-blue/5",
  "alpine-pink": "border-alpine-pink/30 bg-alpine-pink/5",
  "alpine-cyan": "border-alpine-cyan/30 bg-alpine-cyan/5",
};

const dotColorMap: Record<string, string> = {
  "haas-red": "bg-haas-red",
  "alpine-blue": "bg-alpine-blue",
  "alpine-pink": "bg-alpine-pink",
  "alpine-cyan": "bg-alpine-cyan",
};

const textColorMap: Record<string, string> = {
  "haas-red": "text-haas-red",
  "alpine-blue": "text-alpine-blue",
  "alpine-pink": "text-alpine-pink",
  "alpine-cyan": "text-alpine-cyan",
};

export default function ScreenshotToUIPage() {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [framework, setFramework] = useState<"react-native" | "flutter" | "swiftui" | "html">("react-native");

  const frameworkSuffix: Record<string, string> = {
    "react-native": "\n\nGenerate the output as a React Native component using StyleSheet.",
    flutter: "\n\nGenerate the output as a Flutter widget using Material Design.",
    swiftui: "\n\nGenerate the output as a SwiftUI View.",
    html: "\n\nGenerate the output as HTML with Tailwind CSS classes.",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPrompt + frameworkSuffix[framework]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-haas-red to-alpine-pink flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Screenshot → UI</h1>
            <p className="text-sm text-haas-silver">Mobile UI Screenshot Recreation Tool</p>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-3 max-w-2xl">
          Turn any app screenshot into production-ready UI code. Copy the prompt below, paste it into your AI assistant along with a screenshot, and get pixel-perfect code output.
        </p>
      </div>

      {/* Quick Start */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-haas-red/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-haas-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">Quick Start</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Copy the Prompt", desc: "Select your framework and copy the full prompt below" },
            { step: "2", title: "Add Your Screenshot", desc: "Paste the prompt + your app screenshot into an AI assistant" },
            { step: "3", title: "Get Working Code", desc: "Receive pixel-perfect, production-ready UI component code" },
          ].map((item) => (
            <div key={item.step} className="flex gap-3 p-4 rounded-lg bg-haas-gray/50 border border-haas-light/20">
              <div className="w-8 h-8 rounded-lg bg-haas-red flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {item.step}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{item.title}</div>
                <div className="text-xs text-haas-silver mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Framework Selector + Copy */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-alpine-blue/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-alpine-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Generate Prompt</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-haas-silver uppercase tracking-wider font-medium">Framework:</span>
          {(["react-native", "flutter", "swiftui", "html"] as const).map((fw) => (
            <button
              key={fw}
              onClick={() => setFramework(fw)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                framework === fw
                  ? "bg-haas-red text-white"
                  : "bg-haas-gray text-haas-silver border border-haas-light/30 hover:text-white hover:border-haas-red/30"
              }`}
            >
              {fw === "react-native" ? "React Native" : fw === "flutter" ? "Flutter" : fw === "swiftui" ? "SwiftUI" : "HTML/Tailwind"}
            </button>
          ))}
        </div>

        <div className="relative">
          <pre className="bg-haas-dark border border-haas-light/20 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto max-h-64 overflow-y-auto font-mono leading-relaxed whitespace-pre-wrap">
            {fullPrompt + frameworkSuffix[framework]}
          </pre>
          <button
            onClick={handleCopy}
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              copied
                ? "bg-green-600 text-white"
                : "bg-haas-red/80 hover:bg-haas-red text-white"
            }`}
          >
            {copied ? "Copied!" : "Copy Prompt"}
          </button>
        </div>
      </div>

      {/* Rule Sections */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-alpine-pink/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-alpine-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">Prompt Rules Breakdown</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promptSections.map((section, idx) => (
            <button
              key={section.title}
              onClick={() => setActiveSection(activeSection === idx ? null : idx)}
              className={`text-left p-4 rounded-lg border transition-all ${colorMap[section.color]} ${
                activeSection === idx ? "ring-1 ring-white/20" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${dotColorMap[section.color]}`} />
                <h3 className={`text-xs font-bold uppercase tracking-wider ${textColorMap[section.color]}`}>
                  {section.title}
                </h3>
                <span className="ml-auto text-[10px] text-haas-silver bg-haas-gray/50 px-1.5 py-0.5 rounded">
                  {section.rules.length} rules
                </span>
              </div>
              <div className={`space-y-1.5 ${activeSection === idx ? "" : "max-h-20 overflow-hidden"}`}>
                {section.rules.map((rule, rIdx) => (
                  <div key={rIdx} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-haas-silver mt-0.5 flex-shrink-0">→</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
              {activeSection !== idx && section.rules.length > 3 && (
                <div className="text-[10px] text-haas-silver mt-2 uppercase tracking-wider">
                  Click to expand...
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Workflow */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-alpine-cyan/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-alpine-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">Workflow</h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {[
            { label: "Design / Dribbble / Figma", icon: "🎨" },
            { label: "Screenshot", icon: "📱" },
            { label: "AI + Prompt", icon: "🤖" },
            { label: "Working UI Code", icon: "💻" },
          ].map((step, idx) => (
            <div key={step.label} className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-haas-gray border border-haas-light/30">
                <span className="text-base">{step.icon}</span>
                <span className="text-xs font-medium text-white">{step.label}</span>
              </div>
              {idx < 3 && (
                <svg className="w-4 h-4 text-haas-silver flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">Pro Tips</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { tip: "Use high-resolution screenshots (2x or 3x) for better color and detail extraction." },
            { tip: "Crop to a single screen — multi-screen inputs reduce accuracy." },
            { tip: "For complex screens, break into sections and generate each separately." },
            { tip: "Specify your target framework in the prompt suffix for framework-specific output." },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-haas-gray/30 border border-haas-light/10">
              <span className="text-yellow-400 text-xs mt-0.5 flex-shrink-0">★</span>
              <span className="text-xs text-gray-300">{item.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
