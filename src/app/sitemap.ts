import type { MetadataRoute } from "next";
const base="https://saigonmotor.vn";
export default function sitemap():MetadataRoute.Sitemap{return [
  {url:base,lastModified:new Date(),changeFrequency:"weekly",priority:1},
  {url:`${base}/thu-tuc-sang-ten-xe`,lastModified:new Date(),changeFrequency:"monthly",priority:.9},
  {url:`${base}/thu-tuc-thu-hoi-dang-ky`,lastModified:new Date(),changeFrequency:"monthly",priority:.9},
  {url:`${base}/phap-ly-cam-ket`,lastModified:new Date(),changeFrequency:"yearly",priority:.5},
  {url:`${base}/chinh-sach-bao-mat`,lastModified:new Date(),changeFrequency:"yearly",priority:.3},
]}
