"use client";
export function trackEvent(event:string,payload:Record<string,string|number|boolean|undefined>={}){if(typeof window==="undefined")return;window.dataLayer=window.dataLayer||[];window.dataLayer.push({event,...payload})}
