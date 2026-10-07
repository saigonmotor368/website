"use client";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackEvent } from "@/lib/tracking";
type Props=AnchorHTMLAttributes<HTMLAnchorElement>&{eventName:string;placement:string;children:ReactNode};
export default function TrackedAnchor({eventName,placement,children,onClick,...props}:Props){return <a {...props} onClick={(event)=>{trackEvent(eventName,{placement});onClick?.(event)}}>{children}</a>}
