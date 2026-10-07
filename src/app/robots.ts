import type { MetadataRoute } from "next";
export default function robots():MetadataRoute.Robots{return{rules:{userAgent:"*",allow:"/",disallow:["/bao-gia","/dang-nhap-noi-bo","/api/","/thank-you"]},sitemap:"https://saigonmotor.vn/sitemap.xml",host:"https://saigonmotor.vn"}}
