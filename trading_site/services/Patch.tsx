export const Patch = async (url: string, body: any) => {
    const response = await fetch(url, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}