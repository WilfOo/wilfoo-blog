"use client";

import { useEffect } from "react";

/** Adds a copy button to every highlighted code block after mount. */
export function CodeCopy() {
  useEffect(() => {
    const figures = Array.from(
      document.querySelectorAll<HTMLElement>("article figure[data-rehype-pretty-code-figure]"),
    );

    const cleanups: Array<() => void> = [];

    for (const figure of figures) {
      if (figure.querySelector(".code-copy")) continue;
      const pre = figure.querySelector("pre");
      if (!pre) continue;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = "COPY";
      button.setAttribute("aria-label", "复制代码");

      const onClick = async () => {
        const text = pre.innerText.replace(/\n$/, "");
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const area = document.createElement("textarea");
          area.value = text;
          area.style.position = "fixed";
          area.style.opacity = "0";
          document.body.appendChild(area);
          area.select();
          document.execCommand("copy");
          area.remove();
        }
        button.textContent = "COPIED";
        button.dataset.copied = "true";
        window.setTimeout(() => {
          button.textContent = "COPY";
          delete button.dataset.copied;
        }, 1600);
      };

      button.addEventListener("click", onClick);
      figure.appendChild(button);
      cleanups.push(() => {
        button.removeEventListener("click", onClick);
        button.remove();
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
