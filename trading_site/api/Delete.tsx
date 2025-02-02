import axios from "axios"
export const Delete = async (url: string, id: number) => {
    await axios(url, {
        method: "DELETE",
        data: { id },
    })
}