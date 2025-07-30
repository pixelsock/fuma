import type { NextConfig } from "next";
import userConfig from './clouduser.next.config';

const webflowOverrides: NextConfig = {
  basePath: "/articles",
  assetPrefix: "https://c33a6979-70b3-4cb8-b0d0-4a877a09cf77.wf-app-prod.cosmic.webflow.services/articles",
};

for (const [key, value] of Object.entries(webflowOverrides)) {
  userConfig[key] = value;
}

export default userConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
