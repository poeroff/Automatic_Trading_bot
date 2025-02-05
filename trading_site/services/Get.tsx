import axios from "axios";

export const Get = async (url: string) => {
    try {
      const response = await axios.get(url);
      return response.data
   
    } catch (err) {
      console.error(err);
    }
}