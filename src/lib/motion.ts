export const MOTION_STORAGE_KEY = "wilfoo-motion";

/**
 * Runs before hydration. Full motion is the default; visitors can opt into
 * "follow system" from the footer, which stores `"system"` and skips this
 * override. When active, the JS animation libraries (Lenis + Framer Motion)
 * see `prefers-reduced-motion: no-preference`; CSS media queries are left
 * untouched. This avoids a one-by-one rewrite of every animation.
 */
export const motionScript = `(function(){try{if(localStorage.getItem("${MOTION_STORAGE_KEY}")==="system")return;var o=window.matchMedia;window.matchMedia=function(q){if(q==="(prefers-reduced-motion)"||q==="(prefers-reduced-motion: reduce)"){var m=o.call(window,q);try{Object.defineProperty(m,"matches",{configurable:true,get:function(){return false}})}catch(e){}return m}return o.call(window,q)}}catch(e){}})();`;
