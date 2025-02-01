import axios from "axios";

export const fetchStockData = async (stockCode: string) => {
    try {
      const response = await axios.get(stockCode);
      console.log(response.data)
      return response.data
   
    } catch (err) {
      console.error(err);
    }
}