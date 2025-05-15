import axios from "axios";
import axiosRetry from "axios-retry";
import http from 'http';
import https from 'https';
import { sleep } from "./sleep";




export async function Get(url: string, headers: any, params: any) {
    axiosRetry(axios, {
        retries: 3,
        retryDelay: (retryCount) => retryCount * 1000,
        retryCondition: (error) => axiosRetry.isNetworkOrIdempotentRequestError(error),
      });
    const response = await axios.get(url, { headers, params, })
    await sleep(500);
    return response
   

}