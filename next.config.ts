import type { NextConfig } from "next";
import userConfig from './clouduser.next.config';

// Webflow basePath is no longer needed - using root path for all deployments
// Removed basePath and assetPrefix overrides to fix API route conflicts

export default userConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
