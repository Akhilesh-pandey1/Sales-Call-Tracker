import appConfigJson from "../../config.json";

const maxLeadUploadMb: number = appConfigJson.maxLeadUploadMb;
const backendBaseUrl: string = appConfigJson.backendBaseUrl;

export { maxLeadUploadMb, backendBaseUrl };
