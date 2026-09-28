export function serializeJsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');}
export function publicSiteUrl(){return process.env.NEXT_PUBLIC_BASE_URL||'https://dreamscapetrek.com';}
export function absolutePublicUrl(path:string){return new URL(path,publicSiteUrl()).href;}
