import axios from "axios"
export const Post = async (url: string, date: number, code?: string, name?: string) => {
    try {
        const response = await axios(url, {
            method: "POST",
            data: { date, code, name },
        })
        return response.data

    } catch (error) {
        console.error("Error fetching data:", error)
        throw error
    }
}


