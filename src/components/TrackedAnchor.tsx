"use client";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackEvent } from "@/lib/tracking";
type Props=AnchorHTMLAttributes<HTMLAnchorElement>&{
  eventName:string;
  placement:string;
  eventData?:Record<string,string|number|boolean|undefined>;
  children:ReactNode;
};
export default function TrackedAnchor({eventName,placement,eventData,children,onClick,...props}:Props){return <a {...props} onClick={(event)=>{trackEvent(eventName,{placement,...eventData});onClick?.(event)}}>{children}</a>}
